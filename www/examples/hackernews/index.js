import { JJD, JJHE } from '../../../lib/bundle.min.js'
import { stories } from './stories.js'

const h = JJHE.tree

JJD.from(document)
    .find('#stories', true)
    .addChildMap(stories, ({ title, id, host, points, age, comments }) =>
        h(
            'li',
            { class: 'hn__item' },
            h('span', { class: 'hn__item-upvote' }, '▲'),
            h(
                'div',
                { class: 'hn__item-content' },
                h('a', { href: '#' }, title),
                h('small', null, `(${host})`),
                h('p', null, `${points} points by ${id} ${age} | hide | ${comments} comments`),
            ),
        ),
    )
