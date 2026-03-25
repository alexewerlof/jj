import { hasProp, isPOJO, isStr } from 'jty'
import { typeErr } from '../internal.js'
import { JJE } from './JJE.js'

/**
 * Base wrapper for elements that support `dataset`.
 *
 * @remarks
 * This includes `HTMLElement`, `SVGElement`, and `MathMLElement`.
 */
export abstract class JJEx<T extends HTMLElement | SVGElement | MathMLElement> extends JJE<T> {
    /**
     * Gets a data attribute from the element.
     *
     * @example
     * ```ts
     * const value = el.getData('my-key')
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @returns The value of the attribute, or undefined if not set.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement/dataset | MathMLElement.dataset}
     */
    getData(name: string): string | undefined {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }
        return this.ref.dataset[name]
    }

    /**
     * Checks if a data attribute exists on the element.
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
     * @throws {TypeError} If `name` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement/dataset | MathMLElement.dataset}
     */
    hasData(name: string): boolean {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }
        return hasProp(this.ref.dataset, name)
    }

    /**
     * Sets one or more data attributes on the element.
     *
     * @example
     * ```ts
     * el.setData('myKey', 'myValue')  // Single
     * el.setData({ myKey: 'myValue', otherKey: 'otherValue' })  // Multiple
     * el.setData('count', 42)  // Numbers are automatically converted to strings
     * ```
     *
     * @throws {TypeError} If arguments are invalid types.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement/dataset | MathMLElement.dataset}
     */
    setData(name: string, value?: string): this
    setData(obj: Record<string, string | undefined>): this
    setData(nameOrObj: string | Record<string, string | undefined>, value?: string): this {
        if (isStr(nameOrObj)) {
            this.ref.dataset[nameOrObj] = value
        } else if (isPOJO(nameOrObj)) {
            for (const [k, v] of Object.entries(nameOrObj)) {
                this.ref.dataset[k] = v
            }
        } else {
            throw typeErr(
                'nameOrObj',
                'a string or object',
                nameOrObj,
                'Pass a single data key or an object like { userId: "42" }.',
            )
        }
        return this
    }

    /**
     * Removes one or more data attributes from the element.
     *
     * @example
     * ```ts
     * el.rmData('myKey')  // Remove single
     * el.rmData('myKey', 'otherKey')  // Remove multiple
     * ```
     *
     * @param names - The data attribute name(s) (in camelCase).
     * @returns This instance for chaining.
     * @throws {TypeError} If any name is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement/dataset | MathMLElement.dataset}
     */
    rmData(...names: string[]): this {
        for (const name of names) {
            if (!isStr(name)) {
                throw typeErr('name', 'a string', name)
            }
            delete this.ref.dataset[name]
        }
        return this
    }
}
