#!/usr/bin/env node
/**
 * Verifies that the documentation still tells the truth.
 *
 * Every fenced `ts`/`js` block in the agent-facing docs is compiled against the
 * published type declarations in `lib/bundle.d.ts`, and every relative Markdown
 * link must resolve on disk.
 *
 * Why this exists: the docs are the product for an LLM-facing library. A snippet
 * that references a method that does not exist, or calls a factory with the wrong
 * argument, teaches the model a bug that no test will ever catch.
 *
 * How a snippet is checked:
 * - Its own `import ... from 'jj'` lines are removed and validated against the
 *   real export list, so a snippet cannot import a symbol jj does not export.
 * - A preamble importing every public symbol is prepended, so a snippet may use
 *   `JJHE` without repeating the import line (the usual docs style) and is still
 *   checked against the real type.
 * - Names the snippet never defines (`doc.find('.card')`) are declared as `any`
 *   so that doc fragments typecheck instead of failing on their surroundings.
 * - Doc blocks are often *fragments* of a larger file. Each block is compiled
 *   with the first of these strategies that works: as a module, as the body of an
 *   `async function` with `this: any`, then as a class body. Cross-block private
 *   fields (`#jjShadow`) are therefore expected and not reported.
 *
 * Scope: `README.md`, `guides/**`, `skills/**`. The `www/` site is excluded from
 * link checks because it resolves links through its own alias table at runtime.
 *
 * Mark a block as illustrative pseudo-code by placing this line immediately above
 * the opening fence:
 *
 *     [//]: # (docs-check: ignore — reason)
 *
 * Usage: npm run docs:check [--keep]   (run `npm run build` first)
 *   --keep  leave the generated snippets on disk for inspection
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dtsPath = path.join(rootDir, 'lib/bundle.d.ts')

/** Docs that are checked for compilable snippets and resolvable links. */
const DOC_ENTRIES = ['README.md', 'llms.txt', 'guides', 'skills', 'www/tutorial']

/** Fence languages treated as TypeScript/JavaScript. */
const CODE_LANGS = new Set(['ts', 'typescript', 'js', 'javascript'])

/**
 * Opt-out marker for illustrative blocks. Written as a Markdown link reference
 * definition so it renders as nothing: the site renders with `html: false`, where
 * an HTML comment would show up as visible text.
 *
 * Prettier normalizes the definition title from `(reason)` to `'reason'`, so both
 * forms are accepted.
 */
const IGNORE_MARKER = /^\[\/\/\]:\s*#\s*\(?\s*['"]?docs-check:\s*ignore/i

/**
 * A marker line must be a single well-formed reference definition. Nested
 * parentheses in the reason (`closest()` inside `( ... )`) break the definition and
 * leak the marker into the rendered page, so they are rejected.
 */
const ANY_MARKER = /docs-check:\s*ignore/i
const WELL_FORMED_MARKER = /^\[[^\]]*\]:\s*#\s*(?:\([^()]*\)|'[^']*'|"[^"]*")$/

/** Links that are not files on disk. */
const NON_FILE_LINK = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i

/**
 * Diagnostics that mean "this block is a fragment, not a program".
 * Doc snippets routinely show a class body (`static observedAttributes = [...]`),
 * use `this` inside a component method, or reference `#private` fields declared in
 * a neighbouring block.
 */
/**
 * Diagnostics that mean "this block cannot be a module", so another rendering
 * strategy is tried. Doc snippets routinely show a class body, or a method body
 * that belongs to the component described earlier in the guide.
 */
const FRAGMENT_CODES = new Set([1005, 1068, 1127, 1128, 1146, 1248, 1434, 2364, 2532, 2683])

/**
 * Diagnostics that are expected for a fragment and must not be reported:
 * - a `#private` field declared in a neighbouring block,
 * - `this.#field` used from a plain function body,
 * - a sibling module that only exists in the reader's own project.
 */
const FRAGMENT_CONTEXT = [
    /Property '#[\w$]+' does not exist/,
    /Private identifiers are not allowed outside class bodies/,
    /Cannot find module '\.{1,2}\//,
]

