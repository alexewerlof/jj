import { isInstance, typeErr } from '../internal.js'
import { JJNx } from './JJNx.js'

/**
 * Wraps a Document (which is a descendant of Node).
 *
 * @remarks
 * This class provides a wrapper around the native `Document` interface, inheriting
 * the fluent API capabilities of `JJN`.
 * It also supports querying (`find`) and manipulation (`addChild`, `preChild`) methods.
 *
 * To find elements by class name, use: `doc.find('.my-class')`
 *
 * To set the document title, use: `doc.ref.title = 'New Title'`
 *
 * @category Wrappers
 * @example
 * ```ts
 * const doc = JJD.from(document)
 * doc.on('DOMContentLoaded', () => console.log('Ready'))
 * doc.ref.title = 'My Page Title'  // Set document title
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document | Document}
 */
export class JJD<T extends Document = Document> extends JJNx<T> {
    /**
     * Creates a JJD instance from a Document reference.
     *
     * @remarks
     * Typically, you'll use this to wrap the global `document` object.
     * Use {@link JJHE.from} to wrap individual elements, and {@link JJHE} for the head/body elements.
     *
     * @example
     * ```ts
     * const doc = JJD.from(document)
     * ```
     *
     * @param ref - The Document instance.
     * @returns A new JJD instance.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document | Document}
     */
    static from(ref: Document): JJD {
        return new JJD(ref)
    }

    /**
     * Creates an instance of JJD.
     *
     * @param ref - The Document instance to wrap.
     * @throws {TypeError} If `ref` is not a Document.
     * @see {@link JJD.from} to wrap a Document
     */
    constructor(ref: T) {
        if (!isInstance(ref, Document)) {
            throw typeErr('ref', 'a Document instance', ref, 'Use JJD.from(document) to create an instance.')
        }
        super(ref)
    }
}
