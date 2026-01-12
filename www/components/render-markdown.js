import { fetchHtml, WC, WHE } from '../../lib/index.js'
import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm'
import { isStr } from 'jty'

const md = markdownIt()

async function loadFile(filePath) {
    try {
        const response = await fetch(filePath)
        if (!response.ok) {
            return `Error loading ${filePath}: ${response.status} ${response.statusText}`
        }
        const codeText = await response.text()
        console.log(codeText)
        return md.render(codeText)
    } catch (e) {
        return `Error: ${e.message}`
    }
}

export class RenderMarkdown extends WC {
    static jj = {
        name: 'render-markdown',
        template: fetchHtml(import.meta.resolve('./render-markdown.html')),
    }

    static observedAttributes = ['file']

    #shadow
    #contentHtml

    constructor() {
        super()
    }

    set file(value) {
        if (!isStr(value)) throw new Error('file must be a string')
        this.#contentHtml = loadFile(value)
    }

    async connectedCallback() {
        await super.connectedCallback()
        this.#shadow = WHE.from(this).getShadow()
        this.#shadow.setHtml(await this.#contentHtml)
    }
}
