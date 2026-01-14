import { fetchCss, fetchHtml, WC, WHE } from '../../lib/bundle.js'
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

function getFileExtension(filePath) {
    const lastDotIndex = filePath.lastIndexOf('.')
    if (lastDotIndex === -1) {
        return ''
    }
    return filePath.slice(lastDotIndex + 1)
}

async function loadFile(filePath) {
    try {
        const response = await fetch(filePath)
        if (!response.ok) {
            return `Error loading ${filePath}: ${response.status} ${response.statusText}`
        }
        const codeText = await response.text()
        return highlight.highlight(codeText, {
            language: getFileExtension(filePath),
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

    jjRoot
    #codeHtml

    constructor() {
        super()
    }

    set file(value) {
        if (typeof value !== 'string') throw new Error('file must be a string')
        this.#codeHtml = loadFile(value)
    }

    async connectedCallback() {
        await super.connectedCallback()
        this.jjRoot.shadow.byId('code').setHtml(await this.#codeHtml)
    }
}
