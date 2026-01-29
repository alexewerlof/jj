import { isA, isStr } from 'jty'
import { JJN } from './JJN.js'
import { Wrapped } from './types.js'
import { JJNx } from './JJNx.js'
import { typeErr } from './internal.js'

/**
 * Wraps a Document (which is a descendant of Node).
 *
 * @remarks
 * This class provides a wrapper around the native `Document` interface, inheriting
 * the fluent API capabilities of `JJN`.
 * It also supports querying (`byId`, `find`) and manipulation (`addChild`, `preChild`) methods.
 *
 * To find elements by class name, use: `doc.find('.my-class')`
 *
 * To set the document title, use: `doc.ref.title = 'New Title'`
 *
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
     */
    constructor(ref: T) {
        if (!isA(ref, Document)) {
            throw new TypeError(`JJD expects a Document instance. Got ${ref} (${typeof ref}). `)
        }
        super(ref)
    }

    /**
     * Finds an element by ID within this Document.
     *
     * @example
     * ```ts
     * const el = doc.byId('my-id')  // Returns null if not found
     * const el = doc.byId('my-id', true)  // Throws if not found
     * ```
     *
     * @param id - The ID to search for.
     * @param required - Whether to throw an error if not found. Defaults to false.
     * @returns The wrapped element, or null if not found and required is false.
     * @throws {TypeError} If id is not a string or element not found and required is true.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById | Document.getElementById}
     */
    byId(id: string, required = false): Wrapped | null {
        if (!isStr(id)) {
            throw typeErr('id', 'a string', id)
        }
        const el = this.ref.getElementById(id)
        if (el) {
            return JJN.wrap(el)
        }
        if (required) {
            throw new TypeError(`Element with id "${id}" not found in the document.`)
        }
        return null
    }

    /**
     * Gets the `<head>` element of the document wrapped in a `JJHE` instance.
     *
     * @returns The wrapped head element.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/head | Document.head}
     */
    get head() {
        return JJN.wrap(this.ref.head)
    }

    /**
     * Gets the `<body>` element of the document wrapped in a `JJHE` instance.
     *
     * @returns The wrapped body element.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/body | Document.body}
     */
    get body() {
        return JJN.wrap(this.ref.body)
    }
}
