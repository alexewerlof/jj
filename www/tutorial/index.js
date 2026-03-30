import { JJD } from '../../lib/bundle.js'
import { RenderMarkdown } from '../components/render-markdown.js'
import toc from './toc.js'

await RenderMarkdown.defined

const doc = JJD.from(document)

doc.find('#toc', true).addChild(toc)

function getFrom(urlStr) {
    const url = new URL(urlStr)
    return url.searchParams.get('file') || 'index.md'
}

async function fetchFile(path) {
    const url = new URL('./' + path, window.location.href)
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }
    return response.text()
}

const contentRenderer = doc.find('#content-renderer')
contentRenderer.ref.content = await fetchFile(getFrom(window.location))
