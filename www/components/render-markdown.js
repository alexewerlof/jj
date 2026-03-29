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

    #root
    #content = ''

    async connectedCallback() {
        await CodeHighlight.defined

        this.#root = JJHE.from(this).setStyle('display', 'block')
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
                this.#root.setHTML(md.render(this.#content), true)
            } catch (e) {
                this.#root.setText(e.message)
            }
        }
    }
}
