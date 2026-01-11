import { fetchCss, fetchHtml, WC, WHE } from '../../lib/index.js'
import highlighter from 'highlight'
import hljs from 'highlight-js'
import hlcss from 'highlight-css'
import hlxml from 'highlight-xml'
import { isStr } from 'jty'

// https://highlightjs.readthedocs.io/en/latest/api.html#configure
highlighter.configure({
    languages: ['js', 'css', 'html'],
})
highlighter.registerLanguage('js', hljs)
highlighter.registerLanguage('css', hlcss)
highlighter.registerLanguage('xml', hlxml)
highlighter.registerAliases('html', { languagename: 'xml' })

async function loadFile(filePath) {
    try {
        const response = await fetch(filePath)
        if (!response.ok) {
            return `Error loading ${filePath}: ${response.status} ${response.statusText}`
        }
        const codeText = await response.text()
        return highlighter.highlight(codeText, {
            language: 'js',
        }).value
    } catch (e) {
        return `Error: ${e.message}`
    }
}

export class CodeBlock extends WC {
    static jj = {
        name: 'code-block',
        template: fetchHtml(import.meta.resolve('./code-block.html')),
        styles: [fetchCss(import.meta.resolve('./code-block.css'))],
    }

    static observedAttributes = ['file']

    #shadow
    #filePath
    #codeHtml

    constructor() {
        super()
    }

    async loadFile() {
        try {
            const response = await fetch(this.#filePath)
            if (!response.ok) {
                return this.#shadow.setText(`Error loading ${this.#filePath}: ${response.status} ${response.statusText}`)
            }
            const codeText = await response.text()
            return highlighter.highlight(codeText, {
                language: 'js',
            }).value
        } catch (e) {
            return `Error: ${e.message}`
        }
    }

    set file(value) {
        if (!isStr(value)) throw new Error('file must be a string')
        this.#filePath = value
        this.#codeHtml = this.loadFile(value)
    }

    async connectedCallback() {
        await super.connectedCallback()
        this.#shadow = WHE.from(this).getShadow()
        this.#shadow.byId('code').setHtml(await this.#codeHtml)
    }
}