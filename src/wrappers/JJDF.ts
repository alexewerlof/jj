import { isInstance } from 'jty'
import { typeErr } from '../internal.js'
import { JJNx } from './JJNx.js'

/**
 * Wraps a DocumentFragment (which is a descendant of Node).
 *
 * @remarks
 * DocumentFragments are lightweight versions of Document that store a segment of a document structure
 * comprised of nodes just like a standard document. The key difference is that because the document fragment
 * isn't part of the active document tree structure, changes made to the fragment don't affect the document,
 * cause reflow, or incur any performance impact that can occur when changes are made.
 *
 * @category Wrappers
 * @example
 * ```ts
 * const doc = JJD.from(document)
 * const frag = JJDF.create()
 * frag.addChild(
 *   JJHE.tree('div', null, 'Item 1'),
 *   JJHE.tree('div', null, 'Item 2'),
 * )
 * doc.find('body', true).addChild(frag)
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment | DocumentFragment}
 */
export class JJDF<T extends DocumentFragment = DocumentFragment> extends JJNx<T> {
    /**
     * Creates a JJDF instance from a DocumentFragment reference.
     *
     * @remarks
     * Use {@link JJDF.create} to create a new empty DocumentFragment.
     * For other Node types, use {@link JJN.from} or the specific wrapper type.
     *
     * @example
     * ```ts
     * const frag = JJDF.from(myFrag)
     * ```
     *
     * @param ref - The DocumentFragment instance.
     * @returns A new JJDF instance.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment | DocumentFragment}
     */
    static from(ref: DocumentFragment): JJDF {
        return new JJDF(ref)
    }

    /**
     * Creates a new empty JJDF instance (wraps a new DocumentFragment).
     *
     * @remarks
     * To wrap an existing DocumentFragment, use {@link JJDF.from}.
     *
     * @example
     * ```ts
     * const frag = JJDF.create()
     * ```
     *
     * @returns A new JJDF instance.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment | document.createDocumentFragment}
     */
    static create(): JJDF<DocumentFragment> {
        return new JJDF(document.createDocumentFragment())
    }

    /**
     * Creates an instance of JJDF.
     *
     * @param ref - The DocumentFragment instance to wrap.
     * @throws {TypeError} If `ref` is not a DocumentFragment.
     * @see {@link JJDF.from} to wrap an existing fragment.
     * @see {@link JJDF.create} to create a new empty fragment.
     */
    constructor(ref: T) {
        if (!isInstance(ref, DocumentFragment)) {
            throw typeErr('ref', 'a DocumentFragment', ref, 'Use JJDF.from(documentFragment) to create an instance.')
        }
        super(ref)
    }
}
