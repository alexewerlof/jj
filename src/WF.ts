import { isA } from 'jty'
import { WN } from './WN.js'
import { WE } from './WE.js'
import { unwrapNodeStrs } from './util.js'

export class WF extends WN {
    constructor(ref: DocumentFragment) {
        if (!isA(ref, DocumentFragment)) {
            throw new TypeError(`Expected a DocumentFragment. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    get ref(): DocumentFragment {
        return super.ref as DocumentFragment
    }

    set ref(val: DocumentFragment) {
        if (!isA(val, DocumentFragment)) {
            throw new TypeError(`Expected a DocumentFragment. Got ${val} (${typeof val})`)
        }
        super.ref = val
    }

    static wrap(x: DocumentFragment | WF): WF {
        if (isA(x, WF)) {
            return x
        }
        if (isA(x, DocumentFragment)) {
            return new WF(x)
        }
        throw new TypeError(`Expected a WF or DocumentFragment. Got ${x} (${typeof x})`)
    }

    static unwrap(x: WF | DocumentFragment): DocumentFragment {
        if (isA(x, WF)) {
            return x.ref
        }
        if (isA(x, DocumentFragment)) {
            return x
        }
        throw new TypeError(`Expected a WF or DocumentFragment. Got ${x} (${typeof x})`)
    }

    static from(fragment: DocumentFragment): WF {
        return new WF(fragment)
    }

    byId(id: string): WE {
        const el = this.ref.getElementById(id)
        if (!el) throw new TypeError(`Element with id ${id} not found`)
        return WE.from(el)
    }

    query(selector: string): WE | null {
        const result = this.ref.querySelector(selector)
        if (!result) {
            return result
        }
        return WE.from(result)
    }

    queryAll(selector: string): WE[] {
        return WE.fromIter(this.ref.querySelectorAll(selector))
    }

    empty(): this {
        this.ref.replaceChildren()
        return this
    }

    append(...children: unknown[]): this {
        this.ref.append(...unwrapNodeStrs(children))
        return this
    }

    mapAppend<T>(array: T[], mapFn: (item: T) => unknown): this {
        return this.append(...array.map(mapFn))
    }

    prepend(...children: unknown[]): this {
        this.ref.prepend(...unwrapNodeStrs(children))
        return this
    }

    mapPrepend<T>(array: T[], mapFn: (item: T) => unknown): this {
        return this.prepend(...array.map(mapFn))
    }
}
