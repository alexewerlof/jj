import { keb2cam } from './case.js'
import { cssToStyle } from './util.js'
import { JJHE } from './JJHE.js'
import { hasProp, isArr, isStr, isObj, isFn, isA, isDef } from 'jty'

/**
 * Represents a resource that can be a direct value, a Promise, or a function returning either.
 * Used for lazy loading or dynamic generation.
 */
export type JJResource<T> = T | Promise<T> | (() => T | Promise<T>)

/**
 * Configuration for the component's template.
 * Can be an HTML string, a JJHE instance, or a raw HTMLElement.
 */
export type JJTemplateConfig = JJResource<string | JJHE | HTMLElement>

/**
 * Configuration for the component's styles.
 * Can be a CSS string or a CSSStyleSheet.
 */
export type JJStyleConfig = JJResource<string | CSSStyleSheet> | JJResource<string | CSSStyleSheet>

/**
 * Configuration for one or more style resources.
 */
export type JJStylesConfig = JJStyleConfig | JJStyleConfig[]

/**
 * Configuration object for defining a JJCC component.
 */
export interface JJConfig {
    /** The tag name for the custom element. Must contain a hyphen. */
    name: string
    /** The template configuration. */
    template?: JJTemplateConfig
    /** The styles configuration. */
    styles?: JJStylesConfig
    /** The Shadow DOM mode. Defaults to 'open'. */
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

function stylesConfigToArr(styles?: JJStylesConfig): JJStyleConfig[] {
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
        ...stylesConfigToArr(stylesConfig).map(processStyleConfig),
    ])
    return { template, styles }
}
/**
 * Parent class for custom components.
 *
 * @remarks
 * It adds a few pragmatic functionalities:
 * - `connectedCallback` assigns the templates to shadowRoot and attaches any styles.
 * - `attributeChangedCallback` sets any props that corresponds to attributes defined in `static observedAttributes`.
 *
 * @example
 * // Simple inline component
 * ```ts
 * import { JJCC } from 'jj'
 *
 * class SimpleGreeting extends JJCC {
 *   static jj = {
 *     name: 'simple-greeting',
 *     template: '<div>Hello World!</div>',
 *     styles: 'div { color: blue; }'
 *   }
 * }
 * SimpleGreeting.register()
 * ```
 *
 * // Advanced component with external template and styles.
 * // This keeps your HTML, CSS, and JS separate for better organization.
 * ```ts
 * // my-component.js
 * import { JJCC, fetchHtml, fetchCss } from 'jj'
 *
 * export class MyComponent extends JJCC {
 *   // `jj` configures the component.
 *   static jj = {
 *     // The custom element tag name. Must contain a hyphen.
 *     name: 'my-component',
 *
 *     // Eagerly fetch template and styles when the module is loaded.
 *     // `import.meta.resolve` gets the URL relative to the current module.
 *     template: fetchHtml(import.meta.resolve('./my-component.html')),
 *     styles: fetchCss(import.meta.resolve('./my-component.css')),
 *   }
 *
 *   // Observe attributes for changes.
 *   static observedAttributes = ['name']
 *
 *   // Properties are automatically set from attributes.
 *   set name(value: string) {
 *     // this.jjRoot is a JJHE wrapper around the component's shadow root.
 *     this.jjRoot?.query('#name-span')?.setText(value)
 *   }
 * }
 * MyComponent.register()
 *
 * // You can also lazy-load resources by providing a function that returns the resource or a promise that resolves to the resource.
 * // The function will be called only when the component is first connected to the DOM and the result is cached.
 * class LazyComponent extends JJCC {
 *   static jj = {
 *     name: 'lazy-component',
 *     template: () => fetchHtml(import.meta.resolve('./lazy.html')),
 *     styles: () => fetchCss(import.meta.resolve('./lazy.css')),
 *   }
 * }
 * LazyComponent.register()
 * ```
 *
 * ```html
 * <div>
 *   Hello, <span id="name-span">Guest</span>!
 * </div>
 * ```
 *
 * ```css
 * div {
 *   border: 1px solid #ccc;
 *   padding: 1rem;
 * }
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements | Using custom elements}
 */
export class JJCC extends HTMLElement {
    /** @internal Cache for processed configuration. */
    static _jjCache?: Promise<JJProcessedConfig>
    /** The wrapper around the component's Shadow Root (or host). */
    jjRoot?: JJHE

    /**
     * The configuration object for the component.
     * The class that extens JJCC _MUST_ set this otherwise things don't work.
     */
    declare static jj: JJConfig
    /**
     * Attributes to observe for changes.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes | Responding to attribute changes}
     */
    declare static observedAttributes?: string[]

    /**
     * Registers the custom element with the browser.
     *
     * @throws {Error} If `static jj` is missing.
     * @throws {TypeError} If `jj.name` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define | customElements.define}
     */
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

    /**
     * Invoked when the custom element is appended to the document's DOM.
     * Initializes the Shadow DOM with the processed template and styles.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#using_the_lifecycle_callbacks | Lifecycle callbacks}
     */
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
     * Called when observed attributes change.
     *
     * @remarks
     * The class that extends this one should define `static observedAttributes[]` containing kebab-based attribute names.
     * This method automatically maps kebab-case attributes to camelCase properties on the instance.
     *
     * @param name - kebab-case and in lower case exactly as it appears in `observedAttributes`.
     * @param oldValue - The previous value of the attribute.
     * @param newValue - The new value of the attribute.
     * @returns `true` if it tried to set the attribute; otherwise `false`.
     */
    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        // Called when observed attributes change.
        if (oldValue !== newValue) {
            const { observedAttributes } = this.constructor as typeof JJCC
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
