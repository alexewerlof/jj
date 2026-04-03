import { JJD } from '../../lib/bundle.js'
import { CodeHighlight } from '../components/code-highlight.js'
import { RenderMarkdown } from '../components/render-markdown.js'

await CodeHighlight.defined
await RenderMarkdown.defined

const doc = JJD.from(document)
const content = doc.find('#content', true)

async function fetchFile(path) {
    const url = new URL('./' + path, window.location.href)
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }
    return response.text()
}

content.ref.content = await fetchFile('index.md')
