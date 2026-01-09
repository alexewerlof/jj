import { keb2cam } from './case.js'
import { WHE } from './WHE.js'
import { hasProp, isA, isArr, isStr } from 'jty'
import { WS } from './WS.js'
import { WN } from './WN.js'

export type LoadingStrategy = 'eager' | 'lazy' | 'prefetch' | 'preload'

interface ComponentResource<T> {
    get promise(): Promise<T>
}

abstract class ComponentFile<T> implements ComponentResource<T> {
    #promise: Promise<T> | undefined

    constructor(
        protected as: 'fetch' | 'style',
        protected href: string,
        loading: LoadingStrategy = 'lazy',
    ) {
        if (!isStr(href)) {
            throw new TypeError(`Expected a string href. Got ${href} (${typeof href})`)
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

    protected abstract fetch(): Promise<T>
}

class TemplateFile extends ComponentFile<string> {
    constructor(href: string, loading?: LoadingStrategy) {
        super('fetch', href, loading)
    }

    protected async fetch(): Promise<string> {
        const response = await fetch(this.href, { headers: { Accept: 'text/html' } })
        if (!response.ok) {
            throw new Error(`GET ${this.href} failed: ${response.status} ${response.statusText}`)
        }
        return response.text()
    }
}

class StyleFile extends ComponentFile<CSSStyleSheet> {
    constructor(href: string, loading?: LoadingStrategy) {
        super('style', href, loading)
    }

    protected async fetch(): Promise<CSSStyleSheet> {
        const response = await fetch(this.href, { headers: { Accept: 'text/css' } })
        if (!response.ok) {
            throw new Error(`GET ${this.href} failed: ${response.status} ${response.statusText}`)
        }
        const text = await response.text()
        const sheet = new CSSStyleSheet()
        return sheet.replace(`${text}\n/*# sourceURL=${this.href} */`)
    }
}

class TemplateStr implements ComponentResource<string> {
    promise: Promise<string>

    constructor(content: string) {
        if (!isStr(content)) {
            throw new TypeError(`Expected a HTML string. Got ${content} (${typeof content})`)
        }
        this.promise = Promise.resolve(content)
    }
}

class StyleStr implements ComponentResource<CSSStyleSheet> {
    promise: Promise<CSSStyleSheet>

    constructor(css: string) {
        if (!isStr(css)) {
            throw new TypeError(`Expected a CSS string. Got ${css} (${typeof css})`)
        }
        const sheet = new CSSStyleSheet()
        this.promise = sheet.replace(css)
    }
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
    declare static jjTemplate?: ComponentResource<string>
    declare static jjStyle?: ComponentResource<CSSStyleSheet>[]
    declare static closedShadow?: boolean
    declare static observedAttributes?: string[]

    static setTemplateFile(href: string, loading?: LoadingStrategy) {
        this.jjTemplate = new TemplateFile(href, loading)
        return this
    }

    static setTemplateHtml(html: string) {
        this.jjTemplate = new TemplateStr(html)
        return this
    }

    static addStyleFile(href: string, loading?: LoadingStrategy) {
        if (!isArr(this.jjStyle)) {
            this.jjStyle = []
        }
        this.jjStyle.push(new StyleFile(href, loading))
        return this
    }

    static addStyleCss(css: string) {
        if (!isArr(this.jjStyle)) {
            this.jjStyle = []
        }
        this.jjStyle.push(new StyleStr(css))
        return this
    }

    async connectedCallback() {
        const { jjTemplate: template, jjStyle: style = [], closedShadow } = this.constructor as typeof WC
        const [html, ...styleSheets] = await Promise.all([template?.promise, ...style.map((style) => style.promise)])
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
