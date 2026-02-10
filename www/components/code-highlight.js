import { attr2prop, fetchCss, fetchHtml, fileExt, ShadowMaster, JJHE, registerComponent } from '../../lib/bundle.js'
import highlight from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/highlight.min.js'
import highlightJavascript from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/javascript.min.js'
import highlightCss from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/css.min.js'
import highlightXml from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/xml.min.js'
import highlightTypescript from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/typescript.min.js'

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

async function loadFile(filePath) {
    try {
        const response = await fetch(filePath)
        if (!response.ok) {
            return `Error loading ${filePath}: ${response.status} ${response.statusText}`
        }
        return await response.text()
    } catch (e) {
        return `Error: ${e.message}`
    }
}

const tempStyle = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./code-highlight.html')))
    .addStyles(fetchCss(import.meta.resolve('../code.css')))

export class CodeHighlight extends HTMLElement {
    static observedAttributes = ['file', 'language']
    static register() {
        registerComponent('code-highlight', CodeHighlight)
    }

    #fileContent
    #language

    constructor() {
        super()
    }

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    get language() {
        return this.#language
    }

    set language(value) {
        if (typeof value !== 'string') throw new Error('language must be a string')
        this.#language = value
    }

    set file(value) {
        if (typeof value !== 'string') throw new Error('file must be a string')
        this.#fileContent = loadFile(value)
    }

    async connectedCallback() {
        this.jjRoot = JJHE.from(this).initShadow('open', await tempStyle.getResolved())
        const codeText = this.#fileContent ? await this.#fileContent : this.innerText
        this.jjRoot.shadow
            .find('#code')
            .setHTML(this.#language ? highlightCode(codeText, this.#language) : codeText, true)
    }
}
