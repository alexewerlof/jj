import { JJN } from './JJN.js'
import { Wrappable, Wrapped } from './types.js'

export abstract class JJNx<T extends Element | Document | DocumentFragment> extends JJN<T> {
    /**
     * Finds the first element matching a selector within this Element.
     *
     * @example
     * ```ts
     * const span = el.query('span')  // Returns null if not found
     * const span = el.query('span', true)  // Throws if not found
     * ```
     *
     * @param selector - The CSS selector.
     * @param required - Whether to throw an error if not found. Defaults to false.
     * @returns The wrapped element, or null if not found and required is false.
     * @throws {TypeError} If selector is not a string or element not found and required is true.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector | Element.querySelector}
     */
    query(selector: string, required = false): Wrapped | null {
        const queryResult = this.ref.querySelector(selector)
        if (queryResult) {
            return JJN.wrap(queryResult)
        }
        if (required) {
            throw new TypeError(
                `Element with selector "${selector}" not found. ` +
                    `Did you mean to call .query("${selector}", false) to return null instead? `,
            )
        }
        return null
    }

    /**
     * Finds all elements matching a selector within this Element.
     *
     * @example
     * ```ts
     * const items = el.queryAll('li')
     * ```
     *
     * @param selector - The CSS selector.
     * @returns An array of wrapped elements.
     * @throws {TypeError} If selector is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll | Element.querySelectorAll}
     */
    queryAll(selector: string): Wrapped[] {
        return JJN.wrapAll(this.ref.querySelectorAll(selector))
    }

    /**
     * Appends children to this Element.
     *
     * @example
     * ```ts
     * el.append(h('span', null, 'hello'))
     * ```
     *
     * @remarks
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @param children - The children to append.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/append | Element.append}
     */
    append(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(JJN.isWrapable))
        this.ref.append(...nodes)
        return this
    }

    /**
     * Prepends children to this Element.
     *
     * @example
     * ```ts
     * el.prepend(h('span', null, 'first'))
     * ```
     *
     * @remarks
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @param children - The children to prepend.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend | Element.prepend}
     */
    prepend(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(JJN.isWrapable))
        this.ref.prepend(...nodes)
        return this
    }

    /**
     * Maps an array to children and appends them.
     *
     * @example
     * ```ts
     * node.mapAppend(['a', 'b'], item => h('li', null, item))
     * ```
     *
     * @remarks
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @param array - The source array.
     * @param mapFn - The mapping function returning a Wrappable.
     * @returns This instance for chaining.
     */
    mapAppend(array: Wrappable[], mapFn: (item: Wrappable) => Wrappable) {
        return this.append(...array.map(mapFn))
    }

    /**
     * Maps an array to children and prepends them.
     *
     * @example
     * ```ts
     * node.mapPrepend(['a', 'b'], item => JJHE.fromTag('li').setText(item))
     * ```
     *
     * @remarks
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @param array - The source array.
     * @param mapFn - The mapping function.
     * @returns This instance for chaining.
     */
    mapPrepend(array: Wrappable[], mapFn: (item: Wrappable) => Wrappable) {
        return this.prepend(...array.map(mapFn))
    }

    /**
     * Replaces the existing children of an Element with a specified new set of children.
     *
     * @remarks
     * If no children are provided, it empties the Element.
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @example
     * ```ts
     * el.setChildren(h('p', null, 'New Content'))
     * ```
     * @param children - The children to replace with.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.replaceChildren}
     */
    setChildren(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(JJN.isWrapable))
        this.ref.replaceChildren(...nodes)
        return this
    }

    /**
     * Removes all children from this Element.
     *
     * @example
     * ```ts
     * el.empty()
     * ```
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.setChildren}
     */
    empty(): this {
        this.setChildren()
        return this
    }
}
