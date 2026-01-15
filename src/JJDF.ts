import { isA } from 'jty'
import { JJN } from './JJN.js'
import { IAppendPrepend, IById, IQuery } from './mixin-types.js'

export interface JJDF<T extends DocumentFragment> extends IById, IQuery, IAppendPrepend {}

/**
 * Wraps a DocumentFragment (which is a descendant of Node).
 *
 * @remarks
 * DocumentFragments are lightweight versions of Document that store a segment of a document structure
 * comprised of nodes just like a standard document. The key difference is that because the document fragment
 * isn't part of the active document tree structure, changes made to the fragment don't affect the document,
 * cause reflow, or incur any performance impact that can occur when changes are made.
 *
 * @example
 * ```ts
 * const frag = JJDF.create()
 * frag.append(
 *   h('div', null, 'Item 1'),
 *   h('div', null, 'Item 2'),
 * )
 * document.body.appendChild(frag.ref)
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment | DocumentFragment}
 */
export class JJDF<T extends DocumentFragment = DocumentFragment> extends JJN<T> {
    /**
     * Creates a JJDF instance from a DocumentFragment reference.
     *
     * @param ref - The DocumentFragment instance.
     * @returns A new JJDF instance.
     */
    static from(ref: DocumentFragment): JJDF {
        return new JJDF(ref)
    }

    /**
     * Creates a new empty JJDF instance (wraps a new DocumentFragment).
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
     */
    constructor(ref: T) {
        if (!isA(ref, DocumentFragment)) {
            throw new TypeError(`Expected a DocumentFragment. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }
}
