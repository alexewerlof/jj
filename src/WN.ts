import { isA } from 'jty'
import { Unwrapped, Wrappable, Wrapped } from './WN-mixin.js'

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
                this.ref.appendChild(node)
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
                this.ref.insertBefore(node, first)
            }
        }
        return this
    }

    mapPrepend<T>(array: Wrappable[], mapFn: (item: Wrappable) => Wrappable): this {
        return this.prepend(...array.map(mapFn))
    }
}
