import { h } from '../../lib/bundle.js'

function pageLink(level, title, path) {
    const href = new URL(window.location)
    href.searchParams.set('file', path)
    return h('li', { class: `level-${level}` }, h('a', { href }, title))
}

function title(level, title, ...children) {
    return h('li')
        .addChild(h(`h${level}`), h('ol', null, ...children))
        .setClass(`level-${level}`)
        .setText(title)
        .addChildMap(children, (child) => child.addClass(`level-${level + 1}`))
}

export default h(
    'nav',
    null,
    h(
        'ol',
        null,
        title(
            1,
            'Essentials',
            pageLink(2, 'Design Philosophy', '00-design-philosophy.md'),
            pageLink(2, 'Index', '00-index.md'),
            pageLink(2, 'Preface', '00-preface.md'),
            pageLink(2, 'DOM', '01-dom.md'),
            pageLink(2, 'State Management', '02-state-management.md'),
        ),
    ),
)
