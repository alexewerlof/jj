import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { build } from 'esbuild'
import MarkdownIt from 'markdown-it'
import highlight from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import { ReflectionKind } from 'typedoc'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const reflectionsPath = path.join(rootDir, '.typedoc/reflections.json')
const outputPath = path.join(rootDir, 'doc/index.html')
const themeLabel = 'JJ'

for (const [name, language] of Object.entries({ javascript, typescript, xml, css, json, bash })) {
    highlight.registerLanguage(name, language)
}
highlight.registerAliases('js', { languageName: 'javascript' })
highlight.registerAliases('ts', { languageName: 'typescript' })
highlight.registerAliases('html', { languageName: 'xml' })

const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    highlight(code, language) {
        if (!language || !highlight.getLanguage(language)) {
            return ''
        }

        return highlight.highlight(code, { language }).value
    },
})

markdown.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
    const token = tokens[index]
    const href = token.attrGet('href') || ''
    const attributes =
        href.startsWith('http:') || href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''
    return `<a${renderer.renderAttrs(token)}${attributes}>`
}

function installDomGlobals(window) {
    for (const key of [
        'window',
        'location',
        'Document',
        'DocumentFragment',
        'ShadowRoot',
        'Node',
        'Text',
        'Element',
        'HTMLElement',
        'HTMLTemplateElement',
        'SVGElement',
        'EventTarget',
        'Event',
        'CustomEvent',
        'document',
        'customElements',
        'CSSStyleSheet',
    ]) {
        globalThis[key] = key === 'window' ? window : key === 'location' ? window.location : window[key]
    }

    globalThis.MathMLElement = class MathMLElement extends window.HTMLElement {}
}

function slug(value) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
}

function getKindName(reflection) {
    return ReflectionKind[reflection.kind] || 'Member'
}

function getTagText(tag) {
    return (tag.content || []).map((part) => part.text || '').join('')
}

function getSearchText(reflection) {
    const values = [reflection.name]
    const signatures = reflection.signatures || []
    const comments = [reflection.comment, ...signatures.map((signature) => signature.comment)]

    for (const comment of comments) {
        if (!comment) {
            continue
        }
        values.push((comment.summary || []).map((part) => part.text || '').join(''))
        values.push(...(comment.blockTags || []).map(getTagText))
    }

    for (const signature of signatures) {
        values.push(...(signature.typeParameters || []).map((parameter) => parameter.name))
        values.push(
            ...(signature.parameters || []).flatMap((parameter) => [
                parameter.name,
                parameter.type ? formatType(parameter.type) : '',
            ]),
        )
        if (signature.type) {
            values.push(formatType(signature.type))
        }
    }

    values.push(...(reflection.children || []).map(getSearchText))
    return values.filter(Boolean).join(' ').toLowerCase()
}

function commentPartsToMarkdown(parts, anchors) {
    return (parts || [])
        .map((part) => {
            if (part.kind !== 'inline-tag') {
                return part.text || ''
            }

            const label = part.text || part.target?.name || 'See reference'
            let target = part.target
            if (target && typeof target === 'object') {
                target = target.id
            }

            const href =
                typeof target === 'number'
                    ? `#${anchors.get(target) || 'api-overview'}`
                    : typeof target === 'string' && /^https?:\/\//i.test(target)
                      ? target
                      : null

            if (!href) {
                return label
            }

            return `[${label.replace(/[\\[\]]/g, '\\$&')}](${href})`
        })
        .join('')
}

function renderMarkdown(container, source, anchors) {
    if (source) {
        container.setHTML(markdown.render(commentPartsToMarkdown(source, anchors)), true)
    }
}

function renderComment(reflection, anchors, h) {
    const comment = reflection.comment
    if (!comment) {
        return null
    }

    const parts = []
    const summary = commentPartsToMarkdown(comment.summary, anchors)
    if (summary.trim()) {
        const summaryNode = h('div', { class: 'api-doc__summary' })
        renderMarkdown(summaryNode, [{ kind: 'text', text: summary }], anchors)
        parts.push(summaryNode)
    }

    for (const tag of comment.blockTags || []) {
        const tagName = tag.tag.slice(1)
        const label = tag.name ? `${tagName} ${tag.name}` : tagName
        const tagNode = h('section', { class: `api-doc__tag api-doc__tag--${slug(tagName)}` })
        tagNode.addChild(h('h4', { class: 'api-doc__tag-title' }, label))
        renderMarkdown(tagNode, tag.content, anchors)
        parts.push(tagNode)
    }

    return h('div', { class: 'api-doc__comment' }, ...parts)
}

