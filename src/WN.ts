import { isA } from 'jty'
import { Unwrapped, Wrappable, Wrapped } from './WN-mixin.js'
import { off, on } from './util.js'

/** @returns true if this.ref is an instance of descendant of Element or DocumentFragment  */
function isElementOrDocumentFragment(x: unknown): x is Element | DocumentFragment {
    return isA(x, Element) || isA(x, DocumentFragment)
}

/**
 * Wraps a DOM Node
 */
export class WN<T extends Node = Node> {
    static from(node: Node): WN {
        return new WN(node)
    }

    declare static wrap: (raw: Wrappable) => Wrapped
    declare static unwrap: (obj: Wrappable) => Unwrapped

    /**
     * wraps an iteratable object (e.g. an array of wrapped or DOM elements)
     */
    static wrapAll(iterable: Iterable<Wrappable>): Wrapped[] {
        return Array.from(iterable, WN.wrap)
    }

    /**
     * unwraps an iteratable object (e.g. an array of HTMLCollection)
     */
    static unwrapAll(iterable: Iterable<Wrappable>): Unwrapped[] {
        return Array.from(iterable, WN.unwrap)
    }

    static byId(id: string, throwIfNotFound = true): Wrapped | null {
        const el = document.getElementById(id)
        if (el) {
            return WN.wrap(el)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Found no element with id ${id} in the document.`)
        }
        return null
    }

    static byClass(className: string) {
        return WN.wrapAll(document.getElementsByClassName(className))
    }

    static query(selector: string, throwIfNotFound = true): Wrapped | null {
        const queryResult = document.querySelector(selector)
        if (queryResult) {
            return WN.wrap(queryResult)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Element with selector ${selector} not found`)
        }
        return null
    }

    query(selector: string, throwIfNotFound = true): Wrapped | null {
        if (!isElementOrDocumentFragment(this.ref)) {
            throw new TypeError(`Expected an Element or DocumentFragment. Got ${this.ref} (${typeof this.ref})`)
        }
        const queryResult = this.ref.querySelector(selector)
        if (queryResult) {
            return WN.wrap(queryResult)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Element with selector ${selector} not found`)
        }
        return null
    }

    static queryAll(selector: string): Wrapped[] {
        return WN.wrapAll(document.querySelectorAll(selector))
    }

    queryAll(selector: string): Wrapped[] {
        if (!isElementOrDocumentFragment(this.ref)) {
            throw new TypeError(`Expected an Element or DocumentFragment. Got ${this.ref} (${typeof this.ref})`)
        }
        return WN.wrapAll(this.ref.querySelectorAll(selector))
    }

    #ref!: T

    constructor(ref: T) {
        if (!isA(ref, Node)) {
            throw new TypeError(`Expected a Node. Got ${ref} (${typeof ref})`)
        }
        this.#ref = ref
    }

    get ref() {
        return this.#ref
    }

    clone(deep?: boolean): Wrapped {
        return WN.wrap(this.ref.cloneNode(deep))
    }

    append(...children: Wrappable[]): this {
        const nodes = WN.unwrapAll(children)
        if (isElementOrDocumentFragment(this.ref)) {
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

    mapAppend<T>(array: Wrappable[], mapFn: (item: Wrappable) => Wrappable): this {
        return this.append(...array.map(mapFn))
    }

    prepend(...children: Wrappable[]): this {
        const nodes = WN.unwrapAll(children)
        if (isElementOrDocumentFragment(this.ref)) {
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

    mapPrepend<T>(array: Wrappable[], mapFn: (item: Wrappable) => Wrappable): this {
        return this.prepend(...array.map(mapFn))
    }

    on(eventName: string, handler: EventListenerOrEventListenerObject): this {
        on(this.ref, eventName, handler)
        return this
    }

    off(eventName: string, handler: EventListenerOrEventListenerObject): this {
        off(this.ref, eventName, handler)
        return this
    }

    rm() {
        this.ref.parentNode?.removeChild(this.ref)
        return this
    }

    /**
     * Runs a function in the context of this WN instance.
     *
     * @param fn - The function to run. `this` inside the function will refer to this WN instance.
     * @param args - Arguments to pass to the function.
     * @returns The return value of the function.
     * @remark if the function throws, `run()` doesn't swallow the exception.
     * So if you're expecting an error, make sure to wrap it in a `try..catch` block and handle the exception.
     * @remark if the function returns a promise, you can `await` on the response.
     */
    run<R, Args extends any[]>(fn: (this: this, ...args: Args) => R, ...args: Args): R {
        return fn.call(this, ...args)
    }
}
