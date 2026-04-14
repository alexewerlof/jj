import { JJD, JJET } from '../../lib/bundle.js'
import { RenderMarkdown } from '../components/render-markdown.js'
import { TableOfContents } from '../components/table-of-contents.js'

await TableOfContents.defined
await RenderMarkdown.defined

const jjDoc = JJD.from(document)
const jjWin = JJET.from(window)
const jjContentRenderer = jjDoc.find('#content-renderer', true)
const jjToc = jjDoc.find('#toc', true)

jjToc.ref.tocTree = [
    {
        Start: putFileInUrl('index.md'),
        Foundations: {
            Architecture: putFileInUrl('architecture.md'),
            Events: putFileInUrl('events.md'),
            Extensions: putFileInUrl('extensions.md'),
            'Fluent API': putFileInUrl('fluent-api.md'),
            Philosophy: putFileInUrl('philosophy.md'),
            Query: putFileInUrl('query.md'),
            Routing: putFileInUrl('routing.md'),
            Structure: putFileInUrl('structure.md'),
            Styling: putFileInUrl('styling.md'),
            Templates: putFileInUrl('templates.md'),
        },
        Components: {
            Basics: putFileInUrl('components.md'),
            'Lifecycle Events': putFileInUrl('component-lifecycle-events.md'),
            'Light DOM': putFileInUrl('components-light.md'),
            'Shadow DOM': putFileInUrl('components-shadow.md'),
        },
    },
]

function getFileFromUrl(urlStr) {
    const url = new URL(urlStr)
    return url.searchParams.get('file')
}

function putFileInUrl(file) {
    const url = new URL(window.location.href)
    url.searchParams.set('file', file)
    return url.toString()
}

async function fetchFile(path) {
    const url = new URL(`../../guides/${path}`, window.location.href)
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }
    return response.text()
}

async function renderFileContent(file) {
    jjContentRenderer.ref.content = await fetchFile(file)
}

jjToc.on('click', async (event) => {
    const target = event.target
    try {
        if (!event.ctrlKey && target.matches('a')) {
            const href = target.getAttribute('href')
            const file = getFileFromUrl(href)
            if (file && file !== getFileFromUrl(window.location.href)) {
                event.preventDefault()
                window.history.pushState({}, '', href)
                await renderFileContent(file)
            } else {
                console.warn('No href found on clicked link:', target)
            }
        }
    } catch (error) {
        console.error('Error handling click event on Table of Contents:', error)
    }
})

const initialFile = getFileFromUrl(window.location.href) || 'index.md'
if (initialFile) {
    await renderFileContent(initialFile)
}

jjWin.on('popstate', async () => {
    try {
        const file = getFileFromUrl(window.location.href)
        if (file) {
            await renderFileContent(file)
        }
    } catch (error) {
        console.error('Error handling popstate event:', error)
    }
})
