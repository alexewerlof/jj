import { JJD, JJET } from '../../lib/bundle.js'
import { RenderMarkdown } from '../components/render-markdown.js'
import { TableOfContents } from '../components/table-of-contents.js'

await TableOfContents.defined
await RenderMarkdown.defined

const doc = JJD.from(document)
const win = JJET.from(window)
const contentRenderer = doc.find('#content-renderer', true)
const toc = doc.find('#toc', true)

toc.ref.tocTree = [
    {
        Foundations: {
            Architecture: '../../guides/architecture.md',
            Events: '../../guides/events.md',
            Extensions: '../../guides/extensions.md',
            'Fluent API': '../../guides/fluent-api.md',
            Index: '../../guides/index.md',
            Philosophy: '../../guides/philosophy.md',
            Query: '../../guides/query.md',
            Routing: '../../guides/routing.md',
            Structure: '../../guides/structure.md',
            Styling: '../../guides/styling.md',
            Templates: '../../guides/templates.md',
        },
        Components: {
            Basics: '../../guides/components.md',
            'Component Lifecycle Events': '../../guides/component-lifecycle-events.md',
            'Components Light': '../../guides/components-light.md',
            'Components Shadow': '../../guides/components-shadow.md',
        },
    },
]

function getFileFromUrl(urlStr) {
    const url = new URL(urlStr)
    return url.searchParams.get('file') || 'index.md'
}

function putFileInUrl(urlStr, file) {
    const url = new URL(urlStr)
    url.searchParams.set('file', file)
    return url.toString()
}

async function fetchFile(path) {
    const url = new URL('./' + path, window.location.href)
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }
    return response.text()
}

async function renderFileContent(file) {
    contentRenderer.ref.content = await fetchFile(file)
}

toc.on('click', async (event) => {
    try {
        const target = event.target
        if (target.matches('a')) {
            event.preventDefault()
            const file = target.getAttribute('href')
            if (file && file !== getFileFromUrl(window.location.href)) {
                await renderFileContent(file)
                window.history.pushState({}, '', putFileInUrl(window.location.href, file))
            } else {
                console.warn('No href found on clicked link:', target)
            }
        }
    } catch (error) {
        console.error('Error handling click event on Table of Contents:', error)
    }
})

const initialFile = getFileFromUrl(window.location.href)
if (initialFile) {
    await renderFileContent(initialFile)
}

win.on('popstate', async () => {
    try {
        const file = getFileFromUrl(window.location.href)
        await renderFileContent(file)
    } catch (error) {
        console.error('Error handling popstate event:', error)
    }
})
