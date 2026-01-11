import highlighter from 'highlight'
import { WC, WHE } from '../../lib/index.js'
import hljs from 'highlight-js'
import hlcss from 'highlight-css'
import hlxml from 'highlight-xml'

// https://highlightjs.readthedocs.io/en/latest/api.html#configure
highlighter.configure({
    languages: ['js', 'css', 'html'],
})
highlighter.registerLanguage('js', hljs)
highlighter.registerLanguage('css', hlcss)
highlighter.registerLanguage('xml', hlxml)
highlighter.registerAliases('html', { languagename: 'xml' })

export class CodeBlock extends WC {
    static {
        this.jjName = 'code-block'
        this.setTemplateFile(import.meta.resolve('./code-block.html'))
        this.addStyleFile(import.meta.resolve('./code-block.css'))
        this.observedAttributes = ['file']
    }

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
            this.#codeHtml = highlighter.highlight(codeText, {
                language: 'js',
            }).value
        } catch (e) {
            this.#codeHtml = `Error: ${e.message}`
        }
    }

    set file(value) {
        this.#filePath = value
        this.loadFile().catch(error => { console.log(error)})
    }

    async connectedCallback() {
        await super.connectedCallback()
        this.#shadow = WHE.from(this).getShadow()
        this.#shadow.byId('code').setHtml(this.#codeHtml)
    }
}