/** Codes that mean "name is not defined" and can be stubbed as `any`. */
const UNDEFINED_NAME_CODES = new Set([2304, 2592, 2593])

/** Name of the function/class used to host fragments. */
const FRAGMENT_NAME = '__DocSnippet'

/** File holding the generated stubs for undefined names. */
const GLOBALS_FILE = 'doc-globals.d.ts'

/** How a snippet is rendered before compilation, in order of preference. */
const STRATEGIES = ['module', 'function', 'class']

function listMarkdownFiles(entry) {
    const absolute = path.join(rootDir, entry)
    if (!fs.existsSync(absolute)) {
        return []
    }
    if (fs.statSync(absolute).isFile()) {
        return [absolute]
    }
    return fs
        .readdirSync(absolute, { recursive: true })
        .map((name) => path.join(absolute, name))
        .filter((name) => (name.endsWith('.md') || path.basename(name) === 'llms.txt') && fs.statSync(name).isFile())
        .sort()
}

/**
 * Reads the public export list from the generated declaration bundle.
 * @returns {{ values: Set<string>, types: Set<string> }}
 */
function readPublicExports() {
    const declaration = fs.readFileSync(dtsPath, 'utf8')
    const values = new Set()
    const types = new Set()

    for (const match of declaration.matchAll(/^export\s*\{([^}]*)\}/gm)) {
        for (const raw of match[1].split(',')) {
            const entry = raw.trim()
            const isType = /^type\s+/.test(entry)
            const name = entry.replace(/^type\s+/, '')
            if (name) {
                ;(isType ? types : values).add(name)
            }
        }
    }
    return { values, types }
}

/**
 * Extracts fenced code blocks from a Markdown file.
 * @returns {{ code: string, line: number, index: number }[]}
 */
/**
 * True when the ignore marker sits above the fence, ignoring blank lines.
 */
function hasIgnoreMarker(lines, fenceIndex) {
    for (let index = fenceIndex - 1; index >= 0; index--) {
        const line = lines[index].trim()
        if (IGNORE_MARKER.test(line)) {
            return true
        }
        if (line !== '') {
            return false
        }
    }
    return false
}

function extractCodeBlocks(filePath) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n')
    const blocks = []
    let fence = null

    for (const [index, line] of lines.entries()) {
        if (!fence) {
            const opening = /^```(\S*)\s*$/.exec(line)
            if (opening) {
                fence = {
                    lang: opening[1].toLowerCase(),
                    ignored: hasIgnoreMarker(lines, index),
                    startLine: index + 2,
                    body: [],
                }
            }
            continue
        }

        if (line.trimEnd() === '```') {
            if (CODE_LANGS.has(fence.lang) && !fence.ignored) {
                blocks.push({
                    code: fence.body.join('\n'),
                    lang: fence.lang,
                    line: fence.startLine,
                    index: blocks.length + 1,
                })
            }
            fence = null
            continue
        }

        fence.body.push(line)
    }

    return blocks
}

/**
 * A `js` fence must be valid JavaScript: Prettier re-parses those blocks with a JS
 * grammar and silently mangles TS-only syntax such as `x as T` or `fn<T>()`.
 * @returns A message when the block is not valid JavaScript, otherwise undefined.
 */
function findJavaScriptSyntaxError(snippet) {
    if (!['js', 'javascript'].includes(snippet.lang)) {
        return undefined
    }

    const parse = (code) => {
        const sourceFile = ts.createSourceFile('snippet.js', code, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS)
        return sourceFile.parseDiagnostics[0]
    }

    // A block may be a class body rather than a program, so try both shapes.
    const programDiagnostic = parse(snippet.code)
    if (!programDiagnostic) {
        return undefined
    }
    if (!parse(`class __DocSnippet extends HTMLElement {\n${snippet.code}\n}`)) {
        return undefined
    }

    const message = ts.flattenDiagnosticMessageText(programDiagnostic.messageText, '\n').replace(/\n/g, ' ')
    return `not valid JavaScript (${message}); use a \`ts\` fence if the block needs types`
}