function formatType(type, anchors, depth = 0) {
    if (!type || depth > 12) {
        return 'unknown'
    }

    const format = (child) => formatType(child, anchors, depth + 1)
    switch (type.type) {
        case 'intrinsic':
        case 'inferred':
        case 'unknown':
            return type.name || type.type
        case 'reference': {
            const name = type.name || 'unknown'
            const typeArguments = type.typeArguments?.map(format) || []
            return typeArguments.length ? `${name}<${typeArguments.join(', ')}>` : name
        }
        case 'union':
        case 'intersection':
            return (type.types || []).map(format).join(type.type === 'union' ? ' | ' : ' & ')
        case 'array':
            return `${format(type.elementType)}[]`
        case 'tuple':
            return `[${(type.elements || []).map(format).join(', ')}]`
        case 'literal':
            return typeof type.value === 'string' ? JSON.stringify(type.value) : String(type.value)
        case 'typeOperator':
            return `${type.operator} ${format(type.target)}`
        case 'indexedAccess':
            return `${format(type.objectType)}[${format(type.indexType)}]`
        case 'conditional':
            return `${format(type.checkType)} extends ${format(type.extendsType)} ? ${format(type.trueType)} : ${format(type.falseType)}`
        case 'query':
            return `typeof ${type.queryType}`
        case 'predicate':
            return `${type.asserts ? 'asserts ' : ''}${type.name}${type.targetType ? ` is ${format(type.targetType)}` : ''}`
        case 'rest':
            return `...${format(type.elementType)}`
        case 'optional':
            return `${format(type.elementType)}?`
        case 'namedTupleMember':
            return `${type.isOptional ? `${type.name}?` : type.name}: ${format(type.element)}`
        case 'reflection': {
            const signature = type.declaration?.signatures?.[0]
            return signature ? formatSignature(signature, anchors) : 'object'
        }
        case 'templateLiteral':
            return (
                '`' +
                (type.head || '') +
                (type.tail || []).map((part) => `\${${format(part.type)}}${part.tail || ''}`).join('') +
                '`'
            )
        case 'mapped':
            return `{ [${type.parameter} in ${format(type.parameterType)}]: ${format(type.templateType)} }`
        case 'typeParameter':
            return type.name || 'unknown'
        default:
            return type.name || 'unknown'
    }
}

function formatTypeParameters(parameters, anchors) {
    if (!parameters?.length) {
        return ''
    }

    return `<${parameters
        .map((parameter) => {
            const constraint = parameter.type ? ` extends ${formatType(parameter.type, anchors)}` : ''
            const defaultType = parameter.default ? ` = ${formatType(parameter.default, anchors)}` : ''
            return `${parameter.name}${constraint}${defaultType}`
        })
        .join(', ')}>`
}

function formatSignature(signature, anchors) {
    const parameters = (signature.parameters || []).map((parameter) => {
        const rest = parameter.flags?.isRest ? '...' : ''
        const optional = parameter.flags?.isOptional ? '?' : ''
        const type = parameter.type ? `: ${formatType(parameter.type, anchors)}` : ''
        return `${rest}${parameter.name}${optional}${type}`
    })
    const typeParameters = formatTypeParameters(signature.typeParameters, anchors)
    const returnType = signature.type ? `: ${formatType(signature.type, anchors)}` : ''
    return `${signature.name}${typeParameters}(${parameters.join(', ')})${returnType}`
}

function collectAnchors(project) {
    const anchors = new Map()
    const visit = (reflection, parentPath = []) => {
        const ownPath = [...parentPath, reflection.name || getKindName(reflection)]
        const ownAnchor = `api-${slug(ownPath.join('-'))}`
        if (reflection.id != null) {
            anchors.set(reflection.id, ownAnchor)
        }

        for (const [index, signature] of (reflection.signatures || []).entries()) {
            if (signature.id != null) {
                anchors.set(signature.id, `${ownAnchor}-overload-${index + 1}`)
            }
        }

        for (const child of reflection.children || []) {
            visit(child, ownPath)
        }
    }

    for (const reflection of project.children || []) {
        visit(reflection)
    }
    return anchors
}

function sourceLink(reflection, h) {
    const source = reflection.sources?.[0]
    if (!source?.url) {
        return null
    }

    return h(
        'a',
        {
            class: 'api-doc__source',
            href: source.url,
            target: '_blank',
            rel: 'noopener noreferrer',
        },
        `${source.fileName}:${source.line}`,
    )
}

