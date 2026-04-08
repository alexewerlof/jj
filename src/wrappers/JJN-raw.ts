import { Unwrapped, Wrappable, Wrapped } from './types.js'
import { isInstance, isStr, toStr, typeErr } from '../internal.js'
import { JJET } from './JJET.js'

/**
 * Wraps a DOM Node.
 *
 * @remarks
 * This is the base class for all JJ wrappers. It provides common functionality for DOM manipulation,
 * traversal, and event handling.
 *
 * @category Wrappers
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node | Node}
 */

export class JJN<T extends Node = Node> extends JJET<T> {
    /**
     * Creates a JJN instance from a Node reference.
     *
     * @remarks
     * For better type safety, use the specific wrapper type if you know the Node type:
     * {@link JJHE} for HTMLElement, {@link JJSE} for SVGElement, {@link JJT} for Text, etc.
     *
     * Alternatively, use {@link JJN.wrap} to automatically determine and create the appropriate wrapper.
     *
     * @example
     * ```ts
     * const node = JJN.from(document.createTextNode('hello'))
     * ```
     *
     * @param node - The Node instance.
     * @returns A new JJN instance.
     * @see {@link JJN.wrap} for automatic wrapper selection
     */
    static from(node: Node): JJN {
        return new JJN(node)
    }

    /**
     * Checks if a value can be passed to the `wrap()` or `unwrap()` function.
     *
     * @remarks
     * This is useful for filtering the array that is passed to `append()`, `prepend()` or `setChildren()`.
     * See {@link Wrappable} type for the full definition.
     *
     * @param x an unknown value
     * @returns true if `x` is a string, Node (or its descendent), JJN (or its descendent)
     * @see {@link JJN.wrap} for converting Wrappable into wrappers.
     * @see {@link JJN.unwrap} for converting Wrappable into native nodes.
     */
    static isWrappable(x: unknown): x is Wrappable {
        return isStr(x) || isInstance(x, Node) || isInstance(x, JJN)
    }

    /**
     * Wraps a native DOM node or string into the most specific JJ wrapper available.
     *
     * @remarks
     * This factory function acts as an intelligent wrapper, inspecting the input type and returning the appropriate
     * subclass of `JJN` (e.g., `JJHE` for `HTMLElement`, `JJT` for `Text`, `JJSE` for `SVGElement`, etc.).
     * Strings are automatically converted to Text nodes wrapped in `JJT`.
     *
     * If the input is already a JJ wrapper, it is returned unchanged (no double-wrapping).
     * See the full implementation in src/wrappers/JJN.ts which extends this with support for internal wrapper types.
     *
     * @example
     * ```ts
     * const bodyWrapper = JJN.wrap(document.body) // Returns JJHE<HTMLBodyElement>
     * const textWrapper = JJN.wrap('Hello') // Returns JJT wrapping a new Text node
     * const existing = JJN.wrap(alreadyWrapped) // Returns alreadyWrapped unchanged
     * ```
     *
     * @param raw - The object to wrap. If it's already Wrapped, it'll be returned without any change. We don't double-wrap or clone it.
     * @returns The most granular Wrapped subclass instance. If the input is already wrapped, it'll be returned as is without cloning.
     * @see {@link JJN.from} for explicit base wrapper construction.
     * @see {@link JJN.unwrap} for the reverse conversion.
     */
    static wrap(raw: Wrappable): Wrapped {
        if (isInstance(raw, JJN)) {
            return raw
        }
        if (isInstance(raw, Node)) {
            return new JJN(raw)
        }
        return JJN.from(document.createTextNode(toStr(raw)))
    }

    /**
     * Extracts the underlying native DOM node from a wrapper.
     *
     * @remarks
     * If the input is already a native Node, it is returned as is.
     * If the input is a JJ wrapper, its underlying node is returned.
     * Otherwise, the input is coerced into a Text node.
     * Plain objects are stringified with JSON when possible, and fall back to `String(...)`.
     *
     * @example
     * ```ts
     * const rawElement = JJN.unwrap(myJJHE) // Returns HTMLElement
     * ```
     *
     * @param obj - The value to unwrap.
     * @returns The underlying DOM node.
     * @see {@link JJN.wrap} for the reverse conversion.
     * @see {@link JJN.isWrappable} for pre-validation checks.
     */
    static unwrap(obj: Wrappable): Unwrapped {
        if (isInstance(obj, Node)) {
            return obj
        }
        if (isInstance(obj, JJN)) {
            return obj.ref
        }
        return document.createTextNode(toStr(obj))
    }

    /**
     * Wraps an iterable object (e.g. an array of wrapped or DOM elements).
     *
     * @example
     * ```ts
     * const wrappedList = JJN.wrapAll(document.querySelectorAll('div'))
     * ```
     *
     * @param iterable - The iterable to wrap.
     * @returns An array of wrapped instances.
     * @see {@link JJN.wrap} for single-item wrapping.
     * @see {@link JJN.unwrapAll} for the reverse iterable conversion.
     */
    static wrapAll(iterable: Iterable<Wrappable>): Wrapped[] {
        return Array.from(iterable, JJN.wrap)
    }

