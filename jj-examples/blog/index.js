import * as jj from '../jj.js'

async function loadTableofContents(fileName) {
    const response = await fetch(fileName)
    const toc = await response.json()
    console.dir(toc)
    return toc
}

async function buildTocDom(toc) {
    return jj.html.main()
        .text('Hello world')
        .mapChildren(toc.posts, (post) => {
            return jj.html.a('Hi ' + post.path)
        })
}

jj.ready(async () => {
    console.log('Ready')
    const dom = await buildTocDom(await loadTableofContents('./content/index.json'))
    dom.appendToBody()
})