/**
 * Removes import lines whose bindings the preamble already provides, and reports
 * names that jj does not export.
 *
 * A snippet may import from `jj`, from a CDN URL, or from `../src/index.js`; all of
 * those resolve to the same public surface. Imports of the reader's own modules
 * (`./my-card.js`) are kept.
 */
function stripJjImports(code, publicExports, problems) {
    const isPublic = (name) => publicExports.values.has(name) || publicExports.types.has(name)
    const kept = []

    for (const line of code.split('\n')) {
        const match = /^\s*import\s+(?:type\s+)?(.+?)\s*from\s*['"]([^'"]+)['"]/.exec(line)
        if (!match) {
            kept.push(line)
            continue
        }

        const [, clause, specifier] = match
        if (specifier.startsWith('node:')) {
            continue
        }

        const isJjModule = specifier === 'jj' || /^[a-z][a-z0-9+.-]*:/i.test(specifier)
        const named = /\{([^}]*)\}/.exec(clause)?.[1]

        if (named === undefined) {
            // Default or namespace import. jj only has named exports.
            if (isJjModule) {
                problems.push(`uses \`${clause}\`, but jj only has named exports`)
                continue
            }
            kept.push(line)
            continue
        }

        const names = named
            .split(',')
            .map((raw) => raw.trim())
            .filter(Boolean)
        const localNames = names.map((raw) => raw.replace(/^type\s+/, '').replace(/\s+as\s+.+$/, ''))

        if (isJjModule) {
            for (const name of localNames) {
                if (name && !isPublic(name)) {
                    problems.push(`imports \`${name}\`, which jj does not export`)
                }
            }
            continue
        }

        // A relative import may still only re-export the public surface.
        const remaining = names.filter((raw, index) => !isPublic(localNames[index]))
        if (remaining.length === 0) {
            continue
        }
        kept.push(`import { ${remaining.join(', ')} } from '${specifier}'`)
    }
    return kept.join('\n')
}

function buildPreamble({ values, types }) {
    const lines = ['// injected by scripts/check-docs.js']
    if (values.size > 0) {
        lines.push(`import { ${[...values].sort().join(', ')} } from 'jj'`)
    }
    if (types.size > 0) {
        lines.push(`import type { ${[...types].sort().join(', ')} } from 'jj'`)
    }
    return `${lines.join('\n')}\n`
}

function renderSnippet(body, strategy) {
    switch (strategy) {
        case 'function':
            return `async function ${FRAGMENT_NAME}(this: any) {\n${body}\n}\n`
        case 'class':
            // Extending HTMLElement gives fragments the host-element API they assume
            // (`this.addEventListener`, `this.dispatchEvent`, `attr2prop(this, ...)`).
            return `class ${FRAGMENT_NAME} extends HTMLElement {\n${body}\n}\n`
        default:
            return `${body}\n`
    }
}

function snippetFileName(snippet) {
    const relative = path.relative(rootDir, snippet.source).replace(/[^\w.-]+/g, '_')
    return `snippet-${String(snippet.index).padStart(3, '0')}-${relative}-L${snippet.line}.ts`
}

/**
 * Writes snippet files using each snippet's assigned strategy.
 * @returns {{ problemsByFile: Map<string, string[]> }}
 */
function writeSnippets(snippetDir, snippets, publicExports) {
    const problemsByFile = new Map()

    for (const snippet of snippets) {
        const problems = []
        const body = stripJjImports(snippet.code, publicExports, problems)
        if (problems.length > 0) {
            problemsByFile.set(snippet.snippetPath, problems)
        }
        const code = renderSnippet(body, snippet.strategy)
        fs.writeFileSync(path.join(snippetDir, snippetFileName(snippet)), `${buildPreamble(publicExports)}${code}`)
    }

    return { problemsByFile }
}

function writeTsConfig(snippetDir) {
    const config = {
        compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'Bundler',
            lib: ['ES2022', 'DOM', 'DOM.Iterable'],
            strict: false,
            noImplicitThis: true,
            noEmit: true,
            skipLibCheck: true,
            types: [],
            baseUrl: '.',
            paths: { jj: [dtsPath] },
        },
        include: ['*.ts'],
    }
    fs.writeFileSync(path.join(snippetDir, 'tsconfig.json'), JSON.stringify(config, null, 4))
}

