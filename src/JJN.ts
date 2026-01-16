import { isA } from 'jty'
import { Unwrapped, Wrappable, Wrapped } from './types.js'
import { off, on } from './util.js'
import { IAppendPrepend } from './mixin-types.js'

/**
 * Wraps a DOM Node.
 *
 * @remarks
 * This is the base class for all JJ wrappers. It provides common functionality for DOM manipulation,
 * traversal, and event handling.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node | Node}
 */
export class JJN<T extends Node = Node> implements IAppendPrepend {
    /**
     * Creates a JJN instance from a Node reference.
     *
     * @param node - The Node instance.
     * @returns A new JJN instance.
     */
    static from(node: Node): JJN {
        return new JJN(node)
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
        throw new ReferenceError(`The mixin is supposed to override this method.`)
    }

    /**
     * Wraps an iterable object (e.g. an array of wrapped or DOM elements).
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
     * @param iterable - The iterable to unwrap.
     * @returns An array of native DOM nodes.
     */
    static unwrapAll(iterable: Iterable<Wrappable>): Unwrapped[] {
        return Array.from(iterable, JJN.unwrap)
    }

    #ref!: T

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
        this.#ref = ref
    }

    /**
     * Gets the underlying DOM Node.
     */
    get ref() {
        return this.#ref
    }

    /**
     * Clones the node.
     *
     * @param deep - If true, clones the subtree.
     * @returns A new wrapped instance of the clone.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode | Node.cloneNode}
     */
    clone(deep?: boolean): Wrapped {
        return JJN.wrap(this.ref.cloneNode(deep))
    }

    /**
     * Appends children to this node.
     *
     * @param children - The children to append (Nodes, strings, or Wrappers).
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/append | Element.append}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild | Node.appendChild}
     */
    append(...children: Wrappable[]) {
        const nodes = JJN.unwrapAll(children)
        const ref = this.ref
        for (const node of nodes) {
            if (node) {
                ref.appendChild(node)
            }
        }
        return this
    }

    /**
     * Maps an array to children and appends them.
     *
     * @param array - The source array.
     * @param mapFn - The mapping function returning a Wrappable.
     * @returns This instance for chaining.
     */
    mapAppend(array: Wrappable[], mapFn: (item: Wrappable) => Wrappable) {
        return this.append(...array.map(mapFn))
    }

    /**
     * Prepends children to this node.
     *
     * @param children - The children to prepend.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend | Element.prepend}
     */
    prepend(...children: Wrappable[]) {
        const nodes = JJN.unwrapAll(children)
        const ref = this.ref
        const first = ref.firstChild
        for (const node of nodes) {
            if (node) {
                ref.insertBefore(node, first)
            }
        }
        return this
    }

    /**
     * Maps an array to children and prepends them.
     *
     * @param array - The source array.
     * @param mapFn - The mapping function.
     * @returns This instance for chaining.
     */
    mapPrepend(array: Wrappable[], mapFn: (item: Wrappable) => Wrappable) {
        return this.prepend(...array.map(mapFn))
    }

    /**
     * Adds an event listener.
     *
     * @param eventName - The event name.
     * @param handler - The event handler.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener | EventTarget.addEventListener}
     */
    on(eventName: string, handler: EventListenerOrEventListenerObject): this {
        on(this.ref, eventName, handler)
        return this
    }

    /**
     * Removes an event listener.
     *
     * @param eventName - The event name.
     * @param handler - The event handler.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener | EventTarget.removeEventListener}
     */
    off(eventName: string, handler: EventListenerOrEventListenerObject): this {
        off(this.ref, eventName, handler)
        return this
    }

    /**
     * Removes this node from the DOM.
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild | Node.removeChild}
     */
    rm() {
        this.ref.parentNode?.removeChild(this.ref)
        return this
    }

    /**
     * Removes all children from this node.
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.replaceChildren}
     */
    empty(): this {
        const element = this.ref
        while (element.firstChild) {
            element.removeChild(element.firstChild)
        }
        return this
    }

    /**
     * Runs a function in the context of this JJN instance.
     *
     * @param fn - The function to run. `this` inside the function will refer to this JJN instance.
     * @param args - Arguments to pass to the function.
     * @returns The return value of the function.
     * @remarks
     * If you want to access the current JJ* instance, you SHOULD use a `function` not an arrow function.
     * If the function throws, `run()` doesn't swallow the exception.
     * So if you're expecting an error, make sure to wrap it in a `try..catch` block and handle the exception.
     * If the function returns a promise, you can `await` on the response.
     * If the function returns a promise, you can `await` on the response.
     */
    run<R, Args extends any[]>(fn: (this: this, ...args: Args) => R, ...args: Args): R {
        return fn.call(this, ...args)
    }
}
