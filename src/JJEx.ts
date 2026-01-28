import { hasProp } from 'jty'
import { JJE } from './JJE.js'

export abstract class JJEx<T extends HTMLElement | SVGElement> extends JJE<T> {
    /**
     * Gets a data attribute from the HTMLElement.
     *
     * @example
     * ```ts
     * const value = el.getData('my-key')
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @returns The value of the attribute, or undefined if not set.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    getData(name: string): string | undefined {
        return this.ref.dataset[name]
    }

    /**
     * Checks if a data attribute exists on the HTMLElement.
     *
     * @example
     * ```ts
     * if (el.hasData('my-key')) {
     *   // ...
     * }
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @returns True if the attribute exists, false otherwise.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    hasData(name: string): boolean {
        return hasProp(this.ref.dataset, name)
    }

    /**
     * Sets one or more data attributes on the HTMLElement.
     *
     * @example
     * ```ts
     * el.setData('myKey', 'myValue')  // Single
     * el.setData({ myKey: 'myValue', otherKey: 'otherValue' })  // Multiple
     * ```
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    setData(name: string, value: string): this
    setData(obj: Record<string, string>): this
    setData(nameOrObj: string | Record<string, string>, value?: string): this {
        if (typeof nameOrObj === 'string') {
            this.ref.dataset[nameOrObj] = value!
        } else {
            for (const [k, v] of Object.entries(nameOrObj)) {
                this.ref.dataset[k] = v
            }
        }
        return this
    }

    /**
     * Removes one or more data attributes from the HTMLElement.
     *
     * @example
     * ```ts
     * el.rmData('myKey')  // Remove single
     * el.rmData('myKey', 'otherKey')  // Remove multiple
     * ```
     *
     * @param names - The data attribute name(s) (in camelCase).
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    rmData(...names: string[]): this {
        for (const name of names) {
            delete this.ref.dataset[name]
        }
        return this
    }
}
