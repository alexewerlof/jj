import { Wrappable, Wrapped } from './types.js'

export interface IById {
    /**
     * Finds an element by ID within this context.
     *
     * @param id - The ID to search for.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null if not found and throwIfNotFound is false.
     */
    byId(id: string, throwIfNotFound?: boolean): Wrapped | null
}

export interface IAppendPrepend {
    /**
     * Appends children to this node.
     *
     * @param children - The children to append (Nodes, strings, or Wrappers).
     * @returns This instance for chaining.
     */
    append(...children: Wrappable[]): this

    /**
     * Prepends children to this node.
     *
     * @param children - The children to prepend.
     * @returns This instance for chaining.
     */
    prepend(...children: Wrappable[]): this

    /**
     * Replaces the existing children of a node with a specified new set of children.
     *
     * @remarks
     * If no children are provided, it'll empty this
     *
     * @param this - The JJE, JJD or JJDF instance.
     * @param children - The children to replace with.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.replaceChildren}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/replaceChildren | Document.replaceChildren}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment/replaceChildren | DocumentFragment.replaceChildren}
     */
    replaceChildren(...children: Wrappable[]): this

    /**
     * Removes all children
     * @returns This instance for chaining.
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
     */
    query(selector: string, throwIfNotFound?: boolean): Wrapped | null

    /**
     * Finds all elements matching a selector within this context.
     *
     * @param selector - The CSS selector.
     * @returns An array of wrapped elements.
     */
    queryAll(selector: string): Wrapped[]
}
