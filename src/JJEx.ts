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
     * Sets a data attribute on the HTMLElement.
     *
     * @example
     * ```ts
     * el.setData('my-key', 'my-value')
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @param value - The value to set.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    setData(name: string, value: string): this {
        this.ref.dataset[name] = value
        return this
    }

    /**
     * Sets multiple data attributes on the HTMLElement from an object.
     *
     * @example
     * ```ts
     * el.setDataObj({
     *   'my-key': 'my-value',
     *   'other-key': 'other-value'
     * })
     * ```
     *
     * @param obj - An object where keys are data attribute names (in camelCase) and values are the values to set.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    setDataObj(obj: Record<string, string>): this {
        for (const [name, value] of Object.entries(obj)) {
            this.setData(name, value)
        }
        return this
    }

    /**
     * Removes a data attribute from the HTMLElement.
     *
     * @example
     * ```ts
     * el.rmData('my-key')
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    rmData(name: string): this {
        delete this.ref.dataset[name]
        return this
    }
}
