import { isA, isStr } from 'jty'
import { JJE } from './JJE.js'
import { IElementData } from './mixin-types.js'

const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg'

/**
 * Wraps a DOM SVGElement.
 *
 * @remarks
 * This class extends `JJE` to provide specific functionality for SVG elements,
 * including namespace-aware creation and helper methods for common SVG attributes.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement | SVGElement}
 */
export class JJSE<T extends SVGElement = SVGElement> extends JJE<T> {
    /**
     * Creates a JJSE instance from an SVGElement reference.
     *
     * @example
     * ```ts
     * const svg = JJSE.from(myCircle)
     * ```
     *
     * @param ref - The SVGElement.
     * @returns A new JJSE instance.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement | SVGElement}
     */
    static from(ref: SVGElement): JJSE {
        return new JJSE(ref)
    }

    /**
     * Creates a JJSE instance from a tag name (in the SVG namespace).
     *
     * @remarks
     * Automatically uses the correct SVG namespace URI: `http://www.w3.org/2000/svg`.
     *
     * @example
     * ```ts
     * const circle = JJSE.fromTag('circle')
     * ```
     *
     * @param tagName - The tag name.
     * @param options - Element creation options.
     * @returns A new JJSE instance.
     * @throws {TypeError} If `tagName` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS | document.createElementNS}
     */
    static fromTag(tagName: string, options?: ElementCreationOptions): JJSE {
        if (!isStr(tagName)) {
            throw new TypeError(`Expected a string for tagName. Got: ${tagName} (${typeof tagName})`)
        }
        // SVG elements must be created with the SVG namespace
        const element = document.createElementNS(SVG_NAMESPACE_URI, tagName, options)
        return new JJSE(element as SVGElement)
    }

    /**
     * Creates an instance of JJSE.
     *
     * @param ref - The SVGElement to wrap.
     * @throws {TypeError} If `ref` is not an SVGElement.
     */
    constructor(ref: T) {
        if (!isA(ref, SVGElement)) {
            throw new TypeError(`Expected an SVGElement. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    /**
     * Gets the text content of the element.
     *
     * @returns The text content.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    getText(): string {
        return this.ref.textContent ?? ''
    }

    /**
     * Sets the text content of the element.
     *
     * @param text - The text to set.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    setText(text: string): this {
        this.ref.textContent = text
        return this
    }

    /**
     * Clears the text content of the element.
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    empty(): this {
        this.ref.textContent = ''
        return this
    }

    /**
     * Sets the fill attribute.
     *
     * @param value - The fill color/value.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill | fill}
     */
    setFill(value: string): this {
        return this.setAttr('fill', value)
    }

    /**
     * Sets the stroke attribute.
     *
     * @param value - The stroke color/value.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke | stroke}
     */
    setStroke(value: string): this {
        return this.setAttr('stroke', value)
    }

    /**
     * Sets the stroke-width attribute.
     *
     * @param value - The width.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width | stroke-width}
     */
    setStrokeWidth(value: string | number): this {
        return this.setAttr('stroke-width', String(value))
    }

    /**
     * Sets the viewBox attribute.
     *
     * @example
     * ```ts
     * svg.setViewBox(0, 0, 100, 100)
     * svg.setViewBox('0 0 100 100')
     * ```
     *
     * @param p1 - Min-x or string/array value.
     * @param p2 - Min-y.
     * @param p3 - Width.
     * @param p4 - Height.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox | viewBox}
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
     *
     * @param value - The width.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/width | width}
     */
    setWidth(value: string | number): this {
        return this.setAttr('width', String(value))
    }

    /**
     * Sets the height attribute.
     *
     * @param value - The height.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/height | height}
     */
    setHeight(value: string | number): this {
        return this.setAttr('height', String(value))
    }

    /**
     * Sets the d attribute (path data).
     *
     * @param value - The path data string or array of segments.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d | d}
     */
    setD(value: string | (string | number)[]): this {
        return this.setAttr('d', Array.isArray(value) ? value.join(' ') : value)
    }

    /**
     * Sets the transform attribute.
     *
     * @param value - The transform string.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform | transform}
     */
    setTransform(value: string): this {
        return this.setAttr('transform', value)
    }
}

// IElementData
export declare interface JJSE<T extends SVGElement> extends IElementData {}
