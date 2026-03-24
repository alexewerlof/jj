import { hasProp, isInstance, isStr } from 'jty'
import { JJEx } from './JJEx.js'
import { errMsg, typeErr } from '../internal.js'

const COMMON_SVG_TAGS = ['svg', 'rect', 'circle', 'line', 'path', 'text']
const COMMON_MATHML_TAGS = ['math', 'mi', 'mn', 'mo', 'mtext']

/**
 * Wraps a DOM HTMLElement (which is a descendant of Element).
 *
 * @remarks
 * This class extends `JJE` to provide specific functionality for HTML elements,
 * such as access to `dataset`, `innerText`, and form values.
 *
 * @category Wrappers
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement | HTMLElement}
 */
export class JJHE<T extends HTMLElement = HTMLElement> extends JJEx<T> {
    /**
     * Creates a JJHE instance from an HTMLElement reference.
     *
     * @remarks
     * Use {@link JJHE.create} to create new HTMLElements, or use this method to wrap existing ones.
     * For other element types, use {@link JJSE.from} for SVGElements or {@link JJME.from} for MathMLElements.
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
    static from<T extends HTMLElement>(ref: T): JJHE<T> {
        return new JJHE(ref)
    }

    /**
     * Creates a JJHE instance from a tag name.
     *
     * @remarks
     * For existing HTMLElements, use {@link JJHE.from} instead.
     * For SVG or MathML elements, use {@link JJSE.create} or {@link JJME.create} respectively.
     *
     * @example
     * ```ts
     * const div = JJHE.create('div')
     * const input = JJHE.create('input', { is: 'custom-input' })
     * ```
     *
     * @param tagName - The tag name.
     * @param options - Element creation options.
     * @returns A new JJHE instance.
     * @throws {TypeError} If `tagName` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement | document.createElement}
     */
    static create<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        options?: ElementCreationOptions,
    ): JJHE<HTMLElementTagNameMap[K]>
    static create(tagName: string, options?: ElementCreationOptions): JJHE
    static create(tagName: string, options?: ElementCreationOptions): JJHE {
        if (!isStr(tagName)) {
            throw typeErr('tagName', "a string like 'div' or 'button'", tagName, 'Pass a valid HTML tag name.')
        }
        if (COMMON_SVG_TAGS.includes(tagName)) {
            throw errMsg(
                `tagName`,
                `a HTML tag name (not an SVG tag name)`,
                tagName,
                `Use JJSE.create("${tagName}") for SVG elements.`,
            )
        }
        if (COMMON_MATHML_TAGS.includes(tagName)) {
            throw errMsg(
                `tagName`,
                `a HTML tag name (not a MathML tag name)`,
                tagName,
                `Use JJME.create("${tagName}") for MathML elements.`,
            )
        }
        return new JJHE(document.createElement(tagName, options))
    }

    /**
     * Creates an instance of JJHE.
     *
     * @param ref - The HTMLElement to wrap.
     * @throws {TypeError} If `ref` is not an HTMLElement.
     * @see {@link JJHE.from} to wrap existing HTMLElements
     * @see {@link JJHE.create} to create new HTMLElements
     */
    constructor(ref: T) {
        if (!isInstance(ref, HTMLElement)) {
            throw typeErr('ref', 'an HTMLElement', ref, 'Use JJHE.from() or JJHE.create().')
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
            throw new ReferenceError(`${this.ref.tagName} has no value property.`)
        }
        return this.ref.value
    }

    /**
     * Sets the value property of the HTMLElement.
     *
     * @example
     * ```ts
     * input.setValue('new value')
     * input.setValue(42)  // Numbers are automatically converted
     * ```
     *
     * @param value - The value to set.
     * @returns This instance for chaining.
     * @throws {Error} If the HTMLElement does not have a value property.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value | HTMLInputElement.value}
     */
    setValue(value: unknown): this {
        if (!hasProp(this.ref, 'value')) {
            throw new ReferenceError(`${this.ref.tagName} has no value property.`)
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
     * Numbers and booleans are automatically converted to strings.
     *
     * @param text - The text to set, or null/undefined to clear.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText | HTMLElement.innerText}
     */
    setText(text?: unknown): this {
        this.ref.innerText = text as string
        return this
    }
}
