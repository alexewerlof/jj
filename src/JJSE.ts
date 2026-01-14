import { hasProp, isA, isStr } from 'jty'
import { JJE } from './JJE.js'

/**
 * Wraps a DOM SVGElement
 */
export class JJSE<T extends SVGElement = SVGElement> extends JJE<T> {
    /**
     * Creates a JJSE instance from an SVGElement reference.
     * @param ref The SVGElement.
     * @returns A new JJSE instance.
     */
    static from(ref: SVGElement): JJSE {
        return new JJSE(ref)
    }

    /**
     * Creates a JJSE instance from a tag name (in the SVG namespace).
     * @param tagName The tag name.
     * @param options Element creation options.
     * @returns A new JJSE instance.
     * @throws {TypeError} If tagName is not a string.
     */
    static fromTag(tagName: string, options?: ElementCreationOptions): JJSE {
        if (!isStr(tagName)) {
            throw new TypeError(`Expected a string for tagName. Got: ${tagName} (${typeof tagName})`)
        }
        // SVG elements must be created with the SVG namespace
        const element = document.createElementNS('http://www.w3.org/2000/svg', tagName, options)
        return new JJSE(element as SVGElement)
    }

    /**
     * Creates an instance of JJSE.
     * @param ref The SVGElement to wrap.
     * @throws {TypeError} If ref is not an SVGElement.
     */
    constructor(ref: T) {
        if (!isA(ref, SVGElement)) {
            throw new TypeError(`Expected an SVGElement. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    /**
     * Gets the text content of the element.
     * @returns The text content.
     */
    getText(): string {
        return this.ref.textContent ?? ''
    }

    /**
     * Sets the text content of the element.
     * @param text The text to set.
     * @returns This instance.
     */
    setText(text: string): this {
        this.ref.textContent = text
        return this
    }

    /**
     * Clears the text content of the element.
     * @returns This instance.
     */
    empty(): this {
        this.ref.textContent = ''
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
     * Sets the fill attribute.
     * @param value The fill color/value.
     * @returns This instance.
     */
    setFill(value: string): this {
        return this.setAttr('fill', value)
    }

    /**
     * Sets the stroke attribute.
     * @param value The stroke color/value.
     * @returns This instance.
     */
    setStroke(value: string): this {
        return this.setAttr('stroke', value)
    }

    /**
     * Sets the stroke-width attribute.
     * @param value The width.
     * @returns This instance.
     */
    setStrokeWidth(value: string | number): this {
        return this.setAttr('stroke-width', String(value))
    }

    /**
     * Sets the viewBox attribute.
     * @param p1 Min-x or string/array value.
     * @param p2 Min-y.
     * @param p3 Width.
     * @param p4 Height.
     * @returns This instance.
     */
    setViewBox(p1: string | (string | number)[] | number, p2?: number, p3?: number, p4?: number): this {
        if (typeof p1 === 'number' && p2 !== undefined && p3 !== undefined && p4 !== undefined) {
            return this.setAttr('viewBox', `${p1} ${p2} ${p3} ${p4}`)
        }
        const value = p1 as string | (string | number)[]
        return this.setAttr('viewBox', Array.isArray(value) ? value.join(' ') : value)
    }

    /**
     * Sets the width attribute.
     * @param value The width.
     * @returns This instance.
     */
    setWidth(value: string | number): this {
        return this.setAttr('width', String(value))
    }

    /**
     * Sets the height attribute.
     * @param value The height.
     * @returns This instance.
     */
    setHeight(value: string | number): this {
        return this.setAttr('height', String(value))
    }

    /**
     * Sets the d attribute (path data).
     * @param value The path data string or array of segments.
     * @returns This instance.
     */
    setD(value: string | (string | number)[]): this {
        return this.setAttr('d', Array.isArray(value) ? value.join(' ') : value)
    }

    /**
     * Sets the transform attribute.
     * @param value The transform string.
     * @returns This instance.
     */
    setTransform(value: string): this {
        return this.setAttr('transform', value)
    }
}