    /**
     * Unwraps an iterable object (e.g. an array or HTMLCollection).
     *
     * @example
     * ```ts
     * const nodes = JJN.unwrapAll(wrappedList)
     * ```
     *
     * @param iterable - The iterable to unwrap.
     * @returns An array of native DOM nodes.
     * @see {@link JJN.unwrap} for single-item unwrapping.
     * @see {@link JJN.wrapAll} for iterable wrapping.
     */
    static unwrapAll(iterable: Iterable<Wrappable>): Unwrapped[] {
        return Array.from(iterable, JJN.unwrap)
    }

    /**
     * Creates an instance of JJN.
     *
     * @param ref - The Node to wrap.
     * @throws {TypeError} If `ref` is not a Node.
     * @see {@link JJN.from} for the factory form.
     * @see {@link JJN.wrap} for automatic subtype wrapping.
     */
    constructor(ref: T) {
        if (!isInstance(ref, Node)) {
            throw typeErr('ref', 'a DOM Node instance', ref)
        }
        super(ref)
    }

    /**
     * Gets the parent node wrapped in the most specific JJ wrapper available.
     *
     * @remarks
     * Returns `null` when this node is detached and therefore has no parent.
     *
     * @example
     * ```ts
     * const text = JJT.create('hello')
     * JJHE.create('div').addChild(text)
     * const parent = text.getParent() // JJHE
     * ```
     *
     * @param required - Whether to throw if the node has no parent.
     * @returns The wrapped parent node, or `null` if this node has no parent.
     * @throws {ReferenceError} If `required` is true and the node has no parent.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/parentNode | Node.parentNode}
     */
    getParent(required: true): Wrapped
    getParent(required?: false): Wrapped | null
    getParent(required = false): Wrapped | null {
        const { parentNode } = this.ref
        if (parentNode) {
            return JJN.wrap(parentNode)
        }
        if (required) {
            throw new ReferenceError('Node has no parent. Did you forget to attach it to the document?')
        }
        return null
    }

    /**
     * Gets the child nodes wrapped in the most specific JJ wrappers available.
     *
     * @remarks
     * Returns an empty array when this node has no children.
     *
     * @example
     * ```ts
     * const el = JJHE.create('div').addChild('hello', JJHE.create('span'))
     * const children = el.getChildren() // [JJT, JJHE]
     * ```
     *
     * @param required - Whether to throw if the node has no children.
     * @returns The wrapped child nodes.
     * @throws {ReferenceError} If `required` is true and the node has no children.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes | Node.childNodes}
     */
    getChildren(required: true): Wrapped[]
    getChildren(required?: false): Wrapped[] | null
    getChildren(required = false): Wrapped[] | null {
        const children = JJN.wrapAll(this.ref.childNodes)
        if (required && children.length === 0) {
            throw new ReferenceError('Node has no children. Did you forget to initialize or append them?')
        }
        return children
    }

    /**
     * Clones the Node.
     *
     * @param deep - If true, clones the subtree.
     * @returns A new wrapped instance of the clone.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode | Node.cloneNode}
     */
    clone(deep?: boolean): typeof this {
        return JJN.wrap(this.ref.cloneNode(deep)) as this
    }

    /**
     * Removes this node from its parent.
     *
     * @remarks
     * If the node has no parent, this method does nothing.
     *
     * @example
     * ```ts
     * const doc = JJD.from(document)
     * const el = JJHE.create('div')
     * doc.find('body', true).addChild(el)
     * el.rm()
     * ```
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild | Node.removeChild}
     */
    rm(): this {
        const { parentNode } = this.ref
        if (parentNode) {
            parentNode.removeChild(this.ref)
        }
        return this
    }

    /**
     * Creates a Text node from a string and appends it to this Node.
     *
     * @remarks
     * This method is overridden in JJT to append to the existing text content instead.
     *
     * @example
     * ```ts
     * el.addText('Hello ')
     * el.addText('World')
     * // Behaves like document.createTextNode('Hello World') and appends it to el
     * // Falsy values are converted to their string representation, except for empty string which is added as is.
     * el.addText('Hello', '', 'world', null, undefined, '!!!') // Adds 6 text nodes with content 'Hello', '', 'world', 'null', 'undefined', and '!!!' respectively.
     * ```
     *
     * @param textArr - The text to add. The actual text that's added follows the rules in document.createTextNode() which is basically what you get from String()
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode | document.createTextNode}
     */
    addText(...textArr: unknown[]): this {
        if (textArr) {
            this.ref.appendChild(document.createTextNode(textArr.join('')))
        }
        return this
    }
}
