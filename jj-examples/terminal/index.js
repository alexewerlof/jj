import { frag, html, queryId, ready, css, sel } from '../jj.js'
import { jitter, sleep } from './utils.js'

// Inspired by https://github.com/victorqribeiro/oldTerminal

const config = {
    fontSize: '28px',
    bg: 'blue',
    fg: 'white',
    key: 'red',
    font: 'VT323',
    menu: {
        bg: 'gray',
        fg: 'black',
    },
    chPerSec: 9,
}

const TEXT_DATA = Symbol('text-data')
const MAIN_CONTENT_ID = 'main-content'

function terminal(content) {
    return frag().children(
        menu(content),
        mainContent(),
        border(),
    )
}

function menuItem(text, hash) {
    return html('menuitem').append(
        html('a').text(text).href('#' + hash)
    )
}

function menu(content) {
    return html('menu').append(
        content.map(t => menuItem(t.el.dataset.title, t.el.id))
    )
}

function border() {
    return html('div').style({
        borderTop: ['0.1em', 'solid', 'red']
    })
}

function mainContent() {
    return html('main').id(MAIN_CONTENT_ID)
}

// const // mobileView = sel().at('media')._.prop('min-width', px(500))
const appStyleTag = css(
    sel('body').css({
        margin: 0,
        backgroundColor: config.bg,
        color: config.fg,
        fontFamily: `'${config.font}', monospace`,
        fontSize: config.fontSize
    }),
    sel().tag('h1').or().tag('p').css({
        padding: 0,
        margin: 0,
        fontFamily: 'inherit'
    }),
    sel('menu').css({
        backgroundColor: config.menu.bg,
        margin: 0,
        marginBottom: '0.8em',
        fontSize: '1.1em',
        padding: '0.3em',
    }),
    sel().all().css({
        userSelect: 'none'
    }),
    sel().el('menuitem').css({
        display: 'inline-block',
        cursor: 'pointer',
        [sel('&')._.el('a')]: {
            color: 'inherit',
            textDecoration: 'none'
        },
        [sel('&').followedBy().el('menuitem')]: {
            paddingLeft: '0.5em'
        },
        [sel('&').pClass('hover')]: {
            color: 'white'
        },
        [sel('&').pEl('first-letter')]: {
            color: config.key,
        },
        [sel('&').clone()]: {
            color: 'black'
        },
    }),
    sel().id(MAIN_CONTENT_ID).css({
        fontFamily: 'inherit',
        whiteSpace: 'pre-line',
        wordBreak: 'break-all',
    }),
    // mobileView,
    sel().el('hr').css({
        border: 'none',
        borderTop: ['0.1em', 'solid', config.fg],
        marginTop: '0.45em',
        marginBottom: '0.45em',
    }),
    // sel().at('media')._.concat('screen')._.and()._.par('min-width', '600px').css(
    //     sel('body').css({
    //         backgroundColor: 'darkblue'
    //     })
    // )
)

ready(() => {
    frag().children(
        html('meta').name('Description').content('This is just a dummy meta'),
        html('meta').name('theme-color').content(config.bg),
        html('title').text('terminal'),
        html('link').href(`https://fonts.googleapis.com/css?family=${config.font}&display=swap`).setAttr('rel', 'stylesheet'),
    ).appendToHead()

    console.log(appStyleTag.root.el.innerText)

    appStyleTag.appendToHead()

    const content = html(document.body).queryAll('template[id]')
    const app = terminal(content)
    app.appendToBody()

    showContent(content)
    window.onhashchange = (evt) => {
        showContent(content)
    }
})

function hideTextNodes(parentNode) {
    const treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_TEXT)
    while (treeWalker.nextNode()) {
        if (!treeWalker.currentNode[TEXT_DATA]) {
            treeWalker.currentNode[TEXT_DATA] = treeWalker.currentNode.data
        }
        treeWalker.currentNode.data = ''
    }
}

function showContent(content) {
    const sluggedTitle = window.location.hash.replace(/^#/, '')
    const currentContent = content.find(c => c.el.id === sluggedTitle) || content[0]
    document.title = currentContent.el.dataset.title || 'no title'
    const main = queryId(MAIN_CONTENT_ID)
    main.clear().append(currentContent.clone(true).el.content)
    hideTextNodes(main.el)
    showTextNodes(main.el)
}

async function showTextNodes(parentNode) {
    const treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_TEXT)
    while (treeWalker.nextNode()) {
        const text = treeWalker.currentNode[TEXT_DATA]
        const textNode = treeWalker.currentNode
        for (let i = 0; i < text.length; i++) {
            textNode.data += text[i]
            if (text[i] !== ' ' && text[i] !== '\n') {
                await sleep(jitter(1000 / config.chPerSec, 40))
            }
        }
    }
}
