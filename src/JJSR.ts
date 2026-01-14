import { isA } from 'jty'
import { JJDF } from './JJDF.js'

/**
 * Wraps a DOM ShadowRoot node (which is a descendant of DocumentFragment).
 *
 * @remarks
 * The ShadowRoot interface of the Shadow DOM API is the root node of a DOM subtree
 * that is rendered separately from a document's main DOM tree.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot | ShadowRoot}
 */
export class JJSR<T extends ShadowRoot = ShadowRoot> extends JJDF<T> {
    /**
     * Creates a JJSR instance from a ShadowRoot reference.
     *
     * @param shadowRoot - The ShadowRoot instance.
     * @returns A new JJSR instance.
     */
    static from(shadowRoot: ShadowRoot) {
        return new JJSR(shadowRoot)
    }

    /**
     * Creates an instance of JJSR.
     *
     * @param shadowRoot - The ShadowRoot to wrap.
     * @throws {TypeError} If `shadowRoot` is not a ShadowRoot.
     */
    constructor(shadowRoot: T) {
        if (!isA(shadowRoot, ShadowRoot)) {
            throw new TypeError(`Expected a ShadowRoot. Got ${shadowRoot} (${typeof shadowRoot})`)
        }
        super(shadowRoot)
    }

    /**
     * Gets the inner HTML of the shadow root.
     *
     * @returns The inner HTML string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
     */
    getHtml(): string {
        return this.ref.innerHTML
    }

    /**
     * Sets the inner HTML of the shadow root.
     *
     * @param value - The HTML string.
     * @param unsafe - Reserved for future use (must be false).
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
     */
    setHtml(value: string, unsafe: false): this {
        // TODO: https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/setHTMLUnsafe
        this.ref.innerHTML = value
        return this
    }

    /**
     * Adds constructed stylesheets to the shadow root.
     *
     * @example
     * ```ts
     * const sheet = new CSSStyleSheet()
     * sheet.replaceSync('p { color: red; }')
     * shadow.addStyleSheets(sheet)
     * ```
     *
     * @param styleSheets - The stylesheets to add.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets | ShadowRoot.adoptedStyleSheets}
     */
    addStyleSheets(...styleSheets: CSSStyleSheet[]): this {
        this.ref.adoptedStyleSheets.push(...styleSheets)
        return this
    }
}
