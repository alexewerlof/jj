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
     * Sets a single data attribute on the element.
     *
     * @example
     * ```ts
     * el.setData('myKey', 'myValue')
     * el.setData('count', 42 as unknown as string)
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @param value - The value to assign.
     * @returns This instance for chaining.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link setDataMulti} for setting multiple data attributes at once.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement/dataset | MathMLElement.dataset}
     */
    setData(name: string, value?: string): this {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }

        this.ref.dataset[name] = value
        return this
    }

    /**
     * Sets multiple data attributes from an object, or no-ops for nullish input.
     *
     * @remarks
     * This helper is useful for optional dataset bags in builder APIs.
     * - `null` or `undefined`: does nothing and returns `this`
     * - plain object: sets each data attribute on the element
     * - anything else: throws `TypeError`
     *
     * @example
     * ```ts
     * el.setDataMulti({ myKey: 'myValue', otherKey: 'otherValue' })
     * el.setDataMulti(null) // no-op
     * ```
     *
     * @param attributes - Data attributes object or nullish to skip.
     * @returns This instance for chaining.
     * @throws {TypeError} If `attributes` is not nullish and not a plain object.
     * @see {@link setData} for setting a single data attribute.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement/dataset | MathMLElement.dataset}
     */
    setDataMulti(attributes?: Record<string, string | undefined> | null): this {
        if (attributes == null) {
            return this
        }
        if (!isPOJO(attributes)) {
            throw typeErr(
                'attributes',
                'a plain object',
                attributes,
                'Pass null/undefined or an object like { userId: "42" }.',
            )
        }

        try {
            for (const [name, value] of Object.entries(attributes)) {
                this.setData(name, value)
            }
        } catch (cause) {
            throw new Error(`Failed to set some data attributes from object: ${JSON.stringify(attributes)}.`, { cause })
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
