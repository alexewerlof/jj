import { JJHE } from '../../lib/bundle.js'

const h = JJHE.tree

function pageLink(level, title, path) {
    const href = new URL(window.location)
    href.searchParams.set('file', path)
    return h('li', { class: `level-${level}` }, h('a', { href }, title))
}

function levelTagName(level) {
    return `h${level}`
}

function levelClassName(level) {
    return `level-${level}`
}

function title(level, title, ...children) {
    return h('li')
        .addChild(h(levelTagName(level)), h('ol', null, ...children))
        .setClass(levelClassName(level))
        .setText(title)
        .addChildMap(children, (child) => child.addClass(levelClassName(level + 1)))
}

export default h(
    'nav',
    null,
    h(
        'ol',
        null,
        title(
            1,
            'Foundations',
            pageLink(2, 'Index', 'index.md'),
            pageLink(2, 'Getting Started', 'getting-started.md'),
            pageLink(2, 'Design Philosophy', 'design-philosophy.md'),
            pageLink(2, 'DOM Fundamentals', 'dom-fundamentals.md'),
            pageLink(2, 'State and Events', 'state-and-events.md'),
        ),
        title(
            1,
            'Advanced Topics',
            pageLink(2, 'Custom Components', 'custom-components.md'),
            pageLink(2, 'Wrapper Mental Model', 'wrapper-mental-model.md'),
            pageLink(2, 'Common Errors', 'common-errors.md'),
        ),
    ),
)
