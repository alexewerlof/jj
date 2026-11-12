import { JJD, JJHE } from '../../../lib/bundle.min.js'
import { stories } from './stories.js'

const h = JJHE.tree
const jjDoc = JJD.from(document)
const jjStories = jjDoc.find('#stories', true)
const jjSearch = jjDoc.find('#search', true)
const jjEmptyState = jjDoc.find('#empty-state', true)
const hiddenStoryIds = new Set()

function a(text, url) {
    return h('a', { href: url }, text)
}

function renderStories() {
    const query = jjSearch.getValue().trim().toLowerCase()
    const filteredStories = stories.filter((story) => {
        const searchableText = `${story.title} ${story.id} ${story.host} ${story.age}`.toLowerCase()
        return !hiddenStoryIds.has(story.id) && searchableText.includes(query)
    })

    jjStories.empty().addChildMap(filteredStories, renderStory)
    jjEmptyState.swAttr('hidden', filteredStories.length > 0)
}

function renderStory({ title, id, host, points, age, comments }) {
    const jjHideButton = h('button', { class: 'hn__hide', type: 'button', 'aria-label': `Hide ${title}` }, 'hide').on(
        'click',
        () => {
            hiddenStoryIds.add(id)
            renderStories()
        },
    )

    return h(
        'li',
        { class: 'hn__item' },
        h('span', { 'aria-hidden': 'true' }, '▲'),
        h(
            'div',
            { class: 'hn__item-content' },
            h('span', { class: 'hn__title' }, title),
            h('small', null, `(${host})`),
            h(
                'p',
                null,
                `${points} points by `,
                a(id, `https://news.ycombinator.com/user?id=${encodeURIComponent(id)}`),
                ` ${age} | `,
                jjHideButton,
                ` | ${comments} comments`,
            ),
        ),
    )
}

jjSearch.on('input', renderStories)
renderStories()
