import { isA } from 'jty'
import { unwrapAll, wrap, Wrappable, Wrapped } from './util.js'

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

    #ref!: T

    constructor(ref: T) {
        this.ref = ref
    }

    get ref(): T {
        return this.#ref
    }

    set ref(value: T) {
        if (!isA(value, Node)) {
            throw new TypeError(`Expected a Node. Got: ${value} (${typeof value})`)
        }
        this.#ref = value
    }

    clone(deep?: boolean): Wrapped {
        return wrap(this.ref.cloneNode(deep))
    }

    append(...children: Wrappable[]): this {
        const nodes = unwrapAll(children)
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
        const nodes = unwrapAll(children)
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
