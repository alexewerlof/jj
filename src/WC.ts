import { keb2cam } from './case.js'
import { WHE } from './WHE.js'
import { hasProp, isArr, isStr } from 'jty'

export type LoadingStrategy = 'eager' | 'lazy' | 'prefetch' | 'preload'

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

export interface TemplateOptions {
    shadowMode?: ShadowRootMode
    loading?: LoadingStrategy
}

export interface StyleOptions {
    loading?: LoadingStrategy
}

export class WC extends HTMLElement {
    declare static jjHtml?: ComponentFile<string>
    declare static jjCss?: ComponentFile<CSSStyleSheet>[]
    declare static jjShMode?: ShadowRootMode
    declare static observedAttributes?: string[]

    static setTemplate(href: string, options?: TemplateOptions) {
        this.jjHtml = new ComponentFile<string>(href, 'fetch', options?.loading)
        if (isStr(options?.shadowMode) && ['open', 'closed'].includes(options.shadowMode)) {
            this.jjShMode = options.shadowMode
        }
        return this
    }

    static addStyle(href: string, options?: StyleOptions) {
        if (!isArr(this.jjCss)) {
            this.jjCss = []
        }
        this.jjCss.push(new ComponentFile<CSSStyleSheet>(href, 'style', options?.loading))
        return this
    }

    async connectedCallback() {
        const {
            jjHtml: templateFile,
            jjCss: styleFiles = [],
            jjShMode: shadowMode = 'open',
        } = this.constructor as typeof WC
        const [html, ...styleSheets] = await Promise.all([
            templateFile?.promise,
            ...styleFiles.map((style) => style.promise),
        ])
        // Prevent FOUC by assigning the template and CSS in one go
        WHE.from(this).setShadow(shadowMode, html, ...styleSheets)
    }

    /**
     * The class that extends this one should define
     * `static observedAttributes[]` containing kebab-based attribute names (all lower case)
     * @param name kebab-case and in lower case exactly as it appears in `observedAttributes`
     * @param oldValue
     * @param newValue
     * @returns true if it tried to set the attribute; otherwise false
     */
    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        // Called when observed attributes change.
        if (oldValue !== newValue) {
            const observedAttributes = (this.constructor as typeof WC).observedAttributes
            if (isArr(observedAttributes) && observedAttributes.includes(name)) {
                const kebabName = keb2cam(name)
                if (hasProp(this, kebabName)) {
                    this[kebabName as keyof this] = newValue
                    return true
                }
            }
        }
        return false
    }
}
