import { isA, isArr, isFn, isStr } from 'jty'
import { JJStyleConfig, JJTemplateConfig, ShadowConfig, JJHE, JJDF } from './wrappers/index.js'
import { cssToStyle } from './util.js'
import { typeErr } from './internal.js'

/**
 * Resolves a template configuration into a string suitable for Shadow DOM.
 *
 * Handles functions (sync/async), promises, strings, JJHE instances, and HTMLElements.
 * @remarks
 * If at some point it ends up with a JJHE instance or HTMLElement, a specific logic is applied..
 * If it is <TEMPLATE>, its `content` (DocumentFragment) will be used, otherwise its `outerHTML` will be used.
 *
 * @param templateConfig - The template configuration to resolve.
 * @returns A promise resolving to the HTML string, DocumentFragment, or undefined.
 * @throws {TypeError} If the resolved value is not a string, JJHE, JJDF, HTMLElement, or DocumentFragment.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML | Element.outerHTML}
 */
async function templatePromise(templateConfig?: JJTemplateConfig): Promise<ShadowConfig['template']> {
    if (templateConfig === undefined) {
        return undefined
    }

    if (isFn(templateConfig)) {
        templateConfig = await templateConfig()
    }

    templateConfig = await templateConfig

    if (isStr(templateConfig)) {
        return templateConfig
    }
    if (isA(templateConfig, JJDF)) {
        return templateConfig.ref.cloneNode(true) as DocumentFragment
    }
    if (isA(templateConfig, DocumentFragment)) {
        return templateConfig.cloneNode(true) as DocumentFragment
    }
    if (isA(templateConfig, JJHE)) {
        // If it's a <template> wrapper, return a clone of its content (DocumentFragment)
        if (templateConfig.ref instanceof HTMLTemplateElement) {
            return templateConfig.ref.content.cloneNode(true) as DocumentFragment
        }
        return templateConfig.ref.outerHTML
    }
    if (isA(templateConfig, HTMLElement)) {
        return templateConfig instanceof HTMLTemplateElement
            ? (templateConfig.content.cloneNode(true) as DocumentFragment)
            : templateConfig.outerHTML
    }

    throw typeErr('template', 'a string, JJHE, JJDF, HTMLElement, or DocumentFragment', templateConfig)
}

/**
 * Resolves a style configuration into a CSSStyleSheet.
 *
 * Handles functions (sync/async), promises, CSSStyleSheet instances, and strings.
 * Strings are converted to CSSStyleSheet using `cssToStyle`.
 *
 * @param styleConfig - The style configuration to resolve.
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

    throw typeErr('style', 'a CSS string or CSSStyleSheet', styleConfig)
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
