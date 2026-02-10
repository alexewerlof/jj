import { SimpleCounter } from './components/simple-counter.js'
import { RenderMarkdown } from './components/render-markdown.js'
import { CodeHighlight } from './components/code-highlight.js'

await Promise.all([SimpleCounter.register(), RenderMarkdown.register(), CodeHighlight.register()])

import { doc } from '../lib/bundle.js'

// 1. Handle Copy Button Logic
const copyBtn = doc.find('#copy-btn').on('click', async function () {
    try {
        await navigator.clipboard.writeText('npm i jj')

        // Visual feedback using JJ
        // `this` is the JJHET instance, so we can chain methods
        const originalHtml = this.getHTML()
        this.setHTML('✓', true)

        setTimeout(() => {
            this.setHTML(originalHtml, true)
        }, 1000)
    } catch (err) {
        console.error('Failed to copy', err)
    }
})
