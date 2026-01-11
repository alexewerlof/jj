import { keb2cam } from './case.js'
import { WHE } from './WHE.js'
import { hasProp, isArr, isStr, isObj, isFn, isA, isDef } from 'jty'

export async function fetchText(url: URL | string, mime: string = 'text/*') {
    if (!isStr(mime)) {
        throw new TypeError(`Expected a string mime like 'text/html' or 'text/css'. Got ${mime} (${typeof mime})`)
    }
    const response = await fetch(url, { headers: { Accept: mime } })
    if (!response.ok) {
        throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`)
    }
    return response.text()
}

export async function fetchHtml(url: URL | string): Promise<string> {
    return await fetchText(url, 'text/html')
}

export async function fetchCss(url: URL | string): Promise<string> {
    return await fetchText(url, 'text/css')
}

export async function cssToStyle(css: string): Promise<CSSStyleSheet> {
    const sheet = new CSSStyleSheet()
    return await sheet.replace(css)
}

export async function fetchStyle(url: URL | string): Promise<CSSStyleSheet> {
    return await cssToStyle(await fetchCss(url))
}

export function addLinkPre(href: string, rel: 'prefetch' | 'preload', as: 'fetch' | 'style' | 'script' = 'fetch') {
    const link = WHE.fromTag('link').setAttrs({
        rel,
        href,
        as,
    })
    document.head.append(link.ref)
    return link
}

export type JJResource<T> = T | Promise<T> | (() => T | Promise<T>)
export type JJTemplateConfig = JJResource<string>
export type JJStylesConfig = JJResource<string | CSSStyleSheet> | JJResource<string | CSSStyleSheet>[]

export interface JJConfig {
    name: string
    template?: JJTemplateConfig
    styles?: JJStylesConfig
    templateMode?: 'open' | 'closed'
}

interface JJProcessedConfig {
    template?: string
    styles: CSSStyleSheet[]
}

async function processStyleConfig(style: JJResource<string | CSSStyleSheet>): Promise<CSSStyleSheet> {
    if (isFn(style)) {
        style = await style()
    }
    style = await style
    if (isA(style, CSSStyleSheet)) {
        return style
    }
    if (isStr(style)) {
        return await cssToStyle(style)
    }
    throw new TypeError(`Expected a css string or CSSStyleSheet. Got ${style} (${typeof style})`)
}

async function processConfig(
    templateResource?: JJTemplateConfig,
    styleResources?: JJStylesConfig,
): Promise<JJProcessedConfig> {
    const templatePromise = isFn(templateResource) ? templateResource() : Promise.resolve(templateResource)
    if (!isDef(styleResources)) {
        styleResources = []
    }
    if (!isArr(styleResources)) {
        styleResources = [styleResources]
    }
    const [template, ...styles] = await Promise.all([templatePromise, ...styleResources.map(processStyleConfig)])
    return { template, styles }
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
    static _jjCache: Promise<JJProcessedConfig> | JJProcessedConfig | undefined
    declare static jj: JJConfig
    declare static observedAttributes?: string[]

    static async register(): Promise<void> {
        if (!isObj(this.jj)) {
            throw new Error(`static jj object is missing from the extending class. Got ${this.jj} (${typeof this.jj})`)
        }
        const { name } = this.jj
        if (!isStr(name)) {
            throw new TypeError(`Expected a string name. Got ${name} (${typeof name})`)
        }
        if (!customElements.get(name)) {
            customElements.define(name, this)
            await customElements.whenDefined(name)
        }
    }

    async connectedCallback() {
        const classRef = this.constructor as typeof WC
        const jj = classRef.jj
        if (!isObj(jj)) {
            throw new TypeError(`static jj object is missing from the extending class. Got ${jj} (${typeof jj})`)
        }
        if (!classRef._jjCache) {
            classRef._jjCache = processConfig(classRef.jj.template, classRef.jj.styles)
        }
        const { template, styles } = await classRef._jjCache
        const { templateMode } = jj
        WHE.from(this).setShadow(templateMode, template, ...styles)
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