function renderSignatureBlock(signature, anchors, h, overloadIndex = null) {
    const attributes = { class: 'api-doc__signature' }
    if (overloadIndex != null) {
        attributes.id = anchors.get(signature.id) || ''
    }

    const block = h('div', attributes)
    block.addChild(h('pre', { class: 'api-doc__signature-code' }, h('code', null, formatSignature(signature, anchors))))

    const comment = renderComment(signature, anchors, h)
    if (comment) {
        block.addChild(comment)
    }

    const source = sourceLink(signature, h)
    if (source) {
        block.addChild(source)
    }
    return block
}

function renderMember(member, parentPath, anchors, h) {
    const anchor = `api-${slug([...parentPath, member.name].join('-'))}`
    const visibility = [
        member.flags?.isInherited ? 'inherited' : '',
        member.flags?.isProtected ? 'protected' : '',
        member.flags?.isExternal ? 'external' : '',
    ]
        .filter(Boolean)
        .join(' ')
    const details = h('details', {
        id: anchor,
        class: 'api-doc__member',
        'data-visibility': visibility,
        'data-search': getSearchText(member),
    })
    details.addChild(
        h(
            'summary',
            null,
            h('span', { class: 'api-doc__member-kind' }, getKindName(member).toLowerCase()),
            h('code', null, member.name),
            member.flags?.isStatic ? h('span', { class: 'api-doc__badge' }, 'static') : '',
            member.flags?.isInherited ? h('span', { class: 'api-doc__badge' }, 'inherited') : '',
        ),
    )

    const comment = renderComment(member, anchors, h)
    if (comment) {
        details.addChild(comment)
    }

    if (member.signatures?.length) {
        member.signatures.forEach((signature, index) => {
            details.addChild(renderSignatureBlock(signature, anchors, h, member.signatures.length > 1 ? index : null))
        })
    } else if (member.getSignature || member.setSignature) {
        for (const signature of [member.getSignature, member.setSignature].filter(Boolean)) {
            details.addChild(renderSignatureBlock(signature, anchors, h))
        }
    } else if (member.type) {
        details.addChild(
            h(
                'pre',
                { class: 'api-doc__signature-code' },
                h(
                    'code',
                    null,
                    `${member.name}${member.flags?.isOptional ? '?' : ''}: ${formatType(member.type, anchors)}`,
                ),
            ),
        )
    }

    const source =
        member.signatures?.length || member.getSignature || member.setSignature ? null : sourceLink(member, h)
    if (source) {
        details.addChild(source)
    }
    return details
}

function renderReflection(reflection, category, anchors, h) {
    const anchor = anchors.get(reflection.id) || `api-${slug(reflection.name)}`
    const typeName = getKindName(reflection).toLowerCase()
    const section = h('section', {
        id: anchor,
        class: 'api-doc__symbol',
        'data-category': category,
        'data-visibility': [
            reflection.flags?.isInherited ? 'inherited' : '',
            reflection.flags?.isProtected ? 'protected' : '',
            reflection.flags?.isExternal ? 'external' : '',
        ]
            .filter(Boolean)
            .join(' '),
        'data-search': getSearchText(reflection),
    })
    section.addChild(
        h(
            'header',
            { class: 'api-doc__symbol-header' },
            h('p', { class: 'api-doc__eyebrow' }, `${category} / ${typeName}`),
            h('h2', null, h('a', { href: `#${anchor}` }, reflection.name)),
            reflection.extendedTypes?.length
                ? h(
                      'p',
                      { class: 'api-doc__extends' },
                      'extends ',
                      reflection.extendedTypes.map((type) => formatType(type, anchors)).join(', '),
                  )
                : '',
            reflection.implementedTypes?.length
                ? h(
                      'p',
                      { class: 'api-doc__extends' },
                      'implements ',
                      reflection.implementedTypes.map((type) => formatType(type, anchors)).join(', '),
                  )
                : '',
        ),
    )

    const comment = renderComment(reflection, anchors, h)
    if (comment) {
        section.addChild(comment)
    }

    if (reflection.signatures?.length) {
        reflection.signatures.forEach((signature, index) => {
            section.addChild(
                renderSignatureBlock(signature, anchors, h, reflection.signatures.length > 1 ? index : null),
            )
        })
    } else if (reflection.type) {
        section.addChild(
            h(
                'pre',
                { class: 'api-doc__signature-code' },
                h(
                    'code',
                    null,
                    `${typeName} ${reflection.name}${formatTypeParameters(reflection.typeParameters, anchors)} = ${formatType(reflection.type, anchors)}`,
                ),
            ),
        )
    }

    const source = reflection.signatures?.length ? null : sourceLink(reflection, h)
    if (source) {
        section.addChild(source)
    }

    const members = reflection.children || []
    if (members.length) {
        const memberIndex = h(
            'details',
            { class: 'api-doc__member-index' },
            h('summary', null, `Members (${members.length})`),
            h(
                'ul',
                null,
                ...members.map((member) =>
                    h(
                        'li',
                        null,
                        h('a', { href: `#api-${slug([reflection.name, member.name].join('-'))}` }, member.name),
                    ),
                ),
            ),
        )
        section.addChild(memberIndex)

        const memberList = h(
            'div',
            { class: 'api-doc__members' },
            ...members.map((member) => renderMember(member, [reflection.name], anchors, h)),
        )
        section.addChild(memberList)
    }

    return section
}

