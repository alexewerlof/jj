import { isA } from 'jty'
import { JJN } from './JJN.js'
import { IAppendPrepend, IById, IQuery } from './mixin-types.js'

export interface JJD<T extends Document> extends IById, IQuery, IAppendPrepend {}

/**
 * Wraps a Document (which is a descendant of Node).
 *
 * @remarks
 * This class provides a wrapper around the native `Document` interface, inheriting
 * the fluent API capabilities of `JJN`.
 * It also supports querying (`byId`, `query`) and manipulation (`append`, `prepend`) methods.
 *
 * @example
 * ```ts
 * const doc = JJD.from(document)
 * doc.on('DOMContentLoaded', () => console.log('Ready'))
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document | Document}
 */
export class JJD<T extends Document = Document> extends JJN<T> {
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
            throw new TypeError(`Expected a Document. Got ${ref} (${typeof ref})`)
        }
        super(ref)
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

    /**
     * Sets the document title.
     *
     * @example
     * ```ts
     * JJD.from(document).setTitle('New Page Title')
     * ```
     *
     * @param title - The new title string.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/title | Document.title}
     */
    setTitle(title: string): this {
        this.ref.title = title
        return this
    }

    /**
     * Gets the document title.
     *
     * @returns The current title of the document.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/title | Document.title}
     */
    getTitle(): string {
        return this.ref.title
    }
}
