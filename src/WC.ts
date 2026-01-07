import { WHE } from './WHE.js'
import { isStr } from 'jty'

abstract class ComponentFile<T = string | CSSStyleSheet> {
    #promise: Promise<T> | undefined

    constructor(protected href: string) {
        if (!isStr(href)) {
            throw new TypeError(`Expected a string href. Got ${href} (${typeof href})`)
        }
    }

    get promise(): Promise<T> {
        if (this.#promise === undefined) {
            this.#promise = this.fetch()
        }
        return this.#promise
    }

    abstract fetch(): Promise<T>

    protected async _fetch(mimeSubtype: string): Promise<string> {
        const response = await fetch(this.href, { headers: { Accept: `text/${mimeSubtype}` } })
        if (!response.ok) {
            throw new Error(`GET ${this.href} failed: ${response.status} ${response.statusText}`)
        }
        return response.text()
    }

    /**
     * Creates a <lik re="preload|prefetch"> element and adds it to the document <head> element.
     * @param as the link "as" attribute. Use 'fetch' for HTML, 'style' for CSS, and 'script' for JavaScript
     * @param rel when set to a truthy value, a 'preload' link is created. Otherwise a 'prefetch' is created
     * The difference lies in the priority of loading the resource to the browser cache where preload has higher prio.
     */
    protected addLinkPre(as: 'fetch' | 'style', rel: 'prefetch' | 'preload') {
        const link = WHE.fromTag('link').setAttr('rel', rel).setAttr('href', this.href).setAttr('as', as)
        document.head.append(link.ref)
        return this
    }
}

export class TemplateFile extends ComponentFile<string> {
    async fetch(): Promise<string> {
        return await this._fetch('html')
    }

    prefetch() {
        return this.addLinkPre('fetch', 'prefetch')
    }

    preload() {
        return this.addLinkPre('fetch', 'preload')
    }
}

export class StyleFile extends ComponentFile<CSSStyleSheet> {
    async fetch(): Promise<CSSStyleSheet> {
        const cssString = await this._fetch('css')
        const sheet = new CSSStyleSheet()
        return await sheet.replace(`${cssString}\n/*# sourceURL=${this.href} */`)
    }

    prefetch() {
        return this.addLinkPre('style', 'prefetch')
    }

    preload() {
        return this.addLinkPre('style', 'preload')
    }
}

export class WC extends HTMLElement {
    static template: TemplateFile
    static styles: StyleFile[] = []
    static shadowMode?: ShadowRootMode

    static setTemplate(href: string) {
        this.template = new TemplateFile(href)
        return this
    }

    static addStyle(href: string) {
        this.styles.push(new StyleFile(href))
        return this
    }

    async connectedCallback() {
        // Prevent FOUC
        const { template: templateFile, styles: styleFiles, shadowMode = 'open' } = this.constructor as typeof WC
        const [template, ...styleSheets] = await Promise.all([
            templateFile.promise,
            ...styleFiles.map((style) => style.promise),
        ])
        WHE.from(this).setShadow(shadowMode, template, ...styleSheets)
    }
}