function renderHierarchy(reflections, anchors, h) {
    const classes = reflections.filter((reflection) => reflection.kind === ReflectionKind.Class)
    const knownNames = new Set(classes.map((reflection) => reflection.name))
    const hierarchy = h(
        'section',
        { id: 'api-hierarchy', class: 'api-doc__hierarchy' },
        h('h2', null, 'Class hierarchy'),
        h(
            'ul',
            null,
            ...classes.map((reflection) => {
                const baseNames = (reflection.extendedTypes || []).map((type) => type.name).filter(Boolean)
                const bases = baseNames.length ? baseNames.join(', ') : 'No documented base class'
                const baseLinks = baseNames.map((name) =>
                    knownNames.has(name) ? h('a', { href: `#api-${slug(name)}` }, name) : name,
                )
                return h(
                    'li',
                    null,
                    h('a', { href: `#${anchors.get(reflection.id)}` }, reflection.name),
                    h(
                        'span',
                        { class: 'api-doc__hierarchy-base' },
                        ' extends ',
                        ...(baseLinks.length ? baseLinks : [bases]),
                    ),
                )
            }),
        ),
    )
    return hierarchy
}

function getCategoryMap(project) {
    const byId = new Map((project.children || []).map((reflection) => [reflection.id, reflection]))
    const categories = (project.categories || []).map((category) => ({
        title: category.title,
        reflections: (category.children || []).map((id) => byId.get(id)).filter(Boolean),
    }))
    const categorized = new Set(
        categories.flatMap((category) => category.reflections.map((reflection) => reflection.id)),
    )
    const uncategorized = (project.children || []).filter((reflection) => !categorized.has(reflection.id))
    if (uncategorized.length) {
        categories.push({ title: 'Other', reflections: uncategorized })
    }
    return categories
}

