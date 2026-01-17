import { attr2prop, fetchCss, JJHE, registerComponent, ShadowMaster } from '../../lib/bundle.js'
import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm'

const md = markdownIt()

async function loadFile(filePath) {
    try {
        const response = await fetch(filePath)
        if (!response.ok) {
            return `Error loading ${filePath}: ${response.status} ${response.statusText}`
        }
        return md.render(await response.text())
    } catch (e) {
        return `Error: ${e.message}`
    }
}

const sm = ShadowMaster.create()
    .setTemplate(fetchCss(import.meta.resolve('../ui.css')))

export class RenderMarkdown extends HTMLElement {
    static register() {
        registerComponent('render-markdown', RenderMarkdown)
    }

    static observedAttributes = ['file']

    jjRoot
    #contentHtml

    constructor() {
        super()
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    set file(value) {
        if (typeof value !== 'string') throw new Error('file must be a string')
        this.#contentHtml = loadFile(value)
    }

    async connectedCallback() {
        this.jjRoot = JJHE.from(this).initShadow('open', await sm.getResolved())
        this.jjRoot.shadow.setHTML(await this.#contentHtml)
    }
}
