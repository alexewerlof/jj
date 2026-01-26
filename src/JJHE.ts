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
     * @example
     * ```ts
     * const el = JJHE.from(document.getElementById('my-id'))  // from an existing HTMLElement
     * const el = JJHE.from(new document.createElement('div')) // from a new HTMLElement
     * ```
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
     * Gets the value property of the HTMLElement (e.g. for inputs).
     *
     * @returns The value.
     * @throws {Error} If the HTMLElement does not have a value property.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value | HTMLInputElement.value}
     */
    getValue() {
        if (!hasProp(this.ref, 'value')) {
            throw new Error('Element does not have a value property')
        }
        return this.ref.value
    }

    /**
     * Sets the value property of the HTMLElement.
     *
     * @example
     * ```ts
     * input.setValue('new value')
     * ```
     *
     * @param value - The value to set.
     * @returns This instance for chaining.
     * @throws {Error} If the HTMLElement does not have a value property.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value | HTMLInputElement.value}
     */
    setValue(value: string): this {
        if (!hasProp(this.ref, 'value')) {
            throw new Error('Element does not have a value property')
        }
        this.ref.value = value
        return this
    }

    /**
     * Focuses the HTMLElement.
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus | HTMLElement.focus}
     */
    focus(): this {
        this.ref.focus()
        return this
    }

    /**
     * Clicks the HTMLElement.
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click | HTMLElement.click}
     */
    click(): this {
        this.ref.click()
        return this
    }

    /**
     * Gets the inner text of the HTMLElement.
     *
     * @returns The inner text.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText | HTMLElement.innerText}
     */
    getText(): string {
        return this.ref.innerText
    }

    /**
     * Sets the inner text of the HTMLElement.
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
     * Gets a data attribute from the HTMLElement.
     *
     * @example
     * ```ts
     * const value = el.getData('my-key')
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @returns The value of the attribute, or undefined if not set.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    getData(name: string): string | undefined {
        return this.ref.dataset[name]
    }

    /**
     * Checks if a data attribute exists on the HTMLElement.
     *
     * @example
     * ```ts
     * if (el.hasData('my-key')) {
     *   // ...
     * }
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @returns True if the attribute exists, false otherwise.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    hasData(name: string): boolean {
        return hasProp(this.ref.dataset, name)
    }

    /**
     * Sets a data attribute on the HTMLElement.
     *
     * @example
     * ```ts
     * el.setData('my-key', 'my-value')
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @param value - The value to set.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    setData(name: string, value: string): this {
        this.ref.dataset[name] = value
        return this
    }

    /**
     * Sets multiple data attributes on the HTMLElement from an object.
     *
     * @example
     * ```ts
     * el.setDataObj({
     *   'my-key': 'my-value',
     *   'other-key': 'other-value'
     * })
     * ```
     *
     * @param obj - An object where keys are data attribute names (in camelCase) and values are the values to set.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    setDataObj(obj: Record<string, string>): this {
        for (const [name, value] of Object.entries(obj)) {
            this.setData(name, value)
        }
        return this
    }

    /**
     * Removes a data attribute from the HTMLElement.
     *
     * @example
     * ```ts
     * el.rmData('my-key')
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    rmData(name: string): this {
        delete this.ref.dataset[name]
        return this
    }

    /**
     * Finds the first element matching a selector within this HTMLElement's context.
     *
     * @param selector - The CSS selector.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null.
     * @throws {TypeError} If the element is not found and `throwIfNotFound` is true.
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
     * Finds all elements matching a selector within this HTMLElement's context.
     *
     * @param selector - The CSS selector.
     * @returns An array of wrapped elements.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll | Element.querySelectorAll}
     */
    queryAll(selector: string): Wrapped[] {
        return JJN.wrapAll(this.ref.querySelectorAll(selector))
    }
}
