import { isA } from 'jty'
import { JJN } from './JJN.js'
import { Wrappable, Wrapped } from './types.js'

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
     * Finds an element by ID within this Document.
     *
     * @example
     * ```ts
     * const el = byId('my-id')
     * ```
     *
     * @param id - The ID to search for.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null if not found and throwIfNotFound is false.
     * @throws {TypeError} If the element is not found and throwIfNotFound is true.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById | Document.getElementById}
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
     * Finds elements by class name in the Document.
     *
     * @example
     * ```ts
     * const items = byClass('list-item')
     * ```
     *
     * @param className - The class name to search for.
     * @returns An array of wrapped elements.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName | Document.getElementsByClassName}
     */
    byClass(className: string): Wrapped[] {
        return JJN.wrapAll(this.ref.getElementsByClassName(className))
    }

    /**
     * Finds the first element matching a selector in the document.
     *
     * @example
     * ```ts
     * const btn = doc.query('.submit-btn')
     * ```
     *
     * @param selector - The CSS selector.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null.
     * @throws {TypeError} If not found and throwIfNotFound is true.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector | Document.querySelector}
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
     * Finds all elements matching a selector within this Document.
     *
     * @example
     * ```ts
     * const items = doc.queryAll('li')
     * ```
     *
     * @param selector - The CSS selector.
     * @returns An array of wrapped elements.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll | Document.querySelectorAll}
     */
    queryAll(selector: string): Wrapped[] {
        return JJN.wrapAll(this.ref.querySelectorAll(selector))
    }

    /**
     * Appends children to this Document.
     *
     * @example
     * ```ts
     * doc.append(h('span', null, 'hello'))
     * ```
     *
     * @remarks
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @param children - The children to append.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/append | Document.append}
     */
    append(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(JJN.isWrapable))
        this.ref.append(...nodes)
        return this
    }

    /**
     * Prepends children to this Document.
     *
     * @example
     * ```ts
     * doc.prepend(h('span', null, 'first'))
     * ```
     *
     * @remarks
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @param children - The children to prepend.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/prepend | Document.prepend}
     */
    prepend(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(JJN.isWrapable))
        this.ref.prepend(...nodes)
        return this
    }

    /**
     * Replaces the existing children of a Document with a specified new set of children.
     *
     * @remarks
     * If no children are provided, it empties the Document.
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @example
     * ```ts
     * doc.setChildren(h('p', null, 'New Content'))
     * ```
     * @param children - The children to replace with.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/replaceChildren | Document.replaceChildren}
     */
    setChildren(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(JJN.isWrapable))
        this.ref.replaceChildren(...nodes)
        return this
    }

    /**
     * Removes all children from this Document.
     *
     * @example
     * ```ts
     * doc.empty()
     * ```
     *
     * @returns This instance for chaining.
     */
    empty(): this {
        this.setChildren()
        return this
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
