import { fetchCss, fetchHtml, fileExt, JJCC } from '../../lib/bundle.js'
import highlight from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/highlight.min.js'
import highlightJs from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/javascript.min.js'
import highlightCss from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/css.min.js'
import highlightXml from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/xml.min.js'

// https://highlightjs.readthedocs.io/en/latest/api.html#configure
highlight.configure({
    languages: ['js', 'css', 'html'],
})
highlight.registerLanguage('js', highlightJs)
highlight.registerLanguage('css', highlightCss)
highlight.registerLanguage('xml', highlightXml)
highlight.registerAliases('html', { languagename: 'xml' })

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

export class CodeBlock extends JJCC {
    static jj = {
        name: 'code-block',
        template: fetchHtml(import.meta.resolve('./code-block.html')),
        styles: [fetchCss(import.meta.resolve('../code.css'))],
    }

    static observedAttributes = ['file', 'language']

    jjRoot
    #fileContent
    #language

    constructor() {
        super()
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
        await super.connectedCallback()
        const codeText = this.#fileContent ? await this.#fileContent: this.innerText
        this.jjRoot.shadow.byId('code').setHTML(this.#language ? highlightCode(codeText, this.#language) : codeText)
    }
}
