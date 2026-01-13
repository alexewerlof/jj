import { isA } from 'jty'
import { WN } from './WN.js'
import { Wrapped } from './WN-mixin.js'

/**
 * Wraps a DocumentFragment (which is a descendant of Node)
 */
export class WDF<T extends DocumentFragment = DocumentFragment> extends WN<T> {
    static from(ref: DocumentFragment): WDF {
        return new WDF(ref)
    }

    static create() {
        return new WDF(document.createDocumentFragment())
    }

    constructor(ref: T) {
        if (!isA(ref, DocumentFragment)) {
            throw new TypeError(`Expected a DocumentFragment. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    byId(id: string, throwIfNotFound = true): Wrapped | null {
        const el = this.ref.getElementById(id)
        if (el) {
            return WN.wrap(el)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Element with id ${id} not found`)
        }
        return null
    }

    empty(): this {
        this.ref.replaceChildren()
        return this
    }
}
