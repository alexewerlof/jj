import { hasProp, isA, isArr, isDef, isFn, isStr } from 'jty'
import { JJStyleConfig, JJTemplateConfig, ShadowConfig } from './types.js'
import { JJHE } from './JJHE.js'
import { cssToStyle } from './util.js'
import { keb2cam } from './case.js'

/**
 * Resolves a template configuration into a string suitable for Shadow DOM.
 *
 * Handles functions (sync/async), promises, strings, JJHE instances, and HTMLElements.
 *
 * @param templateConfig - The configuration to resolve.
 * @returns A promise resolving to the HTML string or undefined.
 * @throws {TypeError} If the resolved value is not a string, JJHE, or HTMLElement.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML | Element.outerHTML}
 */
async function templatePromise(templateConfig?: JJTemplateConfig): Promise<ShadowConfig['template']> {
    if (!isDef(templateConfig)) {
        return undefined
    }

    if (isFn(templateConfig)) {
        templateConfig = await templateConfig()
    }

    templateConfig = await templateConfig

    if (isStr(templateConfig)) {
        return templateConfig
    }
    if (isA(templateConfig, JJHE)) {
        return templateConfig.getHTML()
    }
    if (isA(templateConfig, HTMLElement)) {
        return templateConfig.outerHTML
    }

    throw new TypeError(`Expected a string, JJHE or HTMLElement. Got ${templateConfig} (${typeof templateConfig})`)
}

/**
 * Resolves a style configuration into a CSSStyleSheet.
 *
 * Handles functions (sync/async), promises, CSSStyleSheet instances, and strings.
 * Strings are converted to CSSStyleSheet using `cssToStyle`.
 *
 * @param styleConfig - The configuration to resolve.
 * @returns A promise resolving to a CSSStyleSheet.
 * @throws {TypeError} If the resolved value is not a string or CSSStyleSheet.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet | CSSStyleSheet}
 */
