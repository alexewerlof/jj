import { assertTrustedHtml, isInstance, isObj, isStr, typeErr } from '../internal.js'
import { elementWrappers, nodeWrappers } from './WrapperChain.js'
import { JJSR } from './JJSR.js'
import { JJNx, type TemplateSource } from './JJNx.js'
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
    static {
        // Register JJE as the wrapper for generic Elements
        nodeWrappers.register(Element, JJE)
        elementWrappers.register(Element, JJE)
    }

    /**
     * Creates a JJE instance from an Element reference.
     *
     * @remarks
     * Use this factory method to wrap an existing Element. For creating new Elements,
     * use the specific wrapper type: {@link JJHE.create}, {@link JJSE.create}, or {@link JJME.create}.
     *
     * @example
     * ```ts
     * const el = JJE.from(document.querySelector('#status-bar'))
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
     * Sets a single attribute on the Element, or removes it when the value is nullish.
     *
     * @remarks
     * `null` and `undefined` remove the attribute instead of writing the string
     * `"undefined"`, so conditional attributes work without a branch:
     *
     * ```ts
     * el.setAttr('aria-expanded', isOpen || undefined) // removed when isOpen is falsy
     * ```
     *
     * @example
     * ```ts
     * el.setAttr('id', 'my-id')
     * el.setAttr('x', 50) // Numbers are automatically converted
     * el.setAttr('hidden', null) // Removes the attribute
     * ```
     *
     * @param name - The attribute name.
     * @param value - The value to set, or null/undefined to remove the attribute.
     * @returns This instance for chaining.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link setAttrs} for setting multiple attributes at once.
     * @see {@link rmAttr} for removing attributes.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute | Element.setAttribute}
     */
    setAttr(name: string, value: unknown): this {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }

        if (value == null) {
            this.ref.removeAttribute(name)
        } else {
            this.ref.setAttribute(name, value as string)
        }
        return this
    }

    /**
     * Sets multiple attributes from an object, or no-ops for nullish input.
     *
     * @remarks
     * This helper is useful for optional attribute bags in builder APIs.
     * - `null` or `undefined`: does nothing and returns `this`
     * - plain object: sets each attribute on the element; a `null`/`undefined` value
     *   removes that attribute (see {@link setAttr})
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
     * Conditionally sets or removes a boolean-style (presence-based) attribute, or
     * auto-toggles it when called without a `force` value.
     *
     * @remarks
     * HTML boolean attributes (e.g. `disabled`, `hidden`, `checked`, `readonly`, `required`)
     * are active whenever they are **present**, regardless of their value.
     *
     * This method has two modes:
     *
     * **Explicit mode** — pass a `force` value:
     * - Truthy `force` → sets the attribute to `""` (presence = active).
     * - `false` → removes the attribute.
     * - `undefined` → removes the attribute, matching {@link setAttr}.
     *
     * **Auto mode** — omit `force` entirely (call with one argument):
     * - Delegates to the native `Element.toggleAttribute()`: removes the attribute if
     *   present, adds it (as `""`) if absent. Useful in click handlers where you just
     *   want to flip the current state.
     *
     * Passing `undefined` explicitly removes the attribute, so an optional value never
     * toggles by accident:
     *
     * ```ts
     * el.swAttr('disabled', options?.disabled) // undefined → removed, never toggled
     * ```
     *
     * ARIA attributes are not HTML boolean attributes. Even boolean-like ARIA states
     * such as `aria-hidden`, `aria-disabled`, and `aria-readonly` require explicit
     * string values like `"true"` or `"false"`, so they should be managed with
     * {@link setAriaAttr} / {@link rmAriaAttr}, not with `swAttr()`.
     *
     * For other attributes that carry a meaningful string value (e.g.
     * `dir="rtl"`, `hidden="until-found"`), use {@link setAttr} and {@link rmAttr} directly.
     *
     * @example
     * ```ts
     * // Explicit mode — driven by a runtime condition (most common)
     * btn.swAttr('disabled', !isReady)
     * panel.swAttr('hidden', !isExpanded)
     * input.swAttr('readonly', isReadonly)
     *
     * // Not for ARIA — these need explicit string values
     * dialog.setAriaAttr('hidden', 'true')
     * button.setAriaAttr('disabled', 'false')
     *
     * // Auto mode — flip current state (no condition required)
     * btn.on('click', () => btn.swAttr('disabled'))
     * ```
     *
     * @param name - The attribute name.
     * @param force - Omitted: auto-toggle. Truthy: add. `false`/`undefined`: remove.
     * @returns This instance for chaining.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link setAttr} for setting a non-ARIA attribute with a specific string value.
     * @see {@link setAriaAttr} for ARIA attributes that require explicit values.
     * @see {@link rmAriaAttr} for unconditionally removing an ARIA attribute.
     * @see {@link rmAttr} for unconditionally removing an attribute.
     * @see {@link swClass} for the class-list equivalent.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/toggleAttribute | Element.toggleAttribute}
     */
    swAttr(name: string, ...force: [boolean?]): this {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }

        if (force.length === 0) {
            this.ref.toggleAttribute(name)
        } else if (force[0] === undefined) {
            this.ref.removeAttribute(name)
        } else {
            this.ref.toggleAttribute(name, force[0])
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
        return this.getAttr(`aria-${name}`)
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
        return this.hasAttr(`aria-${name}`)
    }

    /**
     * Sets a single ARIA attribute on the Element, or removes it when the value is nullish.
     *
     * @remarks
     * Automatically prepends `aria-` to the name, then delegates to {@link setAttr}.
     *
     * @example
     * ```ts
     * el.setAriaAttr('hidden', 'true')
     * el.setAriaAttr('level', 2)
     * el.setAriaAttr('expanded', isOpen ? 'true' : undefined) // removed when undefined
     * ```
     *
     * @param name - The ARIA attribute suffix.
     * @param value - The value to assign, or null/undefined to remove the attribute.
     * @returns This instance for chaining.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link setAttr} for the underlying nullish and coercion rules.
     * @see {@link setAriaAttrs} for setting multiple ARIA attributes at once.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes | ARIA Attributes}
     */
    setAriaAttr(name: string, value: unknown): this {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }
        return this.setAttr(`aria-${name}`, value)
    }

    /**
     * Sets multiple ARIA attributes from an object, or no-ops for nullish input.
     *
     * @remarks
     * This helper is useful for optional ARIA attribute bags in builder APIs.
     * - `null` or `undefined`: does nothing and returns `this`
     * - plain object: sets each ARIA attribute on the element; a `null`/`undefined`
     *   value removes that attribute (see {@link setAriaAttr})
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
        for (const name of names) {
            if (!isStr(name)) {
                throw typeErr('name', 'a string', name)
            }
        }
        return this.rmAttr(...names.map((name) => `aria-${name}`))
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
     * Conditionally adds or removes a single class, or auto-toggles it when called
     * without a `force` value.
     *
     * @remarks
     * This method has two modes, mirroring the behavior of {@link swAttr}:
     *
     * **Explicit mode** — pass a `force` value:
     * - Truthy `force` → adds the class.
     * - `false` → removes the class.
     * - `undefined` → removes the class, so an optional condition never toggles.
     *
     * **Auto mode** — omit `force` entirely (call with one argument):
     * - Delegates to the native `DOMTokenList.toggle()`: removes the class if present,
     *   adds it if absent. Useful in click handlers where you just want to flip the
     *   current state.
     *
     * To toggle multiple classes from a condition map in a single call, use {@link setClasses}.
     *
     * @example
     * ```ts
     * // Explicit mode — driven by a runtime condition (most common)
     * el.swClass('is-expanded', isExpanded)
     * el.swClass('is-loading', isPending)
     *
     * // Auto mode — flip current state (no condition required)
     * btn.on('click', () => btn.swClass('is-active'))
     * ```
     *
     * @param className - The class to add or remove.
     * @param force - Omitted: auto-toggle. Truthy: add. `false`/`undefined`: remove.
     * @returns This instance for chaining.
     * @throws {TypeError} If `className` is not a string.
     * @see {@link setClasses} for toggling multiple classes at once via a condition map.
     * @see {@link addClass} for unconditionally adding a class.
     * @see {@link rmClass} for unconditionally removing a class.
     * @see {@link swAttr} for the attribute equivalent.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle | DOMTokenList.toggle}
     */
    swClass(className: string, ...force: [boolean?]): this {
        if (!isStr(className)) {
            throw typeErr('className', 'a string', className)
        }

        if (force.length === 0) {
            this.ref.classList.toggle(className)
        } else if (force[0] === undefined) {
            this.ref.classList.remove(className)
        } else {
            this.ref.classList.toggle(className, force[0])
        }
        return this
    }

    /**
     * Finds the closest ancestor (or self) that matches a CSS selector.
     *
     * @remarks
     * Returns `null` when no matching ancestor is found.
     *
     * A selector is a runtime string, so the wrapper defaults to `JJHE` (the common
     * case) and can be overridden for SVG or MathML ancestors:
     * `el.closest<JJSE>('g')`.
     *
     * @example
     * ```ts
     * const jjButton = JJE.from(document.querySelector('button'))
     * const jjCard = jjButton.closest('.card')
     * if (jjCard) {
     *     jjCard.addClass('has-action')
     * }
     * ```
     *
     * @param selector - The CSS selector to search for.
     * @returns A wrapper around the closest match, or null when none exists.
     * @throws {TypeError} If `selector` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/closest | Element.closest}
     */
    closest<W extends JJE = JJHE>(selector: string): W | null {
        if (!isStr(selector)) {
            throw typeErr('selector', 'a string', selector)
        }
        const match = this.ref.closest(selector)
        return match ? (elementWrappers.from(match) as W) : null
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
     * Gets the text content of the Element.
     *
     * @remarks
     * This method operates on `textContent`. The method name is kept short for convenience.
     *
     * For HTML-only rendering-aware text behavior (layout-aware whitespace and line breaks),
     * use `jjEl.ref.innerText` on `JJHE` wrappers.
     *
     * This method exists on element wrappers (`JJE`, `JJHE`, `JJSE`, `JJME`) and does not
     * apply to `JJD` (Document wrapper). Per MDN, `Document.textContent` and
     * `DocumentType.textContent` are `null`; for full document text, use one of the following:
     * - `document.documentElement.textContent`
     * - `jjDoc.ref.documentElement.textContent`
     * - `JJE.from(document.documentElement).getText()`.
     *
     * @returns The text content, or an empty string when `textContent` is null.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText | HTMLElement.innerText}
     */
    getText(): string {
        return this.ref.textContent ?? ''
    }

    /**
     * Sets the text content of the Element.
     *
     * @remarks
     * This method operates on `textContent`. The method name is kept short for convenience.
     * Pass an empty string, `null`, or `undefined` to clear the content.
     * Numbers and booleans are automatically converted to strings by the DOM.
     *
     * For HTML-only rendering-aware text behavior (for example preserving line breaks via
     * `innerText`), use `jjEl.ref.innerText = 'Hello\nworld!'` on a `JJHE` wrapper.
     *
     * @param text - The text to set, or null/undefined to clear.
     * @returns This instance for chaining.
     * @see {@link getText} for reading text content.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText | HTMLElement.innerText}
     */
    setText(text?: unknown): this {
        this.ref.textContent = text as string | null
        return this
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
        assertTrustedHtml(html, unsafe)
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
     * Attaches a Shadow DOM if needed and returns the wrapped shadow root.
     *
     * @remarks
     * This is the one-call form of {@link setShadow} followed by {@link getShadow}, which is
     * what most component constructors do:
     *
     * ```ts
     * // instead of two calls plus a required-flag overload
     * this.#jjHost = JJHE.from(this).setShadow('open')
     * this.#jjShadow = this.#jjHost.getShadow(true)
     *
     * // one call, no cast
     * this.#jjShadow = JJHE.from(this).shadow()
     * ```
     *
     * Only `'open'` roots are supported. `Element.shadowRoot` is `null` for a closed
     * root, so there would be nothing to return; for closed mode use
     * {@link setShadow} and {@link initShadow} instead.
     *
     * @param mode - The encapsulation mode. Only `'open'` is supported; see the note above.
     * @returns A {@link JJSR} wrapping the element's shadow root.
     * @throws {DOMException} If the element cannot have a shadow root.
     * @throws {Error} If `mode` is `'closed'`, or the element already has a shadow root with another mode.
     * @see {@link setShadow} when you only need the host wrapper.
     * @see {@link getShadow} to read an existing shadow root.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow | Element.attachShadow}
     */
    shadow(mode: ShadowRootMode = 'open'): JJSR {
        if (mode === 'closed') {
            // `element.shadowRoot` is null for a closed root, so there is nothing to wrap.
            // Failing here is deliberate: attaching first and throwing after would leave the
            // element with a shadow root the caller cannot reach.
            throw new Error(
                `shadow() cannot return a closed shadow root: Element.shadowRoot is null in that mode. Use setShadow('closed') with initShadow(...) instead.`,
            )
        }
        return this.setShadow(mode).getShadow(true)
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
    initShadow(template: TemplateSource, ...styles: (string | CSSStyleSheet)[]): this {
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
