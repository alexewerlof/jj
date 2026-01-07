import { WHE } from './WHE.js'
import { isStr } from 'jty'

class ComponentFile<T extends string | CSSStyleSheet> {
    #promise: Promise<T> | undefined

    constructor(
        protected href: string,
        protected as: T extends string ? 'fetch' : 'style',
        loading: LoadingStrategy = 'lazy',
    ) {
        if (!isStr(href)) {
            throw new TypeError(`Expected a string href. Got ${href} (${typeof href})`)
        }
        if (!['fetch', 'style'].includes(as)) {
            throw new TypeError(`Expected a valid 'as'. Got: ${as} (${typeof as})`)
        }
        switch (loading) {
            case 'eager':
                this.promise // Trigger fetch
                break
            case 'prefetch':
            case 'preload':
                this.addLinkPre(loading)
                break
            case 'lazy':
                break
            default:
                throw new RangeError(`Expected a valid loading strategy. Got: ${loading} (${typeof loading})`)
        }
    }

    /**
     * Creates a <lik re="preload|prefetch"> element and adds it to the document <head> element.
     * @param as the link "as" attribute. Use 'fetch' for HTML, 'style' for CSS, and 'script' for JavaScript
     * @param rel when set to a truthy value, a 'preload' link is created. Otherwise a 'prefetch' is created
     * The difference lies in the priority of loading the resource to the browser cache where preload has higher prio.
     */
    protected addLinkPre(rel: 'prefetch' | 'preload') {
        const link = WHE.fromTag('link').setAttr('rel', rel).setAttr('href', this.href).setAttr('as', this.as)
        document.head.append(link.ref)
        return this
    }

    get promise(): Promise<T> {
        if (this.#promise === undefined) {
            this.#promise = this.fetch()
        }
        return this.#promise
    }

    protected async fetch(): Promise<T> {
        const mimeSubtype = this.as === 'fetch' ? 'html' : 'css'
        const response = await fetch(this.href, { headers: { Accept: `text/${mimeSubtype}` } })
        if (!response.ok) {
            throw new Error(`GET ${this.href} failed: ${response.status} ${response.statusText}`)
        }
        const text = await response.text()
        if (this.as === 'fetch') {
            return text as unknown as T
        }
        const sheet = new CSSStyleSheet()
        return (await sheet.replace(`${text}\n/*# sourceURL=${this.href} */`)) as unknown as T
    }
}

export type LoadingStrategy = 'eager' | 'lazy' | 'prefetch' | 'preload'

export interface TemplateOptions {
    shadowMode?: ShadowRootMode
    loading?: LoadingStrategy
}

export interface StyleOptions {
    loading?: LoadingStrategy
}

export class WC extends HTMLElement {
    static template: ComponentFile<string>
    static styles: ComponentFile<CSSStyleSheet>[] = []
    static shadowMode?: ShadowRootMode

    static setTemplate(href: string, options?: TemplateOptions) {
        this.template = new ComponentFile<string>(href, 'fetch', options?.loading)
        if (isStr(options?.shadowMode) && ['open', 'closed'].includes(options.shadowMode)) {
            this.shadowMode = options.shadowMode
        }
        return this
    }

    static addStyle(href: string, options?: StyleOptions) {
        this.styles.push(new ComponentFile<CSSStyleSheet>(href, 'style', options?.loading))
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