function renderPage(project, h, anchors) {
    const categories = getCategoryMap(project)
    const navigation = h(
        'aside',
        { class: 'api-doc__sidebar', 'aria-label': 'API navigation' },
        h(
            'form',
            { id: 'api-search-form', class: 'api-doc__search', role: 'search' },
            h('input', {
                id: 'api-search',
                type: 'search',
                placeholder: 'Search API symbols',
                autocomplete: 'off',
                'aria-label': 'Search API symbols',
            }),
            h(
                'button',
                { type: 'submit', 'aria-label': 'Search', title: 'Search' },
                h('span', { 'aria-hidden': 'true' }, '🔍'),
            ),
        ),
        ...categories.map((category) =>
            h(
                'details',
                { class: 'api-doc__nav-group', open: '' },
                h('summary', null, category.title),
                h(
                    'ul',
                    null,
                    ...category.reflections.map((reflection) =>
                        h(
                            'li',
                            null,
                            h(
                                'a',
                                {
                                    class: 'api-doc__nav-link',
                                    href: `#${anchors.get(reflection.id)}`,
                                    'data-symbol': anchors.get(reflection.id),
                                    'data-search': getSearchText(reflection),
                                },
                                reflection.name,
                            ),
                        ),
                    ),
                ),
            ),
        ),
        h('a', { class: 'api-doc__hierarchy-link', href: '#api-hierarchy' }, 'Class hierarchy'),
        h('a', { class: 'api-doc__overview-link', href: '#api-overview' }, 'About JJ'),
    )

    const controls = h(
        'div',
        { class: 'api-doc__toolbar' },
        h('label', null, h('input', { type: 'checkbox', id: 'api-inherited', checked: 'checked' }), ' Inherited'),
        h('label', null, h('input', { type: 'checkbox', id: 'api-protected' }), ' Protected'),
        h('label', null, h('input', { type: 'checkbox', id: 'api-external' }), ' External'),
        h('button', { id: 'api-theme-toggle', type: 'button', 'aria-pressed': 'false' }, 'Light theme'),
    )

    const symbols = categories.flatMap((category) =>
        category.reflections.map((reflection) => renderReflection(reflection, category.title, anchors, h)),
    )
    const reference = h(
        'main',
        { class: 'api-doc__main', id: 'api-reference' },
        h(
            'header',
            { class: 'api-doc__page-header' },
            h('p', { class: 'api-doc__eyebrow' }, 'Just JavaScript'),
            h('h1', null, 'API reference'),
            h('p', null, 'Public classes, functions, and types.'),
        ),
        controls,
        h('p', { id: 'api-empty-state', class: 'api-doc__empty', hidden: '' }, 'No symbols match those filters.'),
        ...symbols,
        renderHierarchy(project.children || [], anchors, h),
        h(
            'details',
            { id: 'api-overview', class: 'api-doc__overview' },
            h('summary', null, 'About JJ'),
            (() => {
                const content = h('div', { class: 'api-doc__overview-content' })
                renderMarkdown(content, project.readme, anchors)
                return content
            })(),
        ),
        h(
            'footer',
            { class: 'api-doc__footer' },
            'Made in Sweden by ',
            h('a', { href: 'https://alexewerlof.com/', target: '_blank', rel: 'noopener noreferrer' }, 'Alex Ewerlöf'),
        ),
    )

    return h(
        'div',
        { class: 'api-doc' },
        h(
            'nav',
            { class: 'api-doc__site-header', 'aria-label': 'Main navigation' },
            h(
                'div',
                { class: 'api-doc__site-nav' },
                h('a', { href: '../www/index.html', class: 'api-doc__wordmark' }, themeLabel),
                h(
                    'div',
                    { class: 'api-doc__site-links' },
                    h('a', { href: './', 'aria-current': 'page' }, 'API'),
                    h('a', { href: '../www/tutorial/' }, 'Tutorial'),
                    h('a', { href: '../www/guides/' }, 'Guides'),
                    h('a', { href: '../www/examples/' }, 'Examples'),
                    h('a', { href: '../www/faq.html' }, 'FAQ'),
                    h(
                        'a',
                        { href: 'https://github.com/alexewerlof/jj', target: '_blank', rel: 'noopener noreferrer' },
                        'GitHub',
                    ),
                ),
            ),
        ),
        h('div', { class: 'api-doc__layout' }, navigation.setAttr('id', 'api-navigation'), reference),
    )
}

async function main() {
    const project = JSON.parse(await fs.readFile(reflectionsPath, 'utf8'))
    const anchors = collectAnchors(project)
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    const existingOutput = await fs.readdir(path.dirname(outputPath))
    await Promise.all(
        existingOutput.map((entry) =>
            fs.rm(path.join(path.dirname(outputPath), entry), {
                recursive: true,
                force: true,
            }),
        ),
    )
    const dom = new JSDOM('<!doctype html><html lang="en" data-theme="dark"><head></head><body></body></html>')
    installDomGlobals(dom.window)
    const { JJHE } = await import('../src/index.ts')
    const h = JJHE.tree
    const jjHead = JJHE.from(dom.window.document.head)
    jjHead.addChild(
        h('meta', { charset: 'utf-8' }),
        h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
        h('meta', { name: 'description', content: 'JJ API reference generated from TypeDoc reflection data.' }),
        h('title', null, 'API reference | JJ'),
        h('link', { rel: 'stylesheet', href: '../www/ui.css' }),
        h('link', { rel: 'stylesheet', href: '../www/code.css' }),
        h('link', { rel: 'stylesheet', href: '../www/api-docs.css' }),
        h('script', { type: 'module', src: 'api-docs.js' }),
    )
    JJHE.from(dom.window.document.body).setChild(renderPage(project, h, anchors))
    await fs.writeFile(outputPath, dom.serialize())
    await build({
        entryPoints: [path.join(rootDir, 'scripts/api-docs-client.js')],
        bundle: true,
        format: 'esm',
        target: 'es2020',
        outfile: path.join(path.dirname(outputPath), 'api-docs.js'),
    })
}

export { collectAnchors, commentPartsToMarkdown, formatSignature, formatType, getCategoryMap, getSearchText }

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch((error) => {
        console.error('Failed to render API documentation', error)
        process.exitCode = 1
    })
}
