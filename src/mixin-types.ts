import { Wrappable, Wrapped } from './types.js'

export interface IById {
    /**
     * Finds an element by ID within this context.
     *
     * @param id - The ID to search for.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null if not found and throwIfNotFound is false.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector | Element.querySelector}
     */
    byId(id: string, throwIfNotFound?: boolean): Wrapped | null
}

export interface IAppendPrepend {
    /**
     * Appends children to this node.
     *
     * @param children - The children to append (Nodes, strings, or Wrappers).
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/append | Element.append}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/append | Document.append}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/append | DocumentFragment.append}
     */
    append(...children: Wrappable[]): this

    /**
     * Prepends children to this node.
     *
     * @param children - The children to prepend.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend | Element.prepend}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/prepend | Document.prepend}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/prepend | DocumentFragment.prepend}
     */
    prepend(...children: Wrappable[]): this

    /**
     * Replaces the existing children of a node with a specified new set of children.
     *
     * @remarks
     * If no children are provided, it empties the node.
     *
     * @param this - The JJE, JJD or JJDF instance.
     * @param children - The children to replace with.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.replaceChildren}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/replaceChildren | Document.replaceChildren}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/replaceChildren | DocumentFragment.replaceChildren}
     */
    setChildren(...children: Wrappable[]): this

    /**
     * Removes all children.
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.replaceChildren}
     */
    empty(): this
}

export interface IQuery {
    /**
     * Finds the first element matching a selector within this context.
     *
     * @param selector - The CSS selector.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector | Element.querySelector}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector | Document.querySelector}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/querySelector | DocumentFragment.querySelector}
     */
    query(selector: string, throwIfNotFound?: boolean): Wrapped | null

    /**
     * Finds all elements matching a selector within this context.
     *
     * @param selector - The CSS selector.
     * @returns An array of wrapped elements.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll | Element.querySelectorAll}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll | Document.querySelectorAll}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/querySelectorAll | DocumentFragment.querySelectorAll}
     */
    queryAll(selector: string): Wrapped[]
}

export interface IElementData {
    /**
     * Gets a data attribute value.
     *
     * @remarks
     * Accesses the `dataset` property. Keys should be in camelCase.
     *
     * @example
     * ```ts
     * // <div data-user-id="123"></div>
     * div.getData('userId') // '123'
     * ```
     *
     * @param name - The data attribute name (camelCase).
     * @returns The value or undefined.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     */
    getData(name: string): string | undefined

    /**
     * Checks if a data attribute exists.
     *
     * @param name - The data attribute name (camelCase).
     * @returns `true` if it exists.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     */
    hasData(name: string): boolean

    /**
     * Sets a data attribute.
     *
     * @example
     * ```ts
     * div.setData('userId', '123') // sets data-user-id="123"
     * ```
     *
     * @param name - The data attribute name (camelCase).
     * @param value - The value to set.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     */
    setData(name: string, value: string): this

    /**
     * Sets multiple data attributes.
     *
     * @example
     * ```ts
     * div.setDataObj({ userId: '123', role: 'admin' })
     * ```
     *
     * @param obj - An object of data keys and values.
     * @returns This instance for chaining.
     */
    setDataObj(obj: Record<string, string>): this

    /**
     * Removes a data attribute.
     *
     * @param name - The data attribute name (camelCase).
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     */
    rmData(name: string): this
}
