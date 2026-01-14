import { keb2cam } from './case.js'
import { cssToStyle } from './util.js'
import { JJHE } from './JJHE.js'
import { hasProp, isArr, isStr, isObj, isFn, isA, isDef } from 'jty'

export type JJResource<T> = T | Promise<T> | (() => T | Promise<T>)
export type JJTemplateConfig = JJResource<string | JJHE | HTMLElement>
export type JJStyleConfig = JJResource<string | CSSStyleSheet> | JJResource<string | CSSStyleSheet>
export type JJStylesConfig = JJStyleConfig | JJStyleConfig[]

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

async function processTemplateConfig(template?: JJTemplateConfig): Promise<string | undefined> {
    if (isFn(template)) {
        template = await template()
    }
    template = await template
    if (!isDef(template) || isStr(template)) {
        return template
    }
    if (isA(template, JJHE)) {
        return template.getHtml()
    }
    if (isA(template, HTMLElement)) {
        return template.outerHTML
    }
    throw new TypeError(`Expected a string, JJHE or HTMLElement. Got ${template} (${typeof template})`)
}

function normalizeStyles(styles?: JJStyleConfig | JJStyleConfig[]): JJStyleConfig[] {
    if (isDef(styles)) {
        return isArr(styles) ? styles : [styles]
    }
    return []
}

async function processStyleConfig(styleConfig: JJStyleConfig): Promise<CSSStyleSheet> {
    if (isFn(styleConfig)) {
        styleConfig = await styleConfig()
    }
    styleConfig = await styleConfig
    if (isA(styleConfig, CSSStyleSheet)) {
        return styleConfig
    }
    if (isStr(styleConfig)) {
        return await cssToStyle(styleConfig)
    }
    throw new TypeError(`Expected a css string or CSSStyleSheet. Got ${styleConfig} (${typeof styleConfig})`)
}

/*
Type '[string | undefined, ...(string | CSSStyleSheet | (() => string | CSSStyleSheet | Promise<string | CSSStyleSheet>) | JJStyleConfig[])[]]' is not assignable to
  type '[string | undefined, ...CSSStyleSheet[]]'.
  
  Type at position 1 in source is not compatible with type at position 1 in target.
    Type 'string | CSSStyleSheet | (() => string | CSSStyleSheet | Promise<string | CSSStyleSheet>) | JJStyleConfig[]' is not assignable to type 'CSSStyleSheet'.
      Type 'string' is not assignable to type 'CSSStyleSheet'.ts(2322)
*/
async function processConfig(jjConfig: JJConfig): Promise<JJProcessedConfig> {
    if (!isObj(jjConfig)) {
        throw new TypeError(`Expected an static jj config object. Got ${jjConfig} (${typeof jjConfig})`)
    }
    const { template: templateConfig, styles: stylesConfig } = jjConfig
    const [template, ...styles]: [string | undefined, ...CSSStyleSheet[]] = await Promise.all([
        processTemplateConfig(templateConfig),
        ...normalizeStyles(stylesConfig).map(processStyleConfig),
    ])
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
export class JJCC extends HTMLElement {
    static _jjCache?: Promise<JJProcessedConfig>
    jjRoot?: JJHE

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
        const classRef = this.constructor as typeof JJCC
        const jj = classRef.jj
        if (!isObj(jj)) {
            throw new TypeError(`static jj object is missing from the extending class. Got ${jj} (${typeof jj})`)
        }
        if (!classRef._jjCache) {
            classRef._jjCache = processConfig(classRef.jj)
        }
        const { template, styles } = await classRef._jjCache
        const { templateMode } = jj
        this.jjRoot = JJHE.from(this).initShadow(templateMode, template, ...styles)
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
            const observedAttributes = (this.constructor as typeof JJCC).observedAttributes
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
