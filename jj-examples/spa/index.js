import { html, frag, em, ready, query } from '../jj.js'

async function loadJSAndRun(path, fnName, ...params) {
    const loadedJs = await import(path)
    const fn = loadedJs[fnName]
    fn(...params)
}

function index() {
    return frag(
        html('h1').text('index.html (SPA)'),
        html('main')
            .run(root => {
                let lazyChild
                root.append(
                    lazyChild = html('div').text('Loading lazy child...').style({
                        background: 'red',
                        color: 'white',
                        padding: em(1)
                    })
                )
                setTimeout(() => {
                    lazyChild.setText('Lazy child loaded!').style({
                        background: 'green'
                    })
                }, 1500)
            })
            .route(/\/demo\/spa\/$/, (root) => root.children(
                html('ul').setChildren(
                    html('a').href('page1.html').text('page1').wrap(html('li')),
                    html('a').href('page2.html').text('page2').wrap(html('li')),
                )
            ))
            .route(/page1/, (parent) => parent.setChildren(
                html('div').text('route: I am page 1')
            ))
            .route(/page2/, (parent) => parent.setChildren(
                html('div').text('Loading page2.js').run((placeHolder) => {
                    loadJSAndRun('./page2.js', 'render', placeHolder, 2)
                        .then(
                            () => console.log('Successfully loaded page2.js and ran render()'),
                            err => console.error('Failed to run render() from page2.js', err),
                        )
                }))
            )
            .route(/page1/, () => html('div').text('I am page 1 from routers'))
            .route(/page2/, () => html('div').text('I am page 2 from routers')),
        html('footer').text('Copyright 2019')
    )
}

ready(() => {
    window.onpopstate = () => alert('onpopstate')

    index().mount(query('#app'))
})