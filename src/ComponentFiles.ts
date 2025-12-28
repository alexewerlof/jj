import { isA, isStr } from 'jty'
import { Wfrag } from './Wfrag.js'
import { Welem } from './Welem.js'

async function fetchText(url: string, mimeSubtype: string): Promise<string> {
    const response = await fetch(url, { headers: { Accept: `text/${mimeSubtype}` } })
    if (!response.ok) {
        throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`)
    }
    return response.text()
}

class ComponentFile {
    constructor(protected href: string) {
        if (!isStr(href)) {
            throw new TypeError(`Expected a string href. Got ${href} (${typeof href})`)
        }
    }

    /**
     * Creates a <lik re="preload|prefetch"> element and adds it to the document <head> element.
     * @param as the link "as" attribute. Use 'fetch' for HTML, 'style' for CSS, and 'script' for JavaScript
     * @param rel when set to a truthy value, a 'preload' link is created. Otherwise a 'prefetch' is created
     * The difference lies in the priority of loading the resource to the browser cache where preload has higher prio.
     */
    protected addLinkPre(as: 'fetch' | 'style', rel: 'prefetch' | 'preload') {
        const link = Welem.fromTag('link').setAttr('rel', rel).setAttr('href', this.href).setAttr('as', as)
        document.head.append(link.elem)
        return this
    }
}

export class TemplateFile extends ComponentFile {
    #promise: Promise<string> | undefined

    constructor(href: string) {
        super(href)
    }

    async fetch(): Promise<string> {
        return await fetchText(this.href, 'html')
    }

    get promise(): Promise<string> {
        if (this.#promise === undefined) {
            this.#promise = this.fetch()
        }
        return this.#promise
    }

    prefetch() {
        return this.addLinkPre('fetch', 'prefetch')
    }

    preload() {
        return this.addLinkPre('fetch', 'preload')
    }
}

export class StyleFile extends ComponentFile {
    #promise: Promise<CSSStyleSheet> | undefined

    constructor(href: string) {
        super(href)
    }

    async fetch(): Promise<CSSStyleSheet> {
        const cssString = await fetchText(this.href, 'css')
        const sheet = new CSSStyleSheet()
        return await sheet.replace(`${cssString}\n/*# sourceURL=${this.href} */`)
    }

    get promise(): Promise<CSSStyleSheet> {
        if (this.#promise === undefined) {
            this.#promise = this.fetch()
        }
        return this.#promise
    }

    prefetch() {
        return this.addLinkPre('style', 'prefetch')
    }

    preload() {
        return this.addLinkPre('style', 'preload')
    }
}

export class ComponentFiles {
    #template: TemplateFile
    #styles: StyleFile[]

    constructor(template: TemplateFile, ...styles: StyleFile[]) {
        if (!isA(template, TemplateFile)) {
            throw new TypeError(`Expected a ${TemplateFile.constructor.name}. Got ${template} (${typeof template})`)
        }
        this.#template = template

        for (const style of styles) {
            if (!isA(style, StyleFile)) {
                throw new TypeError(`Expected a ${StyleFile.constructor.name}. Got ${style} (${typeof style})`)
            }
        }
        this.#styles = styles
    }

    async initShadow(el: HTMLElement, mode: ShadowRootMode): Promise<Wfrag> {
        // Prevent FOUC
        const [template, ...styleSheets] = await Promise.all([
            this.#template.promise,
            ...this.#styles.map((style) => style.promise),
        ])
        Welem.from(el).setShadow(mode, template, ...styleSheets)
        if (!el.shadowRoot) throw new Error('Shadow root not created!')
        return new Wfrag(el.shadowRoot)
    }
}
