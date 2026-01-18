import { isA, isArr, isObj, isStr } from 'jty'
import { JJN } from './JJN.js'
import { JJSR } from './JJSR.js'
import { IAppendPrepend, IById, IQuery } from './mixin-types.js'
import { ShadowConfig, Wrapped } from './types.js'

export interface JJE<T extends Element> extends IQuery, IAppendPrepend {}

/**
 * Wraps a DOM Element (which is a descendant of Node).
 *
 * @remarks
 * This class provides a wrapper around the native `Element` interface, adding fluent API methods
 * for attribute manipulation, class handling, and event binding.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element | Element}
 */
export class JJE<T extends Element = Element> extends JJN<T> implements IById {
    /**
     * Creates a JJE instance from an Element reference.
     *
     * @example
     * ```ts
     * const el = JJE.from(document.querySelector('.my-class'))
     * ```
     *
     * @param ref - The Element instance.
     * @returns A new JJE instance.
     */
    static from(ref: Element): JJE {
        return new JJE(ref)
    }

    /**
     * Creates an instance of JJE.
     *
     * @param ref - The Element to wrap.
     * @throws {TypeError} If `ref` is not an Element.
     */
    constructor(ref: T) {
        if (!isA(ref, Element)) {
            throw new TypeError(`Expected an Element. Got: ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    /**
     * Finds an element by ID within this element's context
     *
     * @remarks
     * This method uses `Element.querySelector()` under the hood.
     *
     * @param id - The ID to search for.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null if not found and throwIfNotFound is false.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector | Element.querySelector}
     */
    byId(id: string, throwIfNotFound = true): Wrapped | null {
        if (!isStr(id)) {
            throw new TypeError(`Expected a string id. Got ${id} (${typeof id})`)
        }
        return this.query(`#${id}`, throwIfNotFound)
    }

    /**
     * Gets the value of an attribute.
     *
     * @param name - The name of the attribute.
     * @returns The attribute value, or null if not present.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute | Element.getAttribute}
     */
    getAttr(name: string): string | null {
        return this.ref.getAttribute(name)
    }

    /**
     * Checks if an attribute exists.
     *
     * @param name - The name of the attribute.
     * @returns `true` if the attribute exists, otherwise `false`.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute | Element.hasAttribute}
     */
    hasAttr(name: string): boolean {
        return this.ref.hasAttribute(name)
    }

    /**
     * Sets the value of an attribute.
     *
     * @param name - The name of the attribute.
     * @param value - The value to set.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute | Element.setAttribute}
     */
    setAttr(name: string, value: string): this {
        this.ref.setAttribute(name, value)
        return this
    }

    /**
     * Sets multiple attributes at once.
     *
     * @example
     * ```ts
     * el.setAttrs({ id: 'my-id', class: 'my-class' })
     * ```
     *
     * @param obj - An object where keys are attribute names and values are attribute values.
     * @returns This instance for chaining.
     * @throws {TypeError} If `obj` is not an object.
     */
    setAttrs(obj: Record<string, string>): this {
        if (!isObj(obj)) {
            throw new TypeError(`Expected an object. Got: ${obj} (${typeof obj})`)
        }
        for (const [name, value] of Object.entries(obj)) {
            this.setAttr(name, value)
        }
        return this
    }

    /**
     * Removes an attribute.
     *
     * @param name - The name of the attribute to remove.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute | Element.removeAttribute}
     */
    rmAttr(name: string) {
        return this.rmAttrs(name)
    }

    /**
     * Removes multiple attributes.
     *
     * @param names - The names of the attributes to remove.
     * @returns This instance for chaining.
     */
    rmAttrs(...names: string[]): this {
        for (const name of names) {
            this.ref.removeAttribute(name)
        }
        return this
    }

    /**
     * Gets the value of an ARIA attribute.
     *
     * @remarks
     * Automatically prepends `aria-` to the name.
     *
     * @example
     * ```ts
     * el.getAria('label') // gets 'aria-label'
     * ```
     *
     * @param name - The ARIA attribute suffix (e.g., 'label' for 'aria-label').
     * @returns The attribute value, or null if not present.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes | ARIA Attributes}
     */
    getAria(name: string): string | null {
        return this.ref.getAttribute(`aria-${name}`)
    }

    /**
     * Checks if an ARIA attribute exists.
     *
     * @param name - The ARIA attribute suffix.
     * @returns `true` if the attribute exists.
     */
    hasAria(name: string): boolean {
        return this.ref.hasAttribute(`aria-${name}`)
    }

    /**
     * Sets an ARIA attribute.
     *
     * @example
     * ```ts
     * el.setAria('hidden', 'true') // sets aria-hidden="true"
     * ```
     *
     * @param name - The ARIA attribute suffix.
     * @param value - The value to set.
     * @returns This instance for chaining.
     */
    setAria(name: string, value: string): this {
        this.ref.setAttribute(`aria-${name}`, value)
        return this
    }

    /**
     * Removes an ARIA attribute.
     *
     * @param name - The ARIA attribute suffix.
     * @returns This instance for chaining.
     */
    rmAria(name: string): this {
        this.ref.removeAttribute(`aria-${name}`)
        return this
    }

    /**
     * Gets the class attribute.
     *
     * @returns The class attribute value, or null if not present.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/className | Element.className}
     */
    getClass(): string | null {
        return this.getAttr('class')
    }

    /**
     * Sets the class attribute.
     *
     * @param className - The class string to set.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/className | Element.className}
     */
    setClass(className: string): this {
        return this.setAttr('class', className)
    }

    /**
     * Removes the `class` attribute of the element.
     *
     * @remarks
     * If you want to remove a few specific class instead of all, use `rmClasses`
     *
     * @returns This instance for chaining.
     */
    rmClass(): this {
        return this.rmAttr('class')
    }

    /**
     * Adds one or more classes to the element.
     *
     * @param classNames - The classes to add.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/add | DOMTokenList.add}
     */
    addClass(...classNames: string[]): this {
        this.ref.classList.add(...classNames)
        return this
    }

    /**
     * Removes one or more classes from the element.
     *
     * @param classNames - The classes to remove.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/remove | DOMTokenList.remove}
     */
    rmClasses(...classNames: string[]): this {
        this.ref.classList.remove(...classNames)
        return this
    }

    /**
     * Checks if the element has a specific class.
     *
     * @param className - The class to check for.
     * @returns `true` if the element has the class.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/contains | DOMTokenList.contains}
     */
    hasClass(className: string): boolean {
        return this.ref.classList.contains(className)
    }

    /**
     * Toggles a class on the element.
     *
     * @param className - The class to toggle.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle | DOMTokenList.toggle}
     */
    toggleClass(className: string): this {
        this.ref.classList.toggle(className)
        return this
    }

    /**
     * Replaces a class with another one
     *
     * @remarks
     * If the `oldClassName` doesn't exist, the `newClassName` isn't added
     *
     * @param oldClassName - The class name to remove
     * @param newClassName - The class name to add
     */
    replaceClass(oldClassName: string, newClassName: string): this {
        this.ref.classList.replace(oldClassName, newClassName)
        return this
    }

    /**
     * Adds a click event listener.
     *
     * @param handler - The event handler.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener | EventTarget.addEventListener}
     */
    onClick(handler: EventListenerOrEventListenerObject): this {
        return this.on('click', handler)
    }

    /**
     * Hides the element by setting the `hidden` attribute and `aria-hidden="true"`.
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden | hidden attribute}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-hidden | aria-hidden}
     */
    hide(): this {
        return this.setAttr('hidden', '').setAttr('aria-hidden', 'true')
    }

    /**
     * Shows the element by removing the `hidden` and `aria-hidden` attributes.
     *
     * @returns This instance for chaining.
     */
    show(): this {
        return this.rmAttrs('hidden', 'aria-hidden')
    }

    /**
     * Disables the element by setting the `disabled` attribute and `aria-disabled="true"`.
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled | disabled attribute}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled | aria-disabled}
     */
    disable(): this {
        return this.setAttr('disabled', '').setAttr('aria-disabled', 'true')
    }

    /**
     * Enables the element by removing the `disabled` and `aria-disabled` attributes.
     *
     * @returns This instance for chaining.
     */
    enable(): this {
        return this.rmAttrs('disabled', 'aria-disabled')
    }

    /**
     * Gets the title attribute.
     *
     * @returns The title, or null if not set.
     */
    getTitle(): string | null {
        return this.getAttr('title')
    }

    /**
     * Sets the title attribute.
     *
     * @param title - The title to set.
     * @returns This instance for chaining.
     */
    setTitle(title: string): this {
        return this.setAttr('title', title)
    }

    /**
     * Sets the id attribute.
     *
     * @param id - The id to set.
     * @returns This instance for chaining.
     */
    setId(id: string): this {
        return this.setAttr('id', id)
    }

    /**
     * Gets the id attribute.
     *
     * @returns The id, or null if not set.
     */
    getId(): string | null {
        return this.getAttr('id')
    }

    /**
     * Gets the inner HTML of the element.
     *
     * @returns The inner HTML string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
     */
    getHTML(): string {
        return this.ref.innerHTML
    }

    /**
     * Sets the inner HTML of the element.
     *
     * @param html - The HTML string to set.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
     */
    setHTML(html: string): this {
        this.ref.innerHTML = html
        return this
    }

    /**
     * Attaches a Shadow DOM to the element and optionally sets its content and styles.
     *
     * @remarks
     * We prevent FOUC by assigning the template and CSS in one go.
     * **Note:** You can't attach a shadow root to every type of element. There are some that can't have a
     * shadow DOM for security reasons (for example `<a>`).
     *
     * @param mode - The encapsulation mode ('open' or 'closed'). Defaults to 'open'.
     * @param config - Optional configuration object containing `template` (HTML string) and `styles` (array of CSSStyleSheet).
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow | Element.attachShadow}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets | ShadowRoot.adoptedStyleSheets}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets | Document.adoptedStyleSheets}
     */
    initShadow(mode: ShadowRootMode = 'open', config?: ShadowConfig): this {
        const shadowRoot = this.ref.shadowRoot ?? this.ref.attachShadow({ mode })
        if (isObj(config)) {
            const { template, styles } = config

            if (template) {
                shadowRoot.innerHTML = template
            }
            if (isArr(styles) && styles.length) {
                shadowRoot.adoptedStyleSheets.push(...styles)
            }
        }
        return this
    }

    /**
     * Gets a wrapper around the element's Shadow Root, if it exists.
     *
     * @returns A JJSR instance wrapping the shadow root, or null if no shadow root exists.
     */
    get shadow() {
        return this.ref.shadowRoot ? new JJSR(this.ref.shadowRoot) : null
    }
}
