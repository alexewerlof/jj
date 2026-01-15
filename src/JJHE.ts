import { hasProp, isA, isStr } from 'jty'
import { JJE } from './JJE.js'
import { JJN } from './JJN.js'
import { Wrapped } from './types.js'

/**
 * Wraps a DOM HTMLElement (which is a descendant of Element).
 *
 * @remarks
 * This class extends `JJE` to provide specific functionality for HTML elements,
 * such as access to `dataset`, `innerText`, and form values.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement | HTMLElement}
 */
export class JJHE<T extends HTMLElement = HTMLElement> extends JJE<T> {
    /**
     * Creates a JJHE instance from an HTMLElement reference.
     *
     * @param ref - The HTMLElement.
     * @returns A new JJHE instance.
     */
    static from(ref: HTMLElement): JJHE {
        return new JJHE(ref)
    }

    /**
     * Creates a JJHE instance from a tag name.
     *
     * @example
     * ```ts
     * const div = JJHE.fromTag('div')
     * const input = JJHE.fromTag('input', { is: 'custom-input' })
     * ```
     *
     * @param tagName - The tag name.
     * @param options - Element creation options.
     * @returns A new JJHE instance.
     * @throws {TypeError} If `tagName` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement | document.createElement}
     */
    static fromTag(tagName: string, options?: ElementCreationOptions): JJHE {
        if (!isStr(tagName)) {
            throw new TypeError(`Expected a string for tagName. Got: ${tagName} (${typeof tagName})`)
        }
        return new JJHE(document.createElement(tagName, options))
    }

    /**
     * Creates an instance of JJHE.
     *
     * @param ref - The HTMLElement to wrap.
     * @throws {TypeError} If `ref` is not an HTMLElement.
     */
    constructor(ref: T) {
        if (!isA(ref, HTMLElement)) {
            throw new TypeError(`Expected an HTMLElement. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    /**
     * Gets the value property of the element (e.g. for inputs).
     *
     * @returns The value.
     * @throws {Error} If the element does not have a value property.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value | HTMLInputElement.value}
     */
    getValue() {
        if (!hasProp(this.ref, 'value')) {
            throw new Error('Element does not have a value property')
        }
        return this.ref.value
    }

    /**
     * Sets the value property of the element.
     *
     * @example
     * ```ts
     * input.setValue('new value')
     * ```
     *
     * @param value - The value to set.
     * @returns This instance for chaining.
     * @throws {Error} If the element does not have a value property.
     */
    setValue(value: string): this {
        if (!hasProp(this.ref, 'value')) {
            throw new Error('Element does not have a value property')
        }
        this.ref.value = value
        return this
    }

    /**
     * Gets a data attribute value.
     *
     * @remarks
     * Accesses the `dataset` property. Keys should be in camelCase.
     *
     * @example
     * ```ts
     * // <div data-user-id="123"></div>
     * div.getData('userId') // '123'
     * ```
     *
     * @param name - The data attribute name (camelCase).
     * @returns The value or undefined.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    getData(name: string): string | undefined {
        return this.ref.dataset[name]
    }

    /**
     * Checks if a data attribute exists.
     *
     * @param name - The data attribute name (camelCase).
     * @returns `true` if it exists.
     */
    hasData(name: string): boolean {
        return hasProp(this.ref.dataset, name)
    }

    /**
     * Sets a data attribute.
     *
     * @example
     * ```ts
     * div.setData('userId', '123') // sets data-user-id="123"
     * ```
     *
     * @param name - The data attribute name (camelCase).
     * @param value - The value to set.
     * @returns This instance for chaining.
     */
    setData(name: string, value: string): this {
        this.ref.dataset[name] = value
        return this
    }

    /**
     * Sets multiple data attributes.
     *
     * @example
     * ```ts
     * div.setDataObj({ userId: '123', role: 'admin' })
     * ```
     *
     * @param obj - An object of data keys and values.
     * @returns This instance for chaining.
     */
    setDataObj(obj: Record<string, string>): this {
        for (const [name, value] of Object.entries(obj)) {
            this.setData(name, value)
        }
        return this
    }

    /**
     * Removes a data attribute.
     *
     * @param name - The data attribute name (camelCase).
     * @returns This instance for chaining.
     */
    rmData(name: string): this {
        delete this.ref.dataset[name]
        return this
    }

    /**
     * Focuses the element.
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus | HTMLElement.focus}
     */
    focus(): this {
        this.ref.focus()
        return this
    }

    /**
     * Clicks the element.
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click | HTMLElement.click}
     */
    click(): this {
        this.ref.click()
        return this
    }

    /**
     * Gets the inner text of the element.
     *
     * @returns The inner text.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText | HTMLElement.innerText}
     */
    getText(): string {
        return this.ref.innerText
    }

    /**
     * Sets the inner text of the element.
     *
     * @param text - The text to set.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText | HTMLElement.innerText}
     */
    setText(text: string): this {
        this.ref.innerText = text
        return this
    }

    /**
     * Finds the first element matching a selector within this element's context.
     *
     * @param selector - The CSS selector.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null.
     * @throws {TypeError} If element not found (when requested).
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector | Element.querySelector}
     */
    query(selector: string, throwIfNotFound = true): Wrapped | null {
        const el = this.ref.querySelector(selector)
        if (el) {
            return JJN.wrap(el)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Element with selector ${selector} not found`)
        }
        return null
    }

    /**
     * Finds all elements matching a selector within this element's context.
     *
     * @param selector - The CSS selector.
     * @returns An array of wrapped elements.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll | Element.querySelectorAll}
     */
    queryAll(selector: string): Wrapped[] {
        return JJN.wrapAll(this.ref.querySelectorAll(selector))
    }
}
