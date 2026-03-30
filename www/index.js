import { SimpleCounter } from './components/simple-counter.js'
import { RenderMarkdown } from './components/render-markdown.js'
import { CodeHighlight } from './components/code-highlight.js'

await Promise.all([SimpleCounter.defined, RenderMarkdown.defined, CodeHighlight.defined])

import { JJD } from '../lib/bundle.js'

const doc = JJD.from(document)

// 1. Handle Copy Button Logic
const copyBtn = doc.find('#copy-btn')
copyBtn.on('click', async () => {
    try {
        await navigator.clipboard.writeText('npm i jj')

        const originalHtml = copyBtn.getHTML()
        copyBtn.setHTML('✓', true)

        setTimeout(() => {
            copyBtn.setHTML(originalHtml, true)
        }, 1000)
    } catch (err) {
        console.error('Failed to copy', err)
    }
})
