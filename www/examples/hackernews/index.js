import { JJD, JJHE } from '../../../lib/bundle.min.js'
import { stories } from './stories.js'

const h = JJHE.tree

function a(text, url = '#') {
    return h('a', { href: url }, text)
}

JJD.from(document)
    .find('#stories', true)
    .addChildMap(stories, ({ title, id, host, points, age, comments }) =>
        h(
            'li',
            { class: 'hn__item' },
            h('span', null, '▲'),
            h(
                'div',
                { class: 'hn__item-content' },
                a(title, '#'),
                h('small', null, `(${host})`),
                h(
                    'p',
                    null,
                    `${points} points by `,
                    a(id, '#'),
                    ' ',
                    a(age, '#'),
                    ' | ',
                    a('hide', '#'),
                    ' | ',
                    a(`${comments} comments`, '#'),
                ),
            ),
        ),
    )
