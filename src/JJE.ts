import { isA, isArr, isObj, isStr } from 'jty'
import { JJSR } from './JJSR.js'
import { ShadowConfig } from './types.js'
import { JJNx } from './JJNx.js'
import { typeErr } from './internal.js'

/**
 * Wraps a DOM Element (which is a descendant of Node).
 *
 * @remarks
 * This class provides a wrapper around the native `Element` interface, adding fluent API methods
 * for attribute manipulation, class handling, and event binding.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element | Element}
 */
export class JJE<T extends Element = Element> extends JJNx<T> {
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
            throw new TypeError(
                `JJE expects an Element instance. Got ${ref} (${typeof ref}). ` +
                    `Use JJE.from(element) with a DOM Element, or use the specific wrapper (JJHE for HTMLElement, JJSE for SVGElement).`,
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
     * Sets one or more attributes on the Element.
     *
     * @example
     * ```ts
     * el.setAttr('id', 'my-id')  // Single attribute
     * el.setAttr({ id: 'my-id', class: 'my-class' })  // Multiple attributes
     * ```
     *
     * @throws {TypeError} If arguments are invalid types or values are not strings.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute | Element.setAttribute}
     */
    setAttr(name: string, value: string): this
    setAttr(obj: Record<string, string>): this
    setAttr(nameOrObj: string | Record<string, string>, value?: string): this {
        if (typeof nameOrObj === 'string') {
            if (!isStr(value)) {
                throw typeErr('value', 'a string', value)
            }
            this.ref.setAttribute(nameOrObj, value)
        } else if (isObj(nameOrObj)) {
            for (const [k, v] of Object.entries(nameOrObj)) {
                if (!isStr(v)) {
                    throw typeErr(`attrs['${k}']`, 'a string', v)
                }
                this.ref.setAttribute(k, v)
            }
        } else {
            throw typeErr('nameOrObj', 'a string or object', nameOrObj)
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
     * el.getAria('label') // gets 'aria-label'
     * ```
     *
     * @param name - The ARIA attribute suffix (e.g., 'label' for 'aria-label').
     * @returns The attribute value, or null if not present.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes | ARIA Attributes}
     */
    getAria(name: string): string | null {
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
     */
    hasAria(name: string): boolean {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }
        return this.ref.hasAttribute(`aria-${name}`)
    }

    /**
     * Sets one or more ARIA attributes on the Element.
     *
     * @example
     * ```ts
     * el.setAria('hidden', 'true')  // Single: sets aria-hidden="true"
     * el.setAria({ label: 'Close', hidden: 'false' })  // Multiple
     * ```
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes | ARIA Attributes}
     */
    setAria(name: string, value: string): this
    setAria(obj: Record<string, string>): this
    setAria(nameOrObj: string | Record<string, string>, value?: string): this {
        if (isStr(nameOrObj)) {
            if (!isStr(value)) {
                throw typeErr('value', 'a string', value)
            }
            this.ref.setAttribute(`aria-${nameOrObj}`, value)
        } else if (isObj(nameOrObj)) {
            for (const [k, v] of Object.entries(nameOrObj)) {
                if (!isStr(v)) {
                    throw typeErr(`aria['${k}']`, 'a string', v)
                }
                this.ref.setAttribute(`aria-${k}`, v)
            }
        } else {
            throw typeErr('nameOrObj', 'a string or object', nameOrObj)
        }
        return this
    }

    /**
     * Removes one or more ARIA attributes from the Element.
     *
     * @example
     * ```ts
     * el.rmAria('hidden')  // Remove single
     * el.rmAria('label', 'hidden')  // Remove multiple
     * ```
     *
     * @param names - The ARIA attribute suffix(es) to remove.
     * @returns This instance for chaining.
     * @throws {TypeError} If any name is not a string.
     */
    rmAria(...names: string[]): this {
        for (const name of names) {
            if (!isStr(name)) {
                throw typeErr('name', 'a string', name)
            }
            this.ref.removeAttribute(`aria-${name}`)
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
     * Sets the class attribute or conditionally adds/removes classes.
     *
     * @remarks
     * - Pass a string to replace the entire class attribute
     * - Pass an object with class names as keys and boolean values to conditionally add/remove classes
     * - To remove all classes, pass an empty string: `setClass('')`
     *
     * @example
     * ```ts
     * el.setClass('btn btn-primary')  // Set classes as string
     * el.setClass({                   // Conditional classes (Vue.js style)
     *   'active': true,               // adds 'active'
     *   'disabled': false,            // removes 'disabled'
     *   'highlight': isHighlighted    // adds/removes based on condition
     * })
     * ```
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/className | Element.className}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
     */
    setClass(className: string): this
    setClass(classMap: Record<string, boolean | unknown>): this
    setClass(classNameOrMap: string | Record<string, boolean | unknown>): this {
        if (typeof classNameOrMap === 'string') {
            return this.setAttr('class', classNameOrMap)
        }
        // Conditional class object (Vue.js style)
        for (const [className, condition] of Object.entries(classNameOrMap)) {
            if (condition) {
                this.ref.classList.add(className)
            } else {
                this.ref.classList.remove(className)
            }
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
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
     */
    setHTML(html?: string | null): this {
        this.ref.innerHTML = html ?? ''
        return this
    }

    /**
     * Attaches a Shadow DOM to the Element and optionally sets its content and styles.
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
     * Gets a wrapper around the Element's Shadow Root, if it exists.
     *
     * @returns A JJSR instance wrapping the shadow root, or null if no shadow root exists.
     */
    get shadow() {
        return this.ref.shadowRoot ? new JJSR(this.ref.shadowRoot) : null
    }
}
