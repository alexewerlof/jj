import { html, frag, queryId, rnd, css, sel } from '../jj.js'
import { dna } from './dna.js'

const adClass = rnd('adClass')

css(
    sel().class(adClass).css({
        backgroundColor: '#eadc89',
        color: 'rgb(164, 152, 152)',
        margin: '0.5em',
        padding: '0.5em'
    })
).appendToHead()

async function loadJson(path) {
    const response = await fetch(path)
    return await response.json()
}

function renderText(text) {
    return frag().text(text.value)
}

function findBestImageUrl(urls, maxWidth) {
    const urlsSortedByWidth = urls.sort((u1, u2) => u2.width - u1.width)
    const bestMatch = urlsSortedByWidth.find(url => url.width <= maxWidth)
    // if no bestMatch is found, no image is smaller than maxWidth, so let's return the smallest one
    return bestMatch || urlsSortedByWidth[urlsSortedByWidth.length - 1]
}

function getImageCaption(decl) {
    if (decl.caption && decl.caption.value) {
        return decl.caption.value
    }
    if (decl.byline && decl.byline.title) {
        decl.byline.title
    }
    return ''
}

class ItemRenderer {
    constructor(dna) {
        this.dna = dna
    }

    render(decl) {
        if (typeof this[decl.type] === 'function') {
            return this[decl.type](decl)
        } else {
            return html('div')
                .style({
                    'background-color': '#333',
                    'border-radius': '8px',
                    padding: '8px',
                    color: '#eee',
                    overflow: 'scroll',
                    maxHeight: '100vh'
                })
                .child(
                    html('h4').text(decl.type),
                    html('code')
                        .child(html('pre').text(JSON.stringify(decl, null, 2))),
                )
        }
    }

    // streamer() {
    //     return tag('hr')
    // }

    text(decl) {
        switch (decl.subtype) {
            case 'timestamp':
                return html('time').child(renderText(decl.text))
            case 'title':
                return html('h1').child(renderText(decl.text))
            default:
                return html('p').append(renderText(decl.text))
        }
    }

    image(decl, maxWidth = document.body.clientWidth) {
        const ret = html('img')
        const caption = getImageCaption(decl)
        ret.alt(caption).title(caption)

        try {
            const { url, width, height } = findBestImageUrl(decl.imageAsset.urls, maxWidth)
            ret.src(url).setAttrs({ width, height })
        } catch (e) {
            console.warn(decl, e)
        }
        return html('figure').child(
            ret,
            html('figcaption').text(caption)
        )

    }

    gallery(decl) {
        return decl.components.map(imgDecl => this.image(imgDecl))
    }

    label(decl) {
        return html('div').child(renderText(decl.text)).style({ color: this.dna.default.color.primary })
    }

    byline(decl) {
        return html('div').text('by ').children(
            decl.authors.map(
                author => html('span')
                    .child(renderText(author.text))
                    .title(author.originatorId)
            )
        )
    }

    ad() {
        return html('div').class(adClass).text('ad')
    }

    widget(decl) {
        switch (decl.subtype) {
            case 'simple-list':
                return frag().child(
                    html('h1').child(renderText(decl.title)),
                    ...decl.items.map(item => this.render(item))
                )
            default:
                return html('div').text('widget of subtype ' + decl.subtype)
        }
    }

    bundle(decl) {
        return frag().children(html('div').text('bundle'), decl.items.map(item => this.render(item)))
    }

    teaser(decl) {
        return frag()
            .comment(decl.type + ' ' + decl.subtype)
            .if(decl.label, t =>
                t.append(html('h4').text(decl.label.value))
            )
            .append(html('a').href(decl.target.expandedUri).run(t => {
                if (decl.image) {
                    t.append(this.image(decl.image, document.body.clientWidth / 5))
                }
                t.text(decl.title.value)
            }))
    }

    share(decl) {
        return html('div')
            .children(
                html('a').href(decl.link).child(html('h3').text('Share')),
                decl.channels.map(channel => html('span').text(channel + ' | ')),
            )
    }
}

const itemRenderer = new ItemRenderer(dna)

function renderItem(decl) {
    return frag().child(itemRenderer.render(decl))
}

function renderArea({ name, items }, itemDeclarations) {
    return html('div')
        .title(`${name} area!`)
        .children(items.map(itemIndex => renderItem(itemDeclarations[itemIndex])))
}

function renderArticle(article) {
    const composition = article.compositions[1]
    const areas = composition.areas.map(area => renderArea(area, article.items))
    return html('article').children(areas)
}

async function main() {
    // const article = await loadJson('./article-iris.json')
    // const article = await loadJson('http://localhost:4000/v1/pages/articles/MRdQ00')
    const root = queryId('app')
    const articleId = '2Gj2Pl'
    html('div').text(`Loading article ${articleId} from AB...`).mount(root)
    const article = await loadJson(`https://aftonbladet.iris.schibsted.media/v1/pages/articles/${articleId}`)
    console.dir(article)
    renderArticle(article).mount(root)
}

main().then(console.log, console.error)
