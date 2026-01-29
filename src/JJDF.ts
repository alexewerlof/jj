import { isA, isStr } from 'jty'
import { JJN } from './JJN.js'
import { Wrapped } from './types.js'
import { JJNx } from './JJNx.js'
import { typeErr } from './internal.js'

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
 * doc.body.append(frag)
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment | DocumentFragment}
 */
export class JJDF<T extends DocumentFragment = DocumentFragment> extends JJNx<T> {
    /**
     * Creates a JJDF instance from a DocumentFragment reference.
     *
     * @example
     * ```ts
     * const frag = JJDF.from(myFrag)
     * ```
     *
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

    /**
     * Finds an element by ID within this DocumentFragment.
     *
     * @example
     * ```ts
     * const el = frag.byId('header')  // Returns null if not found
     * const el = frag.byId('header', true)  // Throws if not found
     * ```
     *
     * @param id - The ID to search for.
     * @param required - Whether to throw an error if not found. Defaults to false.
     * @returns The wrapped element, or null if not found and required is false.
     * @throws {TypeError} If id is not a string or element not found and required is true.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/getElementById | DocumentFragment.getElementById}
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
            throw new TypeError(`Element with id ${id} not found`)
        }
        return null
    }
}
