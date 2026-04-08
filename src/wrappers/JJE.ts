import { Wrapped } from './types.js'
import { isInstance, isObj, isStr, typeErr } from '../internal.js'
import { JJSR } from './JJSR.js'
import { JJNx } from './JJNx.js'
import type { JJDF } from './JJDF.js'
import type { JJHE } from './JJHE.js'

/**
 * Wraps a DOM Element (which is a descendant of Node).
 *
 * @remarks
 * This class provides a wrapper around the native `Element` interface, adding fluent API methods
 * for attribute manipulation, class handling, and event binding.
 *
 * @category Wrappers
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element | Element}
 */
export class JJE<T extends Element = Element> extends JJNx<T> {
    /**
     * Creates a JJE instance from an Element reference.
     *
     * @remarks
     * Use this factory method to wrap an existing Element. For creating new Elements,
     * use the specific wrapper type: {@link JJHE.create}, {@link JJSE.create}, or {@link JJME.create}.
     *
     * @example
     * ```ts
     * const el = JJE.from(document.querySelector('.my-class'))
     * ```
     *
     * @param ref - The Element instance.
     * @returns A new JJE instance.
     * @see {@link JJHE.create} for creating HTMLElements
     * @see {@link JJSE.create} for creating SVGElements
     * @see {@link JJME.create} for creating MathMLElements
     */
    static from(ref: Element): JJE {
        return new JJE(ref)
    }

    /**
     * Creates an instance of JJE.
     *
     * @param ref - The Element to wrap.
     * @throws {TypeError} If `ref` is not an Element.
     * @see {@link JJHE} for wrapping HTMLElements
     * @see {@link JJSE} for wrapping SVGElements
     * @see {@link JJME} for wrapping MathMLElements
     */
    constructor(ref: T) {
        if (!isInstance(ref, Element)) {
            throw typeErr(
                'ref',
                'an Element instance',
                ref,
                'Use JJHE.from(), JJSE.from(), or JJME.from() with the appropriate Element type.',
            )
        }
        super(ref)
    }

