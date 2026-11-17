import { isInstance, typeErr } from '../internal.js'
import { nodeWrappers } from './WrapperChain.js'
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
 * @category Wrappers
 * @example
 * ```ts
 * const doc = JJD.from(document)
 * doc.on('DOMContentLoaded', () => console.log('Ready'))
 * doc.setTitle('My Page Title')
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document | Document}
 */
export class JJD<T extends Document = Document> extends JJNx<T> {
    static {
        nodeWrappers.register(Document, JJD)
    }
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

    /**
     * Gets the text content of the whole document.
     *
     * @remarks
     * `Document.textContent` is `null` per the DOM spec, so this reads
     * `documentElement.textContent` instead — the same thing `JJE.getText()` does on
     * the root element, without having to wrap it yourself.
     *
     * @example
     * ```ts
     * const pageText = JJD.from(document).getText()
     * ```
     *
     * @returns The document's text content, or an empty string when it is empty.
     * @see {@link JJE.getText} for an element's text.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    getText(): string {
        return this.ref.documentElement?.textContent ?? ''
    }

    /**
     * Gets the document title.
     *
     * @example
     * ```ts
     * const title = JJD.from(document).getTitle()
     * ```
     *
     * @returns The title string, or an empty string when the document has no title.
     * @see {@link setTitle} for writing the title.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/title | Document.title}
     */
    getTitle(): string {
        return this.ref.title
    }

    /**
     * Sets the document title.
     *
     * @example
     * ```ts
     * JJD.from(document).setTitle('Checkout — My Shop')
     * ```
     *
     * @param title - The new title. Coerced to a string by the DOM.
     * @returns This instance for chaining.
     * @see {@link getTitle} for reading the title.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/title | Document.title}
     */
    setTitle(title: string): this {
        this.ref.title = title
        return this
    }
}
