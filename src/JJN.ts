import { isA, isObj, isStr } from 'jty'
import { Unwrapped, Wrappable, Wrapped } from './types.js'
import { JJET } from './JJET.js'

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
     * @returns true if `x` is a string, Node (or its descendents), JJN (or its descendents)
     */
    static isWrapable(x: unknown): x is Wrappable {
        return isStr(x) || isA(x, Node) || isA(x, JJN)
    }

    /**
     * Wraps a native DOM node or string into the most specific JJ wrapper available.
     *
     * @remarks
     * This function acts as a factory, inspecting the input type and returning the appropriate
     * subclass of `JJN` (e.g., `JJHE` for `HTMLElement`, `JJT` for `Text`).
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
        throw new ReferenceError(`The mixin is supposed to override this method.`)
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
            throw new TypeError(`Expected an object. Got ${obj} (${typeof obj})`)
        }
        if (isA(obj, Node)) {
            return obj
        }
        if (isA(obj, JJN)) {
            return obj.ref
        }
        throw new TypeError(`Could not unwrap ${obj} (${typeof obj})`)
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
        if (!isA(ref, Node)) {
            throw new TypeError(`Expected a Node. Got ${ref} (${typeof ref})`)
        }
        super(ref)
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
     * Creates a Text node from a string and appends it to this Node.
     *
     * @remarks
     * This method is overridden in JJT to append to the existing text content instead.
     *
     * @example
     * ```ts
     * el.addText('Hello ')
     * el.addText('World')
     * ```
     *
     * @param text - The text to add. If null or undefined, nothing is added.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode | document.createTextNode}
     */
    addText(text?: string | null): this {
        if (text) {
            this.ref.appendChild(document.createTextNode(text))
        }
        return this
    }
}
