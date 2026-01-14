import { hasProp, isA, isStr } from 'jty'
import { JJE } from './JJE.js'

/**
 * Wraps a DOM HTMLElement (which is a descendant of Element)
 */
export class JJHE<T extends HTMLElement = HTMLElement> extends JJE<T> {
    /**
     * Creates a JJHE instance from an HTMLElement reference.
     * @param ref The HTMLElement.
     * @returns A new JJHE instance.
     */
    static from(ref: HTMLElement): JJHE {
        return new JJHE(ref)
    }

    /**
     * Creates a JJHE instance from a tag name.
     * @param tagName The tag name.
     * @param options Element creation options.
     * @returns A new JJHE instance.
     * @throws {TypeError} If tagName is not a string.
     */
    static fromTag(tagName: string, options?: ElementCreationOptions): JJHE {
        if (!isStr(tagName)) {
            throw new TypeError(`Expected a string for tagName. Got: ${tagName} (${typeof tagName})`)
        }
        return new JJHE(document.createElement(tagName, options))
    }

    /**
     * Creates an instance of JJHE.
     * @param ref The HTMLElement to wrap.
     * @throws {TypeError} If ref is not an HTMLElement.
     */
    constructor(ref: T) {
        if (!isA(ref, HTMLElement)) {
            throw new TypeError(`Expected an HTMLElement. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    /**
     * Gets the value property of the element (e.g. for inputs).
     * @returns The value.
     * @throws {Error} If the element does not have a value property.
     */
    getValue() {
        if (!hasProp(this.ref, 'value')) {
            throw new Error('Element does not have a value property')
        }
        return this.ref.value
    }

    /**
     * Sets the value property of the element.
     * @param value The value to set.
     * @returns This instance.
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
     * @param name The data attribute name (camelCase).
     * @returns The value or undefined.
     */
    getData(name: string): string | undefined {
        return this.ref.dataset[name]
    }

    /**
     * Checks if a data attribute exists.
     * @param name The data attribute name (camelCase).
     * @returns True if it exists.
     */
    hasData(name: string): boolean {
        return hasProp(this.ref.dataset, name)
    }

    /**
     * Sets a data attribute.
     * @param name The data attribute name (camelCase).
     * @param value The value to set.
     * @returns This instance.
     */
    setData(name: string, value: string): this {
        this.ref.dataset[name] = value
        return this
    }

    /**
     * Sets multiple data attributes.
     * @param obj An object of data keys and values.
     * @returns This instance.
     */
    setDataObj(obj: Record<string, string>): this {
        for (const [name, value] of Object.entries(obj)) {
            this.setData(name, value)
        }
        return this
    }

    /**
     * Removes a data attribute.
     * @param name The data attribute name (camelCase).
     * @returns This instance.
     */
    rmData(name: string): this {
        delete this.ref.dataset[name]
        return this
    }

    /**
     * Focuses the element.
     * @returns This instance.
     */
    focus(): this {
        this.ref.focus()
        return this
    }

    /**
     * Clicks the element.
     * @returns This instance.
     */
    click(): this {
        this.ref.click()
        return this
    }

    /**
     * Clears the inner text of the element.
     * @returns This instance.
     */
    empty(): this {
        this.ref.innerText = ''
        return this
    }

    /**
     * Gets the inner text of the element.
     * @returns The inner text.
     */
    getText(): string {
        return this.ref.innerText
    }

    /**
     * Sets the inner text of the element.
     * @param text The text to set.
     * @returns This instance.
     */
    setText(text: string): this {
        this.ref.innerText = text
        return this
    }
}
