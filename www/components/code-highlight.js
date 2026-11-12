import { attr2prop, JJHE, defineComponent, JJD } from '../../lib/bundle.js'
import { highlight } from '../vendor/site-vendors.js'

const h = JJHE.tree
const jjDoc = JJD.from(document)

function highlightCode(code, language) {
    return highlight.highlight(code, {
        language,
    }).value
}

jjDoc.find('head', true).addChild(
    h('link', {
        rel: 'stylesheet',
        href: import.meta.resolve('../code.css'),
    }),
)

export class CodeHighlight extends HTMLElement {
    static observedAttributes = ['file', 'language']
    static defined = defineComponent('code-highlight', CodeHighlight)

    #language
    #jjHost

    constructor() {
        super()
        this.#jjHost = JJHE.from(this)
            // This tiny bit of styling doesn't justify loading a CSS file
            .setStyles({
                display: 'block',
                background: 'rgba(0, 0, 0, 0.1)',
            })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    get language() {
        return this.#language
    }

    set language(value) {
        if (typeof value !== 'string') {
            throw new TypeError(`language must be a string. Got ${value} (${typeof value})`)
        }
        this.#language = value
    }

    async connectedCallback() {
        if (this.#language) {
            const jjCode = h('code')
            if (highlight.getLanguage(this.#language)) {
                jjCode.setHTML(highlightCode(this.textContent, this.#language), true)
            } else {
                jjCode.setText(this.textContent)
            }
            this.#jjHost.setChild(h('pre', null, jjCode))
        }
    }
}
