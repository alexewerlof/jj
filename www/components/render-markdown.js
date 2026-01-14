import { WC } from '../../lib/bundle.js'
import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm'

const md = markdownIt()

async function loadFile(filePath) {
    try {
        const response = await fetch(filePath)
        if (!response.ok) {
            return `Error loading ${filePath}: ${response.status} ${response.statusText}`
        }
        return md.render(await response.text())
    } catch (e) {
        return `Error: ${e.message}`
    }
}

export class RenderMarkdown extends WC {
    static jj = {
        name: 'render-markdown',
    }

    static observedAttributes = ['file']

    jjRoot
    #contentHtml

    constructor() {
        super()
    }

    set file(value) {
        if (typeof value !== 'string') throw new Error('file must be a string')
        this.#contentHtml = loadFile(value)
    }

    async connectedCallback() {
        await super.connectedCallback()
        this.jjRoot.shadow.setHtml(await this.#contentHtml)
    }
}
