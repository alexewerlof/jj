import { isA, isArr, isStr } from 'jty'

export class Wnode {
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
}
