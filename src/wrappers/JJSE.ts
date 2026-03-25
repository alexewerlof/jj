import { isInstance, isNum, isStr } from 'jty'
import { typeErr } from '../internal.js'
import { SVG_NS } from '../xmlns.js'
import { Wrappable } from './types.js'
import { JJEx } from './JJEx.js'

/**
 * Wraps a DOM SVGElement like <svg>, <rect>, <circle>, <path>, etc.
 *
 * @remarks
 * This class extends `JJE` to provide specific functionality for SVG elements,
 * including namespace-aware creation and helper methods for common SVG attributes.
 *
 * @category Wrappers
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement | SVGElement}
 */
export class JJSE<T extends SVGElement = SVGElement> extends JJEx<T> {
    /**
     * Creates a JJSE instance from an SVGElement reference.
     *
     * @remarks
     * Use {@link JJSE.create} to create new SVGElements, or use this method to wrap existing ones.
     * For HTMLElements, use {@link JJHE.from}, or {@link JJME.from} for MathMLElements.
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
     * Automatically uses {@link SVG_NS} for namespace-aware element creation.
     * For existing SVGElements, use {@link JJSE.from} instead.
     * For HTMLElements, use {@link JJHE.create} or {@link JJME.create} for MathMLElements.
     *
     * @example
     * ```ts
     * const circle = JJSE.create('circle')
     * ```
     *
     * @param tagName - The tag name.
     * @param options - Element creation options.
     * @returns A new JJSE instance.
     * @throws {TypeError} If `tagName` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS | document.createElementNS}
     */
    static create<K extends keyof SVGElementTagNameMap>(
        tagName: K,
        options?: ElementCreationOptions,
    ): JJSE<SVGElementTagNameMap[K]>
    static create(tagName: string, options?: ElementCreationOptions): JJSE
    static create(tagName: string, options?: ElementCreationOptions): JJSE {
        if (!isStr(tagName)) {
            throw typeErr(
                'tagName',
                'a string like "circle" or "path"',
                tagName,
                'Pass a valid SVG tag name like "svg", "circle", or "path".',
            )
        }
        // SVG elements must be created with the SVG namespace
        const element = document.createElementNS(SVG_NS, tagName, options)
        return new JJSE(element as SVGElement)
    }

    /**
     * Builds an SVG element tree with optional attributes and children.
     *
     * @remarks
     * A concise declarative way to build SVG DOM snippets. All elements are created in the SVG namespace.
     * Chain further JJ methods on the return value. Pass `null` or omit `attributes` when no attributes are needed.
     *
     * If you prefer a shorter alias compatible with hyperscript conventions, you can use:
     * ```ts
     * const h = JJSE.tree
     * ```
     *
     * @example
     * ```ts
     * // Simple SVG icon
     * JJSE.tree('svg', { viewBox: '0 0 24 24', width: '24', height: '24' },
     *   JJSE.tree('circle', { cx: '12', cy: '12', r: '10', fill: 'currentColor' }),
     * )
     *
     * // No attributes
     * JJSE.tree('g', null, JJSE.tree('rect', { x: '0', y: '0', width: '10', height: '10' }))
     * ```
     *
     * @param tagName - The SVG tag name.
     * @param attributes - Attributes to set. Pass `null` or `undefined` to skip.
     * @param children - Children to append (strings, nodes, or JJ wrappers).
     * @returns A new JJSE instance.
     * @throws {TypeError} If `attributes` is not a plain object.
     * @see {@link JJSE.create} for a type-narrowed single-element factory.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS | document.createElementNS}
     */
    static tree(tagName: string, attributes?: Record<string, string> | null, ...children: Wrappable[]): JJSE {
        return JJSE.create(tagName)
            .setAttrMulti(attributes)
            .addChild(...children)
    }

    /**
     * Creates an instance of JJSE.
     *
     * @param ref - The SVGElement to wrap.
     * @throws {TypeError} If `ref` is not an SVGElement.
     */
    constructor(ref: T) {
        if (!isInstance(ref, SVGElement)) {
            throw typeErr(
                'ref',
                'an SVGElement',
                ref,
                'Wrap an existing SVG element with JJSE.from(el) or create one with JJSE.create("svg").',
            )
        }
        super(ref)
    }

    /**
     * Gets the text content of the SVGElement.
     *
     * @remarks
     * This method operates on `textContent`. The method name is kept short for convenience.
     *
     * @example
     * ```ts
     * const text = svg.getText()
     * ```
     *
     * @returns The text content.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    getText(): string {
        return this.ref.textContent ?? ''
    }

    /**
     * Sets the text content of the SVGElement.
     *
     * @remarks
     * This method operates on `textContent`. The method name is kept short for convenience.
     * Pass an empty string, `null`, or `undefined` to clear the content.
     * Numbers and booleans are automatically converted to strings.
     *
     * @example
     * ```ts
     * svg.setText('Hello SVG')
     * svg.setText(null)  // Clear content
     * svg.setText(42)  // Numbers are converted
     * ```
     *
     * @param text - The text to set, or null/undefined to clear.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    setText(text?: unknown): this {
        this.ref.textContent = text as string | null
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
        if (isNum(p1) && isNum(p2) && isNum(p3) && isNum(p4)) {
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
