import { keb2cam } from './case.js'
import { WHE } from './WHE.js'
import { hasProp, isA, isArr, isStr } from 'jty'
import { WS } from './WS.js'
import { WN } from './WN.js'

export type LoadingStrategy = 'eager' | 'lazy' | 'prefetch' | 'preload'

interface ComponentResource<T> {
    get promise(): Promise<T>
}

class ComponentFile<T extends string | CSSStyleSheet> implements ComponentResource<T> {
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

class ComponentString implements ComponentResource<string> {
    promise: Promise<string>

    constructor(content: string) {
        this.promise = Promise.resolve(content)
    }
}

class ComponentCss implements ComponentResource<CSSStyleSheet> {
    promise: Promise<CSSStyleSheet>

    constructor(css: string) {
        const sheet = new CSSStyleSheet()
        this.promise = sheet.replace(css)
    }
}

export interface TemplateOptions {
    shadowMode?: ShadowRootMode
    loading?: LoadingStrategy
}

export interface StyleOptions {
    loading?: LoadingStrategy
}

/**
 * Parent class for custom components.
 * It adds a few pragmatic functionalities
 * - `setTemplate` sets the template for the custom component body
 * - `addStyle` adds a stylesheet to be used by the shadowRoot
 * - `connectedCallback` assigns the templates to shadowRoot and attaches any styles
 * - `attributeChangedCallback` sets any props that corresponds to attributes defined in `static observedAttributes`
 */
export class WC extends HTMLElement {
    declare static jjHtml?: ComponentResource<string>
    declare static jjCss?: ComponentResource<CSSStyleSheet>[]
    declare static closedShadow?: boolean
    declare static observedAttributes?: string[]

    static setTemplateFile(href: string, loading?: LoadingStrategy) {
        this.jjHtml = new ComponentFile<string>(href, 'fetch', loading)
        return this
    }

    static setTemplateHtml(html: string) {
        this.jjHtml = new ComponentString(html)
        return this
    }

    static addStyleFile(href: string, loading?: LoadingStrategy) {
        if (!isArr(this.jjCss)) {
            this.jjCss = []
        }
        this.jjCss.push(new ComponentFile<CSSStyleSheet>(href, 'style', loading))
        return this
    }

    static addStyleCss(css: string) {
        if (!isArr(this.jjCss)) {
            this.jjCss = []
        }
        this.jjCss.push(new ComponentCss(css))
        return this
    }

    async connectedCallback() {
        const { jjHtml: templateFile, jjCss: styleFiles = [], closedShadow } = this.constructor as typeof WC
        const [html, ...styleSheets] = await Promise.all([
            templateFile?.promise,
            ...styleFiles.map((style) => style.promise),
        ])
        // Prevent FOUC by assigning the template and CSS in one go
        WHE.from(this).setShadow(closedShadow ? 'closed' : 'open', html, ...styleSheets)
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
