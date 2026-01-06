import { isA } from 'jty'
import { WN } from './WN.js'
import { WE } from './WE.js'

/**
 * Wraps a DocumentFragment (which is a descendant of Node)
 */
export class WF<T extends DocumentFragment = DocumentFragment> extends WN<T> {
    constructor(ref: T) {
        if (!isA(ref, DocumentFragment)) {
            throw new TypeError(`Expected a DocumentFragment. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    static from(fragment: DocumentFragment): WF {
        if (!isA(fragment, DocumentFragment)) {
            throw new TypeError(`Expected a DocumentFragment. Got ${fragment} (${typeof fragment})`)
        }
        return new WF(fragment)
    }

    byId(id: string): WE {
        const el = this.ref.getElementById(id)
        if (!el) throw new TypeError(`Element with id ${id} not found`)
        return WE.from(el)
    }

    query(selector: string): WE | null {
        const result = this.ref.querySelector(selector)
        return result === null ? result : WE.from(result)
    }

    queryAll(selector: string): WE[] {
        return WE.fromIter(this.ref.querySelectorAll(selector))
    }

    empty(): this {
        this.ref.replaceChildren()
        return this
    }
}
