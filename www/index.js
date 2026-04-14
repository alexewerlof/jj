import { JJD } from '../lib/bundle.js'
import { SimpleCounter } from './components/simple-counter.js'
import { RenderMarkdown } from './components/render-markdown.js'
import { CodeHighlight } from './components/code-highlight.js'

await Promise.all([SimpleCounter.defined, RenderMarkdown.defined, CodeHighlight.defined])

const jjDoc = JJD.from(document)

// 1. Handle Copy Button Logic
const jjCopyBtn = jjDoc.find('#copy-btn')
jjCopyBtn.on('click', async () => {
    try {
        await navigator.clipboard.writeText('npm i jj')

        const originalHtml = jjCopyBtn.getHTML()
        jjCopyBtn.setHTML('✓', true)

        setTimeout(() => {
            jjCopyBtn.setHTML(originalHtml, true)
        }, 1000)
    } catch (err) {
        console.error('Failed to copy', err)
    }
})