/**
 * Runs the TypeScript compiler over the snippet directory.
 * @returns {import('typescript').Diagnostic[]}
 */
function compile(snippetDir) {
    const configPath = path.join(snippetDir, 'tsconfig.json')
    const { config } = ts.readConfigFile(configPath, ts.sys.readFile)
    const parsed = ts.parseJsonConfigFileContent(config, ts.sys, snippetDir)
    const program = ts.createProgram(parsed.fileNames, parsed.options)

    return ts.getPreEmitDiagnostics(program).filter((diagnostic) => {
        const fileName = diagnostic.file?.fileName
        if (!fileName) {
            return false
        }
        return path.dirname(fileName) === snippetDir && path.basename(fileName) !== GLOBALS_FILE
    })
}

function diagnosticMessage(diagnostic) {
    return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n').replace(/\n/g, ' ')
}

function snippetFileOf(snippet, snippetDir) {
    return path.resolve(snippetDir, snippetFileName(snippet))
}

/**
 * Re-renders fragments with the next strategy until nothing is left to retry.
 * @returns {import('typescript').Diagnostic[]} Diagnostics for the final rendering.
 */
function resolveStrategies(snippetDir, snippets, publicExports) {
    const snippetByFile = new Map(snippets.map((snippet) => [snippetFileOf(snippet, snippetDir), snippet]))
    let diagnostics = compile(snippetDir)

    for (const strategy of STRATEGIES.slice(1)) {
        const retry = new Set()
        for (const diagnostic of diagnostics) {
            const snippet = diagnostic.file ? snippetByFile.get(path.resolve(diagnostic.file.fileName)) : undefined
            if (!snippet || !FRAGMENT_CODES.has(diagnostic.code)) {
                continue
            }
            if (STRATEGIES.indexOf(snippet.strategy) < STRATEGIES.indexOf(strategy)) {
                retry.add(snippet)
            }
        }
        if (retry.size === 0) {
            break
        }
        for (const snippet of retry) {
            snippet.strategy = strategy
        }
        writeSnippets(snippetDir, [...retry], publicExports)
        diagnostics = compile(snippetDir)
    }

    return diagnostics
}

/**
 * Declares names the snippets never define so that doc fragments typecheck.
 * @returns How many new declarations were added.
 */
function declareUnknowns(snippetDir, diagnostics, declared) {
    let added = 0

    for (const diagnostic of diagnostics) {
        if (!UNDEFINED_NAME_CODES.has(diagnostic.code)) {
            continue
        }
        const name = /Cannot find name '([^']+)'/.exec(diagnosticMessage(diagnostic))?.[1]
        if (name && !declared.has(name)) {
            declared.add(name)
            added++
        }
    }

    if (added === 0) {
        return 0
    }

    const declarations = [...declared]
        .sort()
        .map((name) => `declare const ${name}: any\ntype ${name} = any`)
        .join('\n')
    fs.writeFileSync(path.join(snippetDir, GLOBALS_FILE), `// generated by scripts/check-docs.js\n${declarations}\n`)
    return added
}

function checkLinks(files) {
    const broken = []
    for (const filePath of files) {
        const source = fs.readFileSync(filePath, 'utf8')
        for (const match of source.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
            const target = match[1]
            if (NON_FILE_LINK.test(target)) {
                continue
            }
            const fileTarget = decodeURIComponent(target.split('#')[0].split('?')[0])
            if (!fileTarget) {
                continue
            }
            if (!fs.existsSync(path.resolve(path.dirname(filePath), fileTarget))) {
                broken.push({ file: path.relative(rootDir, filePath), target })
            }
        }
    }
    return broken
}

/**
 * Finds marker lines that would not render as nothing, so they cannot leak onto the
 * published page.
 * @returns {{ file: string, line: number, text: string }[]}
 */
