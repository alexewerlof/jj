import { isA } from 'jty'
import { JJN } from './JJN.js'
import { Wrappable, Wrapped } from './types.js'

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
     * const el = frag.byId('header')
     * ```
     *
     * @param id - The ID to search for.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null if not found and throwIfNotFound is false.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/getElementById | DocumentFragment.getElementById}
     */
    byId(id: string, throwIfNotFound = true): Wrapped | null {
        const el = this.ref.getElementById(id)
        if (el) {
            return JJN.wrap(el)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Element with id ${id} not found`)
        }
        return null
    }

    /**
     * Finds the first element matching a selector within this DocumentFragment.
     *
     * @example
     * ```ts
     * const span = frag.query('span')
     * ```
     *
     * @param selector - The CSS selector.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null.
     * @throws {TypeError} If context is invalid or element not found (when requested).
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/querySelector | DocumentFragment.querySelector}
     */
    query(selector: string, throwIfNotFound = true): Wrapped | null {
        const queryResult = this.ref.querySelector(selector)
        if (queryResult) {
            return JJN.wrap(queryResult)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Element with selector ${selector} not found`)
        }
        return null
    }

    /**
     * Finds all elements matching a selector within this DocumentFragment.
     *
     * @example
     * ```ts
     * const items = frag.queryAll('li')
     * ```
     *
     * @param selector - The CSS selector.
     * @returns An array of wrapped elements.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/querySelectorAll | DocumentFragment.querySelectorAll}
     */
    queryAll(selector: string): Wrapped[] {
        return JJN.wrapAll(this.ref.querySelectorAll(selector))
    }

    /**
     * Appends children to this DocumentFragment.
     *
     * @example
     * ```ts
     * frag.append(h('span', null, 'hello'))
     * ```
     *
     * @remarks
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @param children - The children to append.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/append | DocumentFragment.append}
     */
    append(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(JJN.isWrapable))
        this.ref.append(...nodes)
        return this
    }

    /**
     * Prepends children to this DocumentFragment.
     *
     * @example
     * ```ts
     * frag.prepend(h('span', null, 'first'))
     * ```
     *
     * @remarks
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @param children - The children to prepend.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/prepend | DocumentFragment.prepend}
     */
    prepend(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(JJN.isWrapable))
        this.ref.prepend(...nodes)
        return this
    }

    /**
     * Replaces the existing children of a DocumentFragment with a specified new set of children.
     *
     * @remarks
     * If no children are provided, it empties the DocumentFragment.
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @example
     * ```ts
     * frag.setChildren(h('p', null, 'New Content'))
     * ```
     * @param children - The children to replace with.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/replaceChildren | DocumentFragment.replaceChildren}
     */
    setChildren(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(JJN.isWrapable))
        this.ref.replaceChildren(...nodes)
        return this
    }

    /**
     * Removes all children from this DocumentFragment.
     *
     * @example
     * ```ts
     * frag.empty()
     * ```
     *
     * @returns This instance for chaining.
     */
    empty(): this {
        this.setChildren()
        return this
    }
}
