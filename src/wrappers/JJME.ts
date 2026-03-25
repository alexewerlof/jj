import { isInstance, isStr } from 'jty'
import { typeErr } from '../internal.js'
import { MATHML_NS } from '../xmlns.js'
import { Wrappable } from './types.js'
import { JJEx } from './JJEx.js'

/**
 * Wraps a DOM MathMLElement like <math>, <mrow>, <mi>, <mn>, <mo>, etc.
 *
 * @remarks
 * This class extends `JJE` to provide specific functionality for MathML elements,
 * including namespace-aware creation and text helpers.
 *
 * @category Wrappers
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement | MathMLElement}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/MathML/Reference/Element/math | <math>}
 */
export class JJME<T extends MathMLElement = MathMLElement> extends JJEx<T> {
    /**
     * Creates a JJME instance from a MathMLElement reference.
     *
     * @remarks
     * Use {@link JJME.create} to create new MathMLElements, or use this method to wrap existing ones.
     * For HTMLElements, use {@link JJHE.from}, or {@link JJSE.from} for SVGElements.
     *
     * @example
     * ```ts
     * const mrow = JJME.from(myMrow)
     * ```
     *
     * @param ref - The MathMLElement.
     * @returns A new JJME instance.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement | MathMLElement}
     */
    static from(ref: MathMLElement): JJME {
        return new JJME(ref)
    }

    /**
     * Creates a JJME instance from a tag name (in the MathML namespace).
     *
     * @remarks
     * Automatically uses {@link MATHML_NS} for namespace-aware element creation.
     *
     * @example
     * ```ts
     * const frac = JJME.create('mfrac')
     * ```
     *
     * @param tagName - The tag name.
     * @param options - Element creation options.
     * @returns A new JJME instance.
     * @throws {TypeError} If `tagName` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS | document.createElementNS}
     */
    static create<K extends keyof MathMLElementTagNameMap>(
        tagName: K,
        options?: ElementCreationOptions,
    ): JJME<MathMLElementTagNameMap[K]>
    static create(tagName: string, options?: ElementCreationOptions): JJME
    static create(tagName: string, options?: ElementCreationOptions): JJME {
        if (!isStr(tagName)) {
            throw typeErr(
                'tagName',
                'a string like "math" or "mfrac"',
                tagName,
                'Pass a valid MathML tag name like "math", "mrow", or "mfrac".',
            )
        }
        // MathML elements must be created with the MathML namespace
        const element = document.createElementNS(MATHML_NS, tagName, options)
        return new JJME(element as MathMLElement)
    }

    /**
     * Builds a MathML element tree with optional attributes and children.
     *
     * @remarks
     * A concise declarative way to build MathML DOM snippets. All elements are created in the MathML namespace.
     * Chain further JJ methods on the return value. Pass `null` or omit `attributes` when no attributes are needed.
     *
     * If you prefer a shorter alias compatible with hyperscript conventions, you can use:
     * ```ts
     * const h = JJME.tree
     * ```
     *
     * @example
     * ```ts
     * // Fraction: x/y
     * JJME.tree('math', null,
     *   JJME.tree('mfrac', null,
     *     JJME.tree('mi', null, 'x'),
     *     JJME.tree('mi', null, 'y'),
     *   ),
     * )
     *
     * // Subscript: a_n
     * JJME.tree('math', null,
     *   JJME.tree('msub', null,
     *     JJME.tree('mi', null, 'a'),
     *     JJME.tree('mi', null, 'n'),
     *   ),
     * )
     * ```
     *
     * @param tagName - The MathML tag name.
     * @param attributes - Attributes to set. Pass `null` or `undefined` to skip.
     * @param children - Children to append (strings, nodes, or JJ wrappers).
     * @returns A new JJME instance.
     * @throws {TypeError} If `attributes` is not a plain object.
     * @see {@link JJME.create} for a type-narrowed single-element factory.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS | document.createElementNS}
     */
    static tree(tagName: string, attributes?: Record<string, string> | null, ...children: Wrappable[]): JJME {
        return JJME.create(tagName)
            .setAttrMulti(attributes)
            .addChild(...children)
    }

    /**
     * Creates an instance of JJME.
     *
     * @param ref - The MathMLElement to wrap.
     * @throws {TypeError} If `ref` is not a MathMLElement.
     * @see {@link JJME.from} to wrap existing MathMLElements
     * @see {@link JJME.create} to create new MathMLElements
     */
    constructor(ref: T) {
        if (!isInstance(ref, Element) || ref.namespaceURI !== MATHML_NS) {
            throw typeErr('ref', `a MathML element (${MATHML_NS})`, ref, 'Use JJME.from() or JJME.create().')
        }
        super(ref)
    }

    /**
     * Gets the text content of the MathMLElement.
     *
     * @remarks
     * This method operates on `textContent`. The method name is kept short for convenience.
     *
     * @example
     * ```ts
     * const text = math.getText()
     * ```
     *
     * @returns The text content.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    getText(): string {
        return this.ref.textContent ?? ''
    }

    /**
     * Sets the text content of the MathMLElement.
     *
     * @remarks
     * This method operates on `textContent`. The method name is kept short for convenience.
     * Pass an empty string, `null`, or `undefined` to clear the content.
     * Numbers and booleans are automatically converted to strings.
     *
     * @example
     * ```ts
     * mi.setText('x')
     * mi.setText(null) // Clear content
     * mi.setText(42) // Numbers are converted
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
}
