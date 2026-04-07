import { attr2prop, JJHE, defineComponent, JJD } from '../../lib/bundle.js'
import highlight from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/highlight.min.js'
import highlightJavascript from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/javascript.min.js'
import highlightCss from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/css.min.js'
import highlightXml from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/xml.min.js'
import highlightTypescript from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/typescript.min.js'

const h = JJHE.tree
const doc = JJD.from(document)

// https://highlightjs.readthedocs.io/en/latest/api.html#configure
highlight.configure({
    languages: ['js', 'css', 'html'],
})
highlight.registerLanguage('javascript', highlightJavascript)
highlight.registerAliases('js', { languageName: 'javascript' })
highlight.registerLanguage('typescript', highlightTypescript)
highlight.registerAliases('ts', { languageName: 'typescript' })
highlight.registerLanguage('xml', highlightXml)
highlight.registerAliases('html', { languageName: 'xml' })
highlight.registerLanguage('css', highlightCss)

function highlightCode(code, language) {
    return highlight.highlight(code, {
        language,
    }).value
}

doc.find('head', true).addChild(
    h('link', {
        rel: 'stylesheet',
        href: import.meta.resolve('../code.css'),
    }),
)

export class CodeHighlight extends HTMLElement {
    static observedAttributes = ['file', 'language']
    static defined = defineComponent('code-highlight', CodeHighlight)

    #language
    #root

    constructor() {
        super()
        this.#root = JJHE.from(this)
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
            const highlighted = highlightCode(this.textContent, this.#language)
            this.#root.setChild(h('pre', null, h('code').setHTML(highlighted, true)))
        }
    }
}
