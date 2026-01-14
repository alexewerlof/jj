import { isA } from 'jty'
import { WN } from './WN.js'
import { Wrapped } from './WN-mixin.js'

/**
 * Wraps a Document (which is a descendant of Node)
 */
export class WD<T extends Document = Document> extends WN<T> {
    static from(ref: Document): WD {
        return new WD(ref)
    }

    constructor(ref: T) {
        if (!isA(ref, Document)) {
            throw new TypeError(`Expected a Document. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }
}