    /**
     * Gets the value of an attribute.
     *
     * @param name - The name of the attribute.
     * @returns The attribute value, or null if not present.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute | Element.getAttribute}
     */
    getAttr(name: string): string | null {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }
        return this.ref.getAttribute(name)
    }

    /**
     * Checks if an attribute exists.
     *
     * @param name - The name of the attribute.
     * @returns `true` if the attribute exists, otherwise `false`.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute | Element.hasAttribute}
     */
    hasAttr(name: string): boolean {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }
        return this.ref.hasAttribute(name)
    }

    /**
     * Sets a single attribute on the Element.
     *
     * @example
     * ```ts
     * el.setAttr('id', 'my-id')
     * el.setAttr('x', 50)  // Numbers are automatically converted
     * ```
     *
     * @throws {TypeError} If arguments are invalid types.
     * @see {@link setAttrs} for setting multiple attributes at once.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute | Element.setAttribute}
     */
    setAttr(name: string, value: unknown): this {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }

        this.ref.setAttribute(name, value as string)
        return this
    }

    /**
     * Sets multiple attributes from an object, or no-ops for nullish input.
     *
     * @remarks
     * This helper is useful for optional attribute bags in builder APIs.
     * - `null` or `undefined`: does nothing and returns `this`
     * - plain object: sets each attribute on the element
     * - anything else: throws `TypeError`
     *
     * @example
     * ```ts
     * el.setAttrs({ id: 'app', role: 'main' })
     * el.setAttrs(null) // no-op
     * ```
     *
     * @param attributes - Attributes object or nullish to skip.
     * @returns This instance for chaining.
     * @throws {TypeError} If `attributes` is not nullish and not a plain object.
     * @see {@link setAttr} for setting a single attribute.
     */
    setAttrs(attributes?: Record<string, unknown> | null): this {
        if (attributes == null) {
            return this
        }
        if (!isObj(attributes)) {
            throw typeErr(
                'attributes',
                'a plain object',
                attributes,
                'Pass null/undefined or an object like { id: "app" }.',
            )
        }
        for (const [name, value] of Object.entries(attributes)) {
            this.setAttr(name, value)
        }
        return this
    }

    /**
     * Removes one or more attributes from the Element.
     *
     * @example
     * ```ts
     * el.rmAttr('disabled')  // Remove single
     * el.rmAttr('hidden', 'aria-hidden')  // Remove multiple
     * ```
     *
     * @param names - The name(s) of the attribute(s) to remove.
     * @returns This instance for chaining.
     * @throws {TypeError} If any name is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute | Element.removeAttribute}
     */
    rmAttr(...names: string[]): this {
        for (const name of names) {
            if (!isStr(name)) {
                throw typeErr('name', 'a string', name)
            }
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
     * el.getAriaAttr('label') // gets 'aria-label'
     * ```
     *
     * @param name - The ARIA attribute suffix (e.g., 'label' for 'aria-label').
     * @returns The attribute value, or null if not present.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes | ARIA Attributes}
     */
    getAriaAttr(name: string): string | null {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }
        return this.ref.getAttribute(`aria-${name}`)
    }

    /**
     * Checks if an ARIA attribute exists.
     *
     * @param name - The ARIA attribute suffix.
     * @returns `true` if the attribute exists.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link getAriaAttr} for reading ARIA values.
     * @see {@link setAriaAttr} for setting ARIA values.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes | ARIA Attributes}
     */
    hasAriaAttr(name: string): boolean {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }
        return this.ref.hasAttribute(`aria-${name}`)
    }

    /**
     * Sets a single ARIA attribute on the Element.
     *
     * @example
     * ```ts
     * el.setAriaAttr('hidden', 'true')
     * el.setAriaAttr('level', 2)
     * ```
     *
     * @param name - The ARIA attribute suffix.
     * @param value - The value to assign.
     * @returns This instance for chaining.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link setAriaAttrs} for setting multiple ARIA attributes at once.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes | ARIA Attributes}
     */
    setAriaAttr(name: string, value: unknown): this {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }

        this.ref.setAttribute(`aria-${name}`, value as string)
        return this
    }

    /**
     * Sets multiple ARIA attributes from an object, or no-ops for nullish input.
     *
     * @remarks
     * This helper is useful for optional ARIA attribute bags in builder APIs.
     * - `null` or `undefined`: does nothing and returns `this`
     * - plain object: sets each ARIA attribute on the element
     * - anything else: throws `TypeError`
     *
     * @example
     * ```ts
     * el.setAriaAttrs({ label: 'Close', hidden: 'false' })
     * el.setAriaAttrs(null) // no-op
     * ```
     *
     * @param attributes - ARIA attributes object or nullish to skip.
     * @returns This instance for chaining.
     * @throws {TypeError} If `attributes` is not nullish and not a plain object.
     * @see {@link setAriaAttr} for setting a single ARIA attribute.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes | ARIA Attributes}
     */
    setAriaAttrs(attributes?: Record<string, unknown> | null): this {
        if (attributes == null) {
            return this
        }
        if (!isObj(attributes)) {
            throw typeErr(
                'attributes',
                'a plain object',
                attributes,
                'Pass null/undefined or an object like { hidden: "true" }.',
            )
        }

        try {
            for (const [name, value] of Object.entries(attributes)) {
                this.setAriaAttr(name, value)
            }
        } catch (cause) {
            throw new Error(`Failed to set some ARIA attributes from object: ${JSON.stringify(attributes)}.`, { cause })
        }
        return this
    }

    /**
     * Removes one or more ARIA attributes from the Element.
     *
     * @example
     * ```ts
     * el.rmAriaAttr('hidden')  // Remove single
     * el.rmAriaAttr('label', 'hidden')  // Remove multiple
     * ```
     *
     * @param names - The ARIA attribute suffix(es) to remove.
     * @returns This instance for chaining.
     * @throws {TypeError} If any name is not a string.
     * @see {@link setAriaAttr} for setting a single ARIA attribute.
     * @see {@link setAriaAttrs} for setting multiple ARIA attributes.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute | Element.removeAttribute}
     */
    rmAriaAttr(...names: string[]): this {
        try {
            for (const name of names) {
                if (!isStr(name)) {
                    throw typeErr('name', 'a string', name)
                }
                this.ref.removeAttribute(`aria-${name}`)
            }
        } catch (cause) {
            throw new Error(`Failed to remove some ARIA attributes: ${JSON.stringify(names)}.`, { cause })
        }
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
     * @remarks
     * To remove all classes, pass an empty string: `setClass('')`
     *
     * @example
     * ```ts
     * el.setClass('btn btn-primary')
     * el.setClass('')
     * ```
     *
     * @param className - The full class attribute value.
     * @returns This instance for chaining.
     * @throws {TypeError} If `className` is not a string.
     * @see {@link setClasses} for conditional class maps.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/className | Element.className}
     */
    setClass(className: string): this {
        if (!isStr(className)) {
            throw typeErr('className', 'a string', className)
        }

        return this.setAttr('class', className)
    }

    /**
     * Conditionally adds or removes classes from an object map, or no-ops for nullish input.
     *
     * @remarks
     * - `null` or `undefined`: does nothing and returns `this`
     * - plain object: truthy values add a class, falsy values remove it
     * - anything else: throws `TypeError`
     *
     * @example
     * ```ts
     * el.setClasses({
     *   active: true,
     *   disabled: false,
     *   highlight: isHighlighted,
     * })
     * el.setClasses(null) // no-op
     * ```
     *
     * @param classMap - Conditional class map or nullish to skip.
     * @returns This instance for chaining.
     * @throws {TypeError} If `classMap` is not nullish and not a plain object.
     * @see {@link setClass} for replacing the full class attribute.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     */
    setClasses(classMap?: Record<string, boolean | unknown> | null): this {
        if (classMap == null) {
            return this
        }
        if (!isObj(classMap)) {
            throw typeErr(
                'classMap',
                'a plain object',
                classMap,
                'Pass null/undefined or an object like { active: true }.',
            )
        }

        try {
            for (const [className, condition] of Object.entries(classMap)) {
                if (condition) {
                    this.addClass(className)
                } else {
                    this.rmClass(className)
                }
            }
        } catch (cause) {
            throw new Error(`Failed to set some classes from object: ${JSON.stringify(classMap)}.`, { cause })
        }
        return this
    }

    /**
     * Adds one or more classes to the Element.
     *
     * @example
     * ```ts
     * el.addClass('btn', 'btn-primary')
     * ```
     *
     * @param classNames - The classes to add.
     * @returns This instance for chaining.
     * @throws {TypeError} If any class name is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/add | DOMTokenList.add}
     */
    addClass(...classNames: string[]): this {
        for (const className of classNames) {
            if (!isStr(className)) {
                throw typeErr('className', 'a string', className)
            }
        }
        this.ref.classList.add(...classNames)
        return this
    }

    /**
     * Adds multiple classes from an array of class names.
     *
     * @example
     * ```ts
     * el.addClasses(['btn', 'btn-primary'])
     * ```
     *
     * @param classNames - The classes to add.
     * @returns This instance for chaining.
     * @throws {TypeError} If `classNames` is not an array.
     * @throws {TypeError} If any class name in `classNames` is not a string.
     * @see {@link addClass} for adding one or more classes via rest arguments.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/add | DOMTokenList.add}
     */
    addClasses(classNames: string[]): this {
        if (!Array.isArray(classNames)) {
            throw typeErr('classNames', 'an array of strings', classNames)
        }
        return this.addClass(...classNames)
    }

    /**
     * Removes one or more classes from the Element.
     *
     * @example
     * ```ts
     * el.rmClass('active')  // Remove single
     * el.rmClass('btn', 'btn-primary')  // Remove multiple
     * ```
     *
     * @param classNames - The classes to remove.
     * @returns This instance for chaining.
     * @throws {TypeError} If any class name is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/remove | DOMTokenList.remove}
     */
    rmClass(...classNames: string[]): this {
        for (const className of classNames) {
            if (!isStr(className)) {
                throw typeErr('className', 'a string', className)
            }
        }
        this.ref.classList.remove(...classNames)
        return this
    }

    /**
     * Removes multiple classes from an array of class names.
     *
     * @example
     * ```ts
     * el.rmClasses(['btn', 'btn-primary'])
     * ```
     *
     * @param classNames - The classes to remove.
     * @returns This instance for chaining.
     * @throws {TypeError} If `classNames` is not an array.
     * @throws {TypeError} If any class name in `classNames` is not a string.
     * @see {@link rmClass} for removing one or more classes via rest arguments.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/remove | DOMTokenList.remove}
     */
    rmClasses(classNames: string[]): this {
        if (!Array.isArray(classNames)) {
            throw typeErr('classNames', 'an array of strings', classNames)
        }
        return this.rmClass(...classNames)
    }

    /**
     * Checks if the Element has a specific class.
     *
     * @param className - The class to check for.
     * @returns `true` if the element has the class.
     * @throws {TypeError} If `className` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/contains | DOMTokenList.contains}
     */
    hasClass(className: string): boolean {
        if (!isStr(className)) {
            throw typeErr('className', 'a string', className)
        }
        return this.ref.classList.contains(className)
    }

    /**
     * Toggles a class on the Element.
     *
     * @param className - The class to toggle.
     * @returns This instance for chaining.
     * @throws {TypeError} If `className` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle | DOMTokenList.toggle}
     */
    toggleClass(className: string): this {
        if (!isStr(className)) {
            throw typeErr('className', 'a string', className)
        }
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
     * @throws {TypeError} If either className is not a string.
     * @see {@link addClass} for explicitly adding class names.
     * @see {@link rmClass} for explicitly removing class names.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/replace | DOMTokenList.replace}
     */
    replaceClass(oldClassName: string, newClassName: string): this {
        if (!isStr(oldClassName)) {
            throw typeErr('oldClassName', 'a string', oldClassName)
        }
        if (!isStr(newClassName)) {
            throw typeErr('newClassName', 'a string', newClassName)
        }
        this.ref.classList.replace(oldClassName, newClassName)
        return this
    }

    /**
     * Finds the closest ancestor (or self) that matches a CSS selector.
     *
     * @remarks
     * Returns `null` when no matching ancestor is found.
     *
     * @example
     * ```ts
     * const button = JJE.from(document.querySelector('button'))
     * const card = button.closest('.card')
     * if (card) {
     *     card.addClass('has-action')
     * }
     * ```
     *
     * @param selector - The CSS selector to search for.
     * @returns A JJE wrapping the closest match, or null when none exists.
     * @throws {TypeError} If `selector` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/closest | Element.closest}
     */
    closest(selector: string): Wrapped | null {
        if (!isStr(selector)) {
            throw typeErr('selector', 'a string', selector)
        }
        const match = this.ref.closest(selector)
        return match ? JJE.wrap(match) : null
    }

    /**

     * Hides the Element by setting the `hidden` attribute and `aria-hidden="true"`.
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden | hidden attribute}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-hidden | aria-hidden}
     */
    hide(): this {
        return this.setAttr('hidden', '').setAttr('aria-hidden', 'true')
    }

    /**
     * Shows the Element by removing the `hidden` and `aria-hidden` attributes.
     *
     * @returns This instance for chaining.
     * @see {@link hide} for the inverse operation.
     * @see {@link rmAttr} for generic attribute removal.
     */
    show(): this {
        return this.rmAttr('hidden', 'aria-hidden')
    }

    /**
     * Disables the Element by setting the `disabled` attribute and `aria-disabled="true"`.
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled | disabled attribute}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled | aria-disabled}
     */
    disable(): this {
        return this.setAttr('disabled', '').setAttr('aria-disabled', 'true')
    }

    /**
     * Enables the Element by removing the `disabled` and `aria-disabled` attributes.
     *
     * @returns This instance for chaining.
     * @see {@link disable} for the inverse operation.
     * @see {@link rmAttr} for generic attribute removal.
     */
    enable(): this {
        return this.rmAttr('disabled', 'aria-disabled')
    }

    /**
     * Gets the inner HTML of the Element.
     *
     * @remarks
     * This method operates on `innerHTML`. The method name is kept short for convenience.
     *
     * @returns The inner HTML string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
     */
    getHTML(): string {
        return this.ref.innerHTML
    }

    /**
     * Sets the inner HTML of the Element.
     *
     * @remarks
     * This method operates on `innerHTML`. The method name is kept short for convenience.
     * Pass an empty string, `null`, or `undefined` to clear the content.
     *
     * @param html - The HTML string to set, or null/undefined to clear.
     * @param unsafe - explicit opt-in to set innerHTML. must be true if html is provided.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
     */
    setHTML(html: string | null | undefined, unsafe?: boolean): this {
        if (html && unsafe !== true) {
            throw new Error(
                `Setting innerHTML is unsafe. Pass true as the second argument to confirm you know what you are doing.`,
            )
        }
        this.ref.innerHTML = html ?? ''
        return this
    }

    /**
     * Attaches a Shadow DOM to the Element if it's not already attached.
     *
     * @remarks
     * You can't attach a shadow root to every type of element. There are some that can't have a
     * shadow DOM for security reasons (for example `<a>`).
     *
     * @param mode - The encapsulation mode ('open' or 'closed'). Defaults to 'open'.
     * @returns This instance for chaining.
     * @throws {DOMException} If the element cannot have a shadow root. See {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow | Element.attachShadow} for more details.
     * @throws {Error} If the shadow DOM is already attached but with another mode.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow | Element.attachShadow}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets | ShadowRoot.adoptedStyleSheets}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets | Document.adoptedStyleSheets}
     */
    setShadow(mode: ShadowRootMode = 'open'): this {
        const { shadowRoot } = this.ref
        if (!shadowRoot) {
            this.ref.attachShadow({ mode })
        } else if (shadowRoot.mode !== mode) {
            throw new Error(
                `Element already has a shadow root with mode "${shadowRoot.mode}". Cannot attach another with mode "${mode}".`,
            )
        }
        return this
    }

    /**
     * Initializes an already-attached Shadow DOM with template content and optional styles.
     *
     * @remarks
     * This method expects the shadow root to already exist.
     * You would typically call `setShadow()` in the custom component constructor and then
     * perform initialization in `connectedCallback()`.
     *
     * @example
     * ```ts
     * const host = JJHE.from(this).setShadow('open')
     * host.initShadow(await templatePromise, await stylePromise)
     * ```
     *
     * @param template - The template content to clone into the shadow root.
     * @param styles - Optional styles to add to the shadow root.
     * @returns This instance for chaining.
     * @throws {ReferenceError} If the element does not have a shadow root yet.
     * @throws {Error} If it fails to initialize the shadow DOM with the provided template or styles.
     * @see {@link setShadow} for attaching the shadow root first.
     * @see {@link JJSR.init} for the underlying shadow-root initialization helper.
     */
    initShadow(
        template:
            | string
            | DocumentFragment
            | HTMLTemplateElement
            | HTMLElement
            | JJDF
            | JJHE<HTMLTemplateElement>
            | JJHE,
        ...styles: (string | CSSStyleSheet)[]
    ): this {
        try {
            this.getShadow(true).init(template, ...styles)
        } catch (cause) {
            throw new Error(`Failed to initialize shadow DOM`, { cause })
        }
        return this
    }

    /**
     * Gets a wrapper around the Element's Shadow Root, if it exists.
     *
     * @remarks
     * Closed shadow roots are available here only when they were attached through {@link setShadow}
     * on this wrapper.
     *
     * @param required - Whether to throw if the shadow root does not exist.
     * @returns A JJSR instance wrapping the shadow root, or null if no shadow root exists.
     * @throws {ReferenceError} If `required` is true and the shadow root does not exist.
     * @see {@link setShadow} for attaching a shadow root.
     * @see {@link initShadow} for populating the attached shadow root.
     * @see {@link JJSR} for ShadowRoot-specific helper methods.
     */
    getShadow(required: true): JJSR
    getShadow(required?: false): JJSR | null
    getShadow(required = false): JJSR | null {
        const shadowRoot = this.ref.shadowRoot
        if (shadowRoot) {
            return new JJSR(shadowRoot)
        }
        if (required) {
            throw new ReferenceError('No shadow root found on this element. Did you forget to call setShadow() first?')
        }
        return null
    }
}
