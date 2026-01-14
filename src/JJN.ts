import { isA, isStr } from 'jty'
import { Unwrapped, Wrappable, Wrapped } from './JJN-mixin.js'
import { off, on } from './util.js'

/**
 * Checks if a given reference is an instance or descendant of
 * Document or DocumentFragment
 */
function isDDF(x: unknown): x is Document | DocumentFragment {
    return isA(x, Document) || isA(x, DocumentFragment)
}

/**
 * Checks if a given reference is an instance or descendant of
 * Element, Document or DocumentFragment
 */
function isEDDF(x: unknown): x is Element | Document | DocumentFragment {
    return isA(x, Element) || isDDF(x)
}

/**
 * Wraps a DOM Node.
 *
 * @remarks
 * This is the base class for all JJ wrappers. It provides common functionality for DOM manipulation,
 * traversal, and event handling.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node | Node}
 */
export class JJN<T extends Node = Node> {
    /**
     * Creates a JJN instance from a Node reference.
     *
     * @param node - The Node instance.
     * @returns A new JJN instance.
     */
    static from(node: Node): JJN {
        return new JJN(node)
    }

    declare static wrap: (raw: Wrappable) => Wrapped
    declare static unwrap: (obj: Wrappable) => Unwrapped

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
     * Unwraps an iterable object (e.g. an array of HTMLCollection).
     *
     * @param iterable - The iterable to unwrap.
     * @returns An array of native DOM nodes.
     */
    static unwrapAll(iterable: Iterable<Wrappable>): Unwrapped[] {
        return Array.from(iterable, JJN.unwrap)
    }

    /**
     * Finds an element by ID in the document.
     *
     * @param id - The ID to search for.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null if not found and throwIfNotFound is false.
     * @throws {TypeError} If the element is not found and throwIfNotFound is true.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById | Document.getElementById}
     */
    static byId(id: string, throwIfNotFound = true): Wrapped | null {
        const el = document.getElementById(id)
        if (el) {
            return JJN.wrap(el)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Found no element with id ${id} in the document.`)
        }
        return null
    }

    /**
     * Finds an element by ID within this context.
     *
     * @remarks
     * If this instance wraps an Element, it uses `querySelector('#id')`.
     * If it wraps a Document or DocumentFragment, it uses `getElementById`.
     *
     * @param id - The ID to search for.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null if not found and throwIfNotFound is false.
     * @throws {TypeError} If `id` is not a string.
     * @throws {TypeError} If the context is not an Element, Document, or DocumentFragment.
     * @throws {TypeError} If the element is not found and throwIfNotFound is true.
     */
    byId(id: string, throwIfNotFound = true): Wrapped | null {
        if (!isStr(id)) {
            throw new TypeError(`Expected a string id. Got ${id} (${typeof id})`)
        }
        if (isA(this.ref, HTMLElement)) {
            return this.query(`#${id}`, throwIfNotFound)
        }
        if (!isDDF(this.ref)) {
            throw new TypeError(`Expected a Document or DocumentFragment. Got ${this.ref} (${typeof this.ref})`)
        }
        const el = this.ref.getElementById(id)
        if (el) {
            return JJN.wrap(el)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Element with id ${id} not found`)
        }
        return null
    }

    /**
     * Finds elements by class name in the document.
     *
     * @param className - The class name to search for.
     * @returns An array of wrapped elements.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName | Document.getElementsByClassName}
     */
    static byClass(className: string) {
        return JJN.wrapAll(document.getElementsByClassName(className))
    }

    /**
     * Finds the first element matching a selector in the document.
     *
     * @param selector - The CSS selector.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null.
     * @throws {TypeError} If not found and throwIfNotFound is true.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector | Document.querySelector}
     */
    static query(selector: string, throwIfNotFound = true): Wrapped | null {
        const queryResult = document.querySelector(selector)
        if (queryResult) {
            return JJN.wrap(queryResult)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Element with selector ${selector} not found`)
        }
        return null
    }

    /**
     * Finds the first element matching a selector within this element's context.
     *
     * @param selector - The CSS selector.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null.
     * @throws {TypeError} If context is invalid or element not found (when requested).
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector | Element.querySelector}
     */
    query(selector: string, throwIfNotFound = true): Wrapped | null {
        if (!isEDDF(this.ref)) {
            throw new TypeError(
                `Expected an Element, Document or DocumentFragment. Got ${this.ref} (${typeof this.ref})`,
            )
        }
        const queryResult = this.ref.querySelector(selector)
        if (queryResult) {
            return JJN.wrap(queryResult)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Element with selector ${selector} not found`)
        }
        return null
    }

    /**
     * Finds all elements matching a selector in the document.
     *
     * @param selector - The CSS selector.
     * @returns An array of wrapped elements.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll | Document.querySelectorAll}
     */
    static queryAll(selector: string): Wrapped[] {
        return JJN.wrapAll(document.querySelectorAll(selector))
    }

    /**
     * Finds all elements matching a selector within this element's context.
     *
     * @param selector - The CSS selector.
     * @returns An array of wrapped elements.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll | Element.querySelectorAll}
     */
    queryAll(selector: string): Wrapped[] {
        if (!isEDDF(this.ref)) {
            throw new TypeError(
                `Expected an Element, Document or DocumentFragment. Got ${this.ref} (${typeof this.ref})`,
            )
        }
        return JJN.wrapAll(this.ref.querySelectorAll(selector))
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
    append(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children)
        if (isEDDF(this.ref)) {
            this.ref.append(...nodes)
        } else {
            for (const node of nodes) {
                if (node) {
                    this.ref.appendChild(node)
                }
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
    mapAppend<T>(array: Wrappable[], mapFn: (item: Wrappable) => Wrappable): this {
        return this.append(...array.map(mapFn))
    }

    /**
     * Prepends children to this node.
     *
     * @param children - The children to prepend.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend | Element.prepend}
     */
    prepend(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children)
        if (isEDDF(this.ref)) {
            this.ref.prepend(...nodes)
        } else {
            const first = this.ref.firstChild
            for (const node of nodes) {
                if (node) {
                    this.ref.insertBefore(node, first)
                }
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
    mapPrepend<T>(array: Wrappable[], mapFn: (item: Wrappable) => Wrappable): this {
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
     * @throws {TypeError} If the node is not an Element, Document, or DocumentFragment.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.replaceChildren}
     */
    empty(): this {
        if (!isEDDF(this.ref)) {
            throw new TypeError(
                `Expected an Element, Document or DocumentFragment. Got ${this.ref} (${typeof this.ref})`,
            )
        }
        this.ref.replaceChildren()
        return this
    }

    /**
     * Runs a function in the context of this JJN instance.
     *
     * @param fn - The function to run. `this` inside the function will refer to this JJN instance.
     * @param args - Arguments to pass to the function.
     * @returns The return value of the function.
     * @remarks if the function throws, `run()` doesn't swallow the exception.
     * So if you're expecting an error, make sure to wrap it in a `try..catch` block and handle the exception.
     * @remarks if the function returns a promise, you can `await` on the response.
     */
    run<R, Args extends any[]>(fn: (this: this, ...args: Args) => R, ...args: Args): R {
        return fn.call(this, ...args)
    }
}
