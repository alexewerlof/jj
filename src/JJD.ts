import { isA } from 'jty'
import { JJN } from './JJN.js'

/**
 * Wraps a Document (which is a descendant of Node)
 */
export class JJD<T extends Document = Document> extends JJN<T> {
    /**
     * Creates a JJD instance from a Document reference.
     * @param ref The Document instance.
     * @returns A new JJD instance.
     */
    static from(ref: Document): JJD {
        return new JJD(ref)
    }

    /**
     * Creates an instance of JJD.
     * @param ref The Document instance to wrap.
     * @throws {TypeError} If ref is not a Document.
     */
    constructor(ref: T) {
        if (!isA(ref, Document)) {
            throw new TypeError(`Expected a Document. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }
}