async function stylePromise(styleConfig?: JJStyleConfig): Promise<CSSStyleSheet> {
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

/**
 * Maps an array of style configurations to an array of promises resolving to CSSStyleSheets.
 *
 * @param styleConfigs - Array of style configurations.
 * @returns Array of promises.
 */
function stylePromises(styleConfigs?: JJStyleConfig[]): Promise<CSSStyleSheet>[] {
    if (!isArr(styleConfigs)) {
        return []
    }

    return styleConfigs.map(stylePromise)
}

/**
 * Resolves both template and style configurations.
 *
 * @param templateConfig - The template configuration.
 * @param styleConfigs - The style configurations.
 * @returns A promise resolving to the final ShadowConfig.
 */
async function resolveConfig(templateConfig?: JJTemplateConfig, styleConfigs?: JJStyleConfig[]): Promise<ShadowConfig> {
    const [template, ...styles] = await Promise.all([templatePromise(templateConfig), ...stylePromises(styleConfigs)])
    return { template, styles }
}

/**
 * Manages the resolution of Shadow DOM configuration (template and styles).
 *
 * Allows building up the configuration and resolving it lazily.
 *
 * @example
 * ```ts
 * const sm = ShadowMaster.create()
 *   .setTemplate('<div>Hello World</div>')
 *   .addStyles('div { color: red; }')
 *
 * class MyComponent extends HTMLElement {
 *   async connectedCallback() {
 *      // Resolves the config once and caches it
 *      const shadowConfig = await sm.getResolved()
 *      // ... init shadow root with shadowConfig
 *   }
 * }
 * ```
 */
export class ShadowMaster {
    #templateConfig?: JJTemplateConfig = undefined
    #stylesConfig: JJStyleConfig[] = []
    #normalizedConfig?: Promise<ShadowConfig> = undefined

    /**
     * Creates a new instance of ShadowMaster.
     *
     * @returns A new ShadowMaster instance.
     */
    static create() {
        return new ShadowMaster()
    }

    constructor() {}

    /**
     * Sets the template configuration.
     *
     * @param templateConfig - The template configuration.
     * @returns The instance for chaining.
     *
     * @example
     * ```ts
     * // Accepts string, promise, or fetchHtml result
     * sm.setTemplate(fetchHtml('./template.html'))
     * ```
     */
    setTemplate(templateConfig?: JJTemplateConfig): this {
        this.#templateConfig = templateConfig
        return this
    }

    /**
     * Adds one or more style configurations.
     *
     * @param stylesConfig - Variable number of style configurations.
     * @returns The instance for chaining.
     *
     * @example
     * ```ts
     * sm.addStyles(
     *     'p { color: red; }',
     *     fetchCss('./styles.css'),
     *     () => fetchCss('../lazy-loaded-styles.css'),
     * )
     * ```
     */
    addStyles(...stylesConfig: JJStyleConfig[]): this {
        this.#stylesConfig.push(...stylesConfig)
        return this
    }

    /**
     * Resolves the configuration to something that can be fed to `JJHE.initShadow()` function
     *
     * The result is cached, so subsequent calls return the same promise.
     * Note: Any changes made to the ShadowMaster instance (via setTemplate/addStyles)
     * after the first call to getResolved() will be ignored.
     *
     * @returns A promise resolving to the ShadowConfig.
     */
    async getResolved(): Promise<ShadowConfig> {
        if (!this.#normalizedConfig) {
            this.#normalizedConfig = resolveConfig(this.#templateConfig, this.#stylesConfig)
        }
        return await this.#normalizedConfig
    }
}

/**
 * A helper to bridge the attribute world (kebab-case) to the property world (camelCase).
 * It works in tandem with browser's `observedAttributes` feature which triggers
 * `attributeChangedCallback`.
 *
 * @remarks
 * Your custom component class MUST define `static observedAttributes[]` otherwise `attributeChangedCallback` won't trigger.
 * `observedAttributes` should contain kebab-based attribute names.
 *
 * @example
 * ```ts
 * class MyComponent extends HTMLElement {
 *     static observedAttributes = ['user-name', 'counter']
 *     userName = '' // Property MUST exist on the instance (or prototype setter)
 *     #counter = 0  // You can also use private properties together with getter/setters
 *   
 *     attributeChangedCallback(name, oldValue, newValue) {
 *         attr2prop(this, name, oldValue, newValue)
 *     }

 *     get counter() {
 *         return this.#counter
 *     }
 * 
 *     set counter(value) {
 *         this.#counter = value
 *         this.#render() // You can call your render function to update the DOM
 *     }
 * 
 *     #render() {
 *         const shadow = JJHE.from(this).shadow
 *         if (shadow) {
 *             shadow.byId('user').setText(this.userName)
 *             shadow.byId('counter').setText(this.counter)
 *         }
 *     }
 * }
 * ```
 *
 * @param instance - A reference to the common component instance
 * @param name - kebab-case and in lower case exactly as it appears in `observedAttributes`.
 * @param oldValue - The previous value of the attribute.
 * @param newValue - The new value of the attribute.
 * @returns `true` if it tried to set the attribute; otherwise `false`.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes | Responding to attribute changes}
 */
export function attr2prop(instance: HTMLElement, name: string, oldValue: any, newValue: any) {
    if (!isA(instance, HTMLElement)) {
        throw new TypeError(
            `Expected an HTMLElement or a custom element instance. Got ${instance} (${typeof instance})`,
        )
    }
    // Called when observed attributes change.
    if (oldValue !== newValue) {
        const propName = keb2cam(name)
        if (hasProp(instance, propName)) {
            instance[propName] = newValue
            return true
        }
    }
    return false
}

/**
 * Registers the custom element with the browser and waits till it is defined.
 *
 * @example
 * ```ts
 * class MyComponent extends HTMLElement {}
 * await registerComponent('my-component', MyComponent)
 * ```
 * Another convention is to have a `static async register()` function in the Custom Component.
 * ```ts
 * export class MyComponent extends HTMLElement {
 *     static async register() {
 *         return registerComponent('my-component', MyComponent)
 *     }
 * }
 * ```
 * That way, you can import multiple components and do a `Promise.all()` on all their `.register()`s.
 * ```ts
 * import { MyComponent, YourComponent, TheirComponent } ...
 * await Promise.all([
 *     MyComponent.register(),
 *     YourComponent.register(),
 *     TheirComponent.register(),
 * ])
 *
 * @throws {TypeError} If name is not a string or constructor is not a function
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define | customElements.define}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/whenDefined | customElements.whenDefined}
 */
export async function registerComponent(
    name: string,
    constructor: CustomElementConstructor,
    options?: ElementDefinitionOptions,
): Promise<void> {
    if (!isStr(name)) {
        throw new TypeError(`Expected a string name. Got ${name} (${typeof name})`)
    }
    if (!isFn(constructor)) {
        throw new TypeError(`Expected a constructor function. Got ${constructor} (${typeof constructor})`)
    }
    if (!customElements.get(name)) {
        customElements.define(name, constructor, options)
        await customElements.whenDefined(name)
    }
}
