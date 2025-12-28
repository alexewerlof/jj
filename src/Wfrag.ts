import { isA } from 'jty'
import { Wnode } from './Wnode.js'
import { Welem } from './Welem.js'
import { unwrapNodeStrs } from './util.js'

export class Wfrag extends Wnode {
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

    byId(id: string): Welem {
        const el = this.ref.getElementById(id)
        if (!el) throw new TypeError(`Element with id ${id} not found`)
        return Welem.from(el)
    }

    query(selector: string): Welem | null {
        const result = this.ref.querySelector(selector)
        if (!result) {
            return result
        }
        return Welem.from(result)
    }

    queryAll(selector: string): Welem[] {
        return Welem.fromIter(this.ref.querySelectorAll(selector))
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
