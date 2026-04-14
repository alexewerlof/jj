import { attr2prop, JJHE, defineComponent } from '../../lib/bundle.js'
import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm'
import { CodeHighlight } from './code-highlight.js'

const md = markdownIt()

md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx]
    const info = token.info ? token.info.trim() : ''
    const language = info.split(/\s+/)[0] ?? 'javascript'
    return `<code-highlight language="${language}">${md.utils.escapeHtml(token.content)}</code-highlight>`
}

export class RenderMarkdown extends HTMLElement {
    static defined = defineComponent('render-markdown', RenderMarkdown)

    static observedAttributes = ['content']

    #jjHost
    #htmlContent = ''

    constructor() {
        super()
        this.#jjHost = JJHE.from(this).setStyle('display', 'block')
    }

    async connectedCallback() {
        await CodeHighlight.defined
        this.#render()
    }

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    set content(markdown) {
        try {
            this.#htmlContent = md.render(markdown)
            this.#render()
        } catch (cause) {
            this.#htmlContent = `<p style="color: red;">Error rendering markdown: ${cause.message}</p>`
            this.#render()
            console.error(`Failed to render markdown content`, cause)
            throw new Error(`Failed to render markdown content`, { cause })
        }
    }

    get content() {
        return this.#htmlContent
    }

    #render() {
        this.#jjHost.setHTML(this.#htmlContent, true)
    }
}
