import { SimpleCounter } from './components/simple-counter.js'
import { RenderMarkdown } from './components/render-markdown.js'
import { CodeHighlight } from './components/code-highlight.js'

await Promise.all([
    SimpleCounter.register(),
    RenderMarkdown.register(),
    CodeHighlight.register(),
])

import {  byId } from '../lib/bundle.js'

// 1. Handle Copy Button Logic
const copyBtn = byId('copy-btn').on('click', async () => {
    try {
        await navigator.clipboard.writeText('npm i jj')
        
        // Visual feedback using JJ
        // We temporarily change the icon color or add a tooltip
        const originalHtml = copyBtn.getHTML()
        copyBtn.setHTML('✓')
        
        setTimeout(() => {
            copyBtn.setHTML(originalHtml)
        }, 1000)
    } catch (err) {
        console.error('Failed to copy', err)
    }
})