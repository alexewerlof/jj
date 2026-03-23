import { isInstance, isObj, isStr } from 'jty'
import { Unwrapped, Wrappable, Wrapped } from './types.js'
import { JJET } from './JJET.js'
import { typeErr } from '../internal.js'

/**
 * Wraps a DOM Node.
 *
 * @remarks
 * This is the base class for all JJ wrappers. It provides common functionality for DOM manipulation,
 * traversal, and event handling.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node | Node}
 */

export class JJN<T extends Node = Node> extends JJET<T> {
    /**
     * Creates a JJN instance from a Node reference.
     *
     * @example
     * ```ts
     * const node = JJN.from(document.createTextNode('hello'))
     * ```
     *
     * @param node - The Node instance.
     * @returns A new JJN instance.
     */
    static from(node: Node): JJN {
        return new JJN(node)
    }

    /**
     * Checks if a value can be passed to the `wrap()` or `unwrap()` function.
     *
     * @remarks
     * This is useful for filtering the array that is passed to `append()`, `prepend()` or `setChildren()`
     *
     * @param x an unknown value
     * @returns true if `x` is a string, Node (or its descendent), JJN (or its descendent)
     */
    static isWrappable(x: unknown): x is Wrappable {
        return isStr(x) || isInstance(x, Node) || isInstance(x, JJN)
    }

    /**
     * Wraps a native DOM node or string into the most specific JJ wrapper available.
     *
     * @remarks
     * This function acts as a factory, inspecting the input type and returning the appropriate
     * subclass of `JJN` (e.g., `JJHE` for `HTMLElement`, `JJT` for `Text`).
     * JJN.ts overrides this method to a richer version that handles all subclasses of JJN.
     *
     * @example
     * ```ts
     * const bodyWrapper = JJN.wrap(document.body) // Returns JJHE
     * const textWrapper = JJN.wrap('Hello') // Returns JJT wrapping a new Text node
     * ```
     *
     * @param raw - The object to wrap. If it's already Wrapped, it'll be returned without any change. We don't double-wrap or clone it.
     * @returns The most granular Wrapped subclass instance. If the input is already wrapped, it'll be returned as is without cloning.
     * @throws {TypeError} If the input is not a Node, string, or JJ wrapper.
     */
    static wrap(raw: Wrappable): Wrapped {
        if (isInstance(raw, JJN)) {
            return raw
        }
        if (isInstance(raw, Node)) {
            return new JJN(raw)
        }
        throw typeErr('raw', 'a Node or JJN instance', raw)
    }

    /**
     * Extracts the underlying native DOM node from a wrapper.
     *
     * @remarks
     * If the input is already a native Node, it is returned as is.
     * If the input is a string, a new Text node is created and returned.
     *
     * @example
     * ```ts
     * const rawElement = JJN.unwrap(myJJHE) // Returns HTMLElement
     * ```
     *
     * @param obj - The object to unwrap.
     * @returns The underlying DOM node.
     * @throws {TypeError} If the input cannot be unwrapped.
     */
    static unwrap(obj: Wrappable): Unwrapped {
        if (isStr(obj)) {
            return document.createTextNode(obj)
        }
        if (!isObj(obj)) {
            throw new TypeError(`JJN.unwrap() expects a string, DOM Node, or JJ wrapper. Got ${obj} (${typeof obj}). `)
        }
        if (isInstance(obj, Node)) {
            return obj
        }
        if (isInstance(obj, JJN)) {
            return obj.ref
        }
        throw new TypeError(
            `Could not unwrap ${obj} (${typeof obj}). ` +
                `Expected a string, Node, or JJ wrapper. ` +
                `Make sure you're passing a valid DOM element or JJ wrapper.`,
        )
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
     */
    static unwrapAll(iterable: Iterable<Wrappable>): Unwrapped[] {
        return Array.from(iterable, JJN.unwrap)
    }

    /**
     * Creates an instance of JJN.
     *
     * @param ref - The Node to wrap.
     * @throws {TypeError} If `ref` is not a Node.
     */
    constructor(ref: T) {
        if (!isInstance(ref, Node)) {
            throw new TypeError(
                `JJN expects a Node instance. Got ${ref} (${typeof ref}). ` +
                    `Use JJN.from(node) with a DOM Node, or check that you're passing a valid DOM element.`,
            )
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
     * const text = JJT.fromStr('hello')
     * JJHE.create('div').addChild(text)
     * const parent = text.parent // JJHE
     * ```
     *
     * @returns The wrapped parent node, or `null` if this node has no parent.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/parentNode | Node.parentNode}
     */
    get parent(): Wrapped | null {
        const { parentNode } = this.ref
        return parentNode ? JJN.wrap(parentNode) : null
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
     * const children = el.children // [JJT, JJHE]
     * ```
     *
     * @returns The wrapped child nodes.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes | Node.childNodes}
     */
    get children(): Wrapped[] {
        return JJN.wrapAll(this.ref.childNodes)
    }

    /**
     * Clones the Node.
     *
     * @param deep - If true, clones the subtree.
     * @returns A new wrapped instance of the clone.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode | Node.cloneNode}
     */
    clone(deep?: boolean): Wrapped {
        return JJN.wrap(this.ref.cloneNode(deep))
    }

    /**
     * Removes this node from its parent.
     *
     * @remarks
     * If the node has no parent, this method does nothing.
     *
     * @example
     * ```ts
     * const el = JJHE.create('div')
     * doc.body.addChild(el)
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