function checkMarkers(files) {
    const malformed = []
    for (const filePath of files) {
        const lines = fs.readFileSync(filePath, 'utf8').split('\n')
        for (const [index, line] of lines.entries()) {
            const trimmed = line.trim()
            if (ANY_MARKER.test(trimmed) && !WELL_FORMED_MARKER.test(trimmed)) {
                malformed.push({ file: path.relative(rootDir, filePath), line: index + 1, text: trimmed })
            }
        }
    }
    return malformed
}

function main() {
    if (!fs.existsSync(dtsPath)) {
        console.error(`✖ Missing ${path.relative(rootDir, dtsPath)}. Run "npm run build" before "npm run docs:check".`)
        process.exit(1)
    }

    const publicExports = readPublicExports()
    const markdownFiles = DOC_ENTRIES.flatMap(listMarkdownFiles)

    const snippets = []
    for (const source of markdownFiles) {
        for (const block of extractCodeBlocks(source)) {
            snippets.push({ ...block, strategy: STRATEGIES[0], source, snippetPath: path.relative(rootDir, source) })
        }
    }

    const snippetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jj-docs-check-'))
    const keep = process.argv.includes('--keep')
    if (keep) {
        console.error(`ℹ snippets written to ${snippetDir}`)
    }

    // Guard against a vacuously green run: a broken glob or a moved directory
    // would otherwise make this check silently stop checking anything.
    const MIN_SNIPPETS = 150
    if (snippets.length < MIN_SNIPPETS) {
        console.error(`✖ Only ${snippets.length} snippets found (expected at least ${MIN_SNIPPETS}).`)
        console.error('  Check DOC_ENTRIES in scripts/check-docs.js against the current docs layout.')
        process.exit(1)
    }

    writeTsConfig(snippetDir)
    const { problemsByFile } = writeSnippets(snippetDir, snippets, publicExports)

    const snippetByFile = new Map(snippets.map((snippet) => [snippetFileOf(snippet, snippetDir), snippet]))

    let diagnostics = resolveStrategies(snippetDir, snippets, publicExports)

    const declared = new Set()
    for (let round = 0; round < 3; round++) {
        if (declareUnknowns(snippetDir, diagnostics, declared) === 0) {
            break
        }
        diagnostics = compile(snippetDir)
    }

    const failures = new Map()
    const addFailure = (key, message) => {
        if (!failures.has(key)) {
            failures.set(key, [])
        }
        failures.get(key).push(message)
    }

    for (const [snippetPath, problems] of problemsByFile) {
        for (const problem of problems) {
            addFailure(snippetPath, problem)
        }
    }

    for (const snippet of snippets) {
        const syntaxError = findJavaScriptSyntaxError(snippet)
        if (syntaxError) {
            addFailure(`${snippet.snippetPath}:${snippet.line}`, syntaxError)
        }
    }

    for (const diagnostic of diagnostics) {
        const message = diagnosticMessage(diagnostic)
        if (FRAGMENT_CONTEXT.some((pattern) => pattern.test(message))) {
            continue
        }
        const snippet = diagnostic.file ? snippetByFile.get(path.resolve(diagnostic.file.fileName)) : undefined
        if (!snippet) {
            continue
        }
        addFailure(`${snippet.snippetPath}:${snippet.line}`, `TS${diagnostic.code}: ${message}`)
    }

    for (const link of checkLinks(markdownFiles)) {
        addFailure(link.file, `broken link: ${link.target}`)
    }

    for (const marker of checkMarkers(markdownFiles)) {
        addFailure(
            `${marker.file}:${marker.line}`,
            'malformed docs-check marker; use `[//]: # (docs-check: ignore — reason)` with no parentheses inside the reason',
        )
    }

    if (!keep) {
        fs.rmSync(snippetDir, { recursive: true, force: true })
    }

    if (failures.size === 0) {
        console.log(`✔ docs:check — ${snippets.length} snippets in ${markdownFiles.length} files, links OK`)
        return
    }

    for (const [key, messages] of failures) {
        console.error(`✖ ${key}`)
        for (const message of messages) {
            console.error(`    ${message}`)
        }
    }
    console.error(`\n✖ docs:check failed: ${failures.size} location(s).`)
    process.exit(1)
}

main()
