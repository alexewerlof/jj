import { hasProp, isA, isStr } from 'jty'
import { JJN } from './JJN.js'
import { Wrapped } from './types.js'
import { JJEx } from './JJEx.js'

/**
 * Wraps a DOM HTMLElement (which is a descendant of Element).
 *
 * @remarks
 * This class extends `JJE` to provide specific functionality for HTML elements,
 * such as access to `dataset`, `innerText`, and form values.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement | HTMLElement}
 */
export class JJHE<T extends HTMLElement = HTMLElement> extends JJEx<T> {
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
     * @remarks
     * This method operates on `innerText`. The method name is kept short for convenience.
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
     * @remarks
     * This method operates on `innerText`. The method name is kept short for convenience.
     * Pass an empty string, `null`, or `undefined` to clear the content.
     *
     * @param text - The text to set, or null/undefined to clear.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText | HTMLElement.innerText}
     */
    setText(text?: string | null): this {
        this.ref.innerText = text ?? ''
        return this
    }
}
