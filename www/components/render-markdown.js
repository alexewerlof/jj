import { attr2prop, JJHE, registerComponent } from '../../lib/bundle.js'
import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm'
import { CodeHighlight } from './code-highlight.js'

await CodeHighlight.register()

const md = markdownIt()

md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx]
    const info = token.info ? token.info.trim() : ''
    const language = info.split(/\s+/)[0] ?? 'javascript'
    return `<code-highlight language="${language}">${md.utils.escapeHtml(token.content)}</code-highlight>`
}

export class RenderMarkdown extends HTMLElement {
    static register() {
        registerComponent('render-markdown', RenderMarkdown)
    }

    static observedAttributes = ['content']

    #root
    #content = ''

    constructor() {
        super()
    }

    async connectedCallback() {
        this.#root = JJHE.from(this)
        this.#render()
    }

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    set content(markdown) {
        this.#content = markdown
        this.#render()
    }

    get content() {
        return this.#content
    }

    #render() {
        if (this.#root) {
            try {
                this.#root.setHTML(md.render(this.#content))
            } catch (e) {
                this.#root.setText(e.message)
            }
        }
    }
}
