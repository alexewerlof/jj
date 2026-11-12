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
    return { content: await response.text(), sourceUrl: response.url }
}

async function renderFileContent(file) {
    const markdown = await fetchFile(file)
    jjContentRenderer.ref.sourceUrl = markdown.sourceUrl
    jjContentRenderer.ref.content = markdown.content
}

async function navigateToFile(file) {
    if (!file || file === getFileFromUrl(window.location.href)) {
        return
    }

    window.history.pushState({}, '', putFileInUrl(file))
    await renderFileContent(file)
}

jjToc.on('click', async (event) => {
    const target = event.target
    try {
        if (!event.ctrlKey && target.matches('a')) {
            const href = target.getAttribute('href')
            const file = getFileFromUrl(href)
            if (file) {
                event.preventDefault()
                await navigateToFile(file)
            } else {
                console.warn('No href found on clicked link:', target)
            }
        }
    } catch (error) {
        console.error('Error handling click event on Table of Contents:', error)
    }
})

jjContentRenderer.on('click', async (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
        return
    }

    const link = target.closest('a')
    const href = link?.getAttribute('href')
    if (!href?.startsWith('./') || !href.endsWith('.md')) {
        return
    }

    event.preventDefault()
    await navigateToFile(href.slice(2))
})

const initialFile = getFileFromUrl(window.location.href) || 'index.md'
if (initialFile) {
    await renderFileContent(initialFile)
}

jjWin.on('popstate', async () => {
    try {
        const file = getFileFromUrl(window.location.href) || 'index.md'
        await renderFileContent(file)
    } catch (error) {
        console.error('Error handling popstate event:', error)
    }
})
