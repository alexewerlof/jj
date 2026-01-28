import { hasProp, isObj, isStr } from 'jty'
import { JJE } from './JJE.js'
import { typeErr } from './internal.js'

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
     * @throws {TypeError} If `name` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    getData(name: string): string | undefined {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }
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
     * @throws {TypeError} If `name` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    hasData(name: string): boolean {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }
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
     * @throws {TypeError} If arguments are invalid types or values are not strings.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     */
    setData(name: string, value: string): this
    setData(obj: Record<string, string>): this
    setData(nameOrObj: string | Record<string, string>, value?: string): this {
        if (typeof nameOrObj === 'string') {
            if (!isStr(value)) {
                throw typeErr('value', 'a string', value)
            }
            this.ref.dataset[nameOrObj] = value
        } else if (isObj(nameOrObj)) {
            for (const [k, v] of Object.entries(nameOrObj)) {
                if (!isStr(v)) {
                    throw typeErr(`data['${k}']`, 'a string', v)
                }
                this.ref.dataset[k] = v
            }
        } else {
            throw typeErr('nameOrObj', 'a string or object', nameOrObj)
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
     * @throws {TypeError} If any name is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
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
