#!/usr/bin/env node
/**
 * Generates `skills/references/api-cheatsheet.md` from the TypeDoc reflections that
 * `npm run doc` already produces.
 *
 * Why generate it: the skill's job is to stop an agent from guessing a method name. The
 * best defence is a complete, exact list of the public surface — but a hand-written list
 * drifts. Generating it from the published declarations means it cannot.
 *
 * Run via `npm run doc` (after TypeDoc writes `.typedoc/reflections.json`).
 *
 * Pass `--check` to verify the committed file is current instead of rewriting it; that is
 * what `npm run docs:check` uses, so a hand edit or a stale build fails CI.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectAnchors, formatSignature, formatType } from './render-api-docs.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const reflectionsPath = path.join(rootDir, '.typedoc/reflections.json')
const outputPath = path.join(rootDir, 'skills/references/api-cheatsheet.md')

/** TypeDoc reflection kinds used below. */
const KIND = {
    Class: 128,
    Function: 64,
    TypeAlias: 2097152,
    Method: 2048,
    Accessor: 262144,
    Property: 1024,
}

/** First sentence of a reflection's summary, for the one-line description. */
function firstSentence(reflection) {
    const comment = reflection.comment ?? reflection.signatures?.[0]?.comment
    const summary = (comment?.summary ?? [])
        .map((part) => part.text ?? '')
        .join('')
        .replace(/\s+/g, ' ')
        .trim()
    if (!summary) {
        return ''
    }
    const end = summary.indexOf('. ')
    return end === -1 ? summary : summary.slice(0, end + 1)
}

/** Renders one member as a `- ` bullet, or undefined when it has nothing to show. */
function memberLine(member, anchors) {
    const description = firstSentence(member)
    const suffix = description ? ` — ${description}` : ''

    if (member.kind === KIND.Method) {
        const signatures = (member.signatures ?? []).map((signature) => formatSignature(signature, anchors))
        if (signatures.length === 0) {
            return undefined
        }
        const isStatic = member.flags?.isStatic ? 'static ' : ''
        const [first, ...rest] = signatures
        const overloads = rest.length ? ` _(+${rest.length} overload${rest.length > 1 ? 's' : ''})_` : ''
        return `- \`${isStatic}${first}\`${suffix}${overloads}`
    }

    if (member.kind === KIND.Accessor) {
        const type = member.getSignature?.type ?? member.setSignature?.parameters?.[0]?.type
        const writable = member.setSignature ? ' (read/write)' : ' (read-only)'
        const formatted = type ? formatType(type, anchors) : 'unknown'
        return `- \`${member.name}: ${formatted}\`${writable}${suffix}`
    }

    if (member.kind === KIND.Property) {
        const type = member.type ? formatType(member.type, anchors) : 'unknown'
        const isStatic = member.flags?.isStatic ? 'static ' : ''
        return `- \`${isStatic}${member.name}: ${type}\`${suffix}`
    }

    return undefined
}

/** Builds the Markdown for one exported class. */
function renderClass(reflection, anchors) {
    const lines = [`### \`${reflection.name}\``, '']

    const description = firstSentence(reflection)
    if (description) {
        lines.push(description, '')
    }

    const own = []
    const inherited = []
    for (const child of reflection.children ?? []) {
        const line = memberLine(child, anchors)
        if (!line) {
            continue
        }
        if (child.inheritedFrom) {
            // TypeDoc reports a qualified name here, e.g. "JJEx.ref" — the class is the prefix.
            inherited.push({ line, from: child.inheritedFrom.name.split('.')[0] })
        } else {
            own.push(line)
        }
    }

    lines.push('Members declared on this class:', '')
    lines.push(...(own.length ? own : ['_None._']))

    if (inherited.length) {
        // Inherited members are listed by name only: they are documented in full on the
        // class that declares them, and repeating signatures would double the file.
        const byOrigin = new Map()
        for (const { line, from } of inherited) {
            if (!byOrigin.has(from)) {
                byOrigin.set(from, [])
            }
            byOrigin.get(from).push(line)
        }
        lines.push('', 'Inherited members (see the declaring class for signatures):', '')
        for (const [from, group] of byOrigin) {
            const names = group.map((line) => /`([^`(]+)/.exec(line)?.[1] ?? line).join(', ')
            lines.push(`- from \`${from}\`: ${names}`)
        }
    }

    lines.push('')
    return lines
}

/** Builds the Markdown for one exported function. */
function renderFunction(reflection, anchors) {
    const signatures = (reflection.signatures ?? []).map((signature) => formatSignature(signature, anchors))
    const description = firstSentence(reflection)
    const suffix = description ? ` — ${description}` : ''
    return [`### \`${reflection.name}\``, '', `- \`${signatures[0]}\`${suffix}`, '']
}

function renderTypeAlias(reflection, anchors) {
    const type = reflection.type ? formatType(reflection.type, anchors) : 'unknown'
    const description = firstSentence(reflection)
    const suffix = description ? ` — ${description}` : ''
    return [`### \`${reflection.name}\``, '', `- \`type ${reflection.name} = ${type}\`${suffix}`, '']
}

function main() {
    if (!fs.existsSync(reflectionsPath)) {
        console.error(`✖ Missing ${path.relative(rootDir, reflectionsPath)}. Run "npm run build" first.`)
        process.exit(1)
    }

    const project = JSON.parse(fs.readFileSync(reflectionsPath, 'utf8'))
    const anchors = collectAnchors(project)

    const classes = []
    const functions = []
    const typeAliases = []
    for (const child of project.children ?? []) {
        if (child.kind === KIND.Class) {
            classes.push(child)
        } else if (child.kind === KIND.Function) {
            functions.push(child)
        } else if (child.kind === KIND.TypeAlias) {
            typeAliases.push(child)
        }
    }

    const lines = [
        '# JJ API Cheatsheet',
        '',
        '<!-- Generated by scripts/generate-cheatsheet.js from the published type declarations.',
        '     Do not edit by hand: run `npm run build`. -->',
        '',
        'One line per public member, with the exact signature. Use it to confirm that a method',
        'exists and to check its parameters before reaching for `.ref` — see `ref-gap.md` for',
        'the native APIs that have no JJ equivalent.',
        '',
        'Every mutating method returns `this`, so calls chain.',
        '',
        '## Classes',
        '',
    ]

    for (const reflection of classes) {
        lines.push(...renderClass(reflection, anchors))
    }

    if (typeAliases.length) {
        lines.push('## Types', '')
        for (const reflection of typeAliases) {
            lines.push(...renderTypeAlias(reflection, anchors))
        }
    }
    if (functions.length) {
        lines.push('## Functions', '')
        for (const reflection of functions) {
            lines.push(...renderFunction(reflection, anchors))
        }
    }

    const markdown = `${lines.join('\n').trimEnd()}\n`
    const relative = path.relative(rootDir, outputPath)

    if (process.argv.includes('--check')) {
        const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : ''
        if (current !== markdown) {
            console.error(`✖ ${relative} is out of date. Run "npm run build" to regenerate it.`)
            process.exit(1)
        }
        console.log(`✔ ${relative} is up to date`)
        return
    }

    fs.writeFileSync(outputPath, markdown)
    console.log(
        `✔ Wrote ${relative} — ${classes.length} classes, ` +
            `${functions.length} functions, ${typeAliases.length} types`,
    )
}

main()
