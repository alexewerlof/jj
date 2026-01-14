import { isA } from 'jty'
import { JJN } from './JJN.js'

/**
 * Wraps a DocumentFragment (which is a descendant of Node)
 */
export class JJDF<T extends DocumentFragment = DocumentFragment> extends JJN<T> {
    /**
     * Creates a JJDF instance from a DocumentFragment reference.
     * @param ref The DocumentFragment instance.
     * @returns A new JJDF instance.
     */
    static from(ref: DocumentFragment): JJDF {
        return new JJDF(ref)
    }

    /**
     * Creates a new empty JJDF instance (wraps a new DocumentFragment).
     * @returns A new JJDF instance.
     */
    static create() {
        return new JJDF(document.createDocumentFragment())
    }

    /**
     * Creates an instance of JJDF.
     * @param ref The DocumentFragment instance to wrap.
     * @throws {TypeError} If ref is not a DocumentFragment.
     */
    constructor(ref: T) {
        if (!isA(ref, DocumentFragment)) {
            throw new TypeError(`Expected a DocumentFragment. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }
}
