import { doc, fetchText } from '../../lib/bundle.js'
import { RenderMarkdown } from '../components/render-markdown.js'
import toc from './toc.js'

await RenderMarkdown.register()

doc.find('#toc').append(toc)

function getFrom(urlStr) {
    const url = new URL(urlStr)
    return url.searchParams.get('file')
}

function fetchFile(path) {
    const url = new URL('./' + path, window.location.href)
    return fetchText(url)
}

const contentRenderer = doc.find('#content-renderer')
console.log(contentRenderer)
console.log(contentRenderer.ref.content)
const file = getFrom(window.location)
if (file) {
    contentRenderer.ref.content = await fetchFile(file)
} else {
    contentRenderer.ref.content = 'From _index_'
}
