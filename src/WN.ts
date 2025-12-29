import { isA, isArr, isStr } from 'jty'

export class WN {
    #ref!: Node

    constructor(ref: Node) {
        if (!isA(ref, Node)) {
            throw new TypeError(`Expected a Node. Got: ${ref} (${typeof ref})`)
        }
        this.#ref = ref
    }

    get ref(): Node {
        return this.#ref
    }

    set ref(value: Node) {
        if (!(value instanceof Node)) {
            throw new TypeError(`Expected a Node. Got: ${value} (${typeof value})`)
        }
        this.#ref = value
    }

    static wrap(x: Node | WN): WN {
        if (isA(x, WN)) {
            return x
        }
        if (isA(x, Node)) {
            return new WN(x)
        }
        throw new TypeError(`Expected a WN or Node. Got: ${x} (${typeof x})`)
    }

    static unwrap(x: WN | Node): Node {
        if (isA(x, WN)) {
            return x.ref
        }
        if (isA(x, Node)) {
            return x
        }
        throw new TypeError(`Expected a WN or Node. Got: ${x} (${typeof x})`)
    }

    static from(node: Node): WN {
        return new WN(node)
    }
}
