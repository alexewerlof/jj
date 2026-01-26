import { isA, isObj, isStr } from 'jty'
import { JJHE } from './JJHE.js'
import { JJE } from './JJE.js'
import { JJDF } from './JJDF.js'
import { JJSR } from './JJSR.js'
import { JJT } from './JJT.js'
import { JJN } from './JJN.js'
import { JJD } from './JJD.js'
import { JJSE } from './JJSE.js'
import { Wrappable, Wrapped } from './types.js'

export const { wrapAll, unwrap, unwrapAll, isWrapable } = JJN

/**
 * Wraps a native DOM node or string into the most specific JJ wrapper available.
 *
 * @remarks
 * This function acts as a factory, inspecting the input type and returning the appropriate
 * subclass of `JJN` (e.g., `JJHE` for `HTMLElement`, `JJT` for `Text`).
 *
 * @example
 * ```ts
 * const bodyWrapper = JJN.wrap(document.body) // Returns JJHE
 * const textWrapper = JJN.wrap('Hello') // Returns JJT wrapping a new Text node
 * ```
 *
 * @param raw - The object to wrap. If it's already Wrapped, it'll be returned without any change. We don't double-wrap or clone it.
 * @returns The most granular Wrapped subclass instance. If the input is already wrapped, it'll be returned as is without cloning.
 * @throws {TypeError} If the input is not a Node, string, or JJ wrapper.
 */
export function wrap(raw: Wrappable): Wrapped {
    if (isStr(raw)) {
        return JJT.from(document.createTextNode(raw))
    }
    if (!isObj(raw)) {
        throw new TypeError(`Expected an object to wrap. Got ${raw} (${typeof raw})`)
    }
    if (isA(raw, JJN)) {
        return raw
    }
    if (isA(raw, HTMLElement)) {
        return JJHE.from(raw)
    }
    if (isA(raw, SVGElement)) {
        return JJSE.from(raw)
    }
    if (isA(raw, Element)) {
        return JJE.from(raw)
    }
    if (isA(raw, ShadowRoot)) {
        return JJSR.from(raw)
    }
    if (isA(raw, DocumentFragment)) {
        return JJDF.from(raw)
    }
    if (isA(raw, Document)) {
        return JJD.from(raw)
    }
    if (isA(raw, Text)) {
        return JJT.from(raw)
    }
    if (isA(raw, Node)) {
        return JJN.from(raw)
    }
    throw new TypeError(`Expected a Node to wrap. Got ${raw} (${typeof raw})`)
}

/**
 * Finds an element by ID in the document.
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
export function byId(id: string, throwIfNotFound = true): Wrapped | null {
    const el = document.getElementById(id)
    if (el) {
        return wrap(el)
    }
    if (throwIfNotFound) {
        throw new TypeError(`Found no element with id ${id} in the document.`)
    }
    return null
}

/**
 * Finds elements by class name in the document.
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
export function byClass(className: string): Wrapped[] {
    return wrapAll(document.getElementsByClassName(className))
}

/**
 * Finds the first element matching a selector in the document.
 *
 * @example
 * ```ts
 * const btn = query('.submit-btn')
 * ```
 *
 * @param selector - The CSS selector.
 * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
 * @returns The wrapped element, or null.
 * @throws {TypeError} If not found and throwIfNotFound is true.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector | Document.querySelector}
 */
export function query(selector: string, throwIfNotFound = true): Wrapped | null {
    const queryResult = document.querySelector(selector)
    if (queryResult) {
        return wrap(queryResult)
    }
    if (throwIfNotFound) {
        throw new TypeError(`Element with selector ${selector} not found`)
    }
    return null
}

/**
 * Finds all elements matching a selector in the document.
 *
 * @example
 * ```ts
 * const inputs = queryAll('input[type="text"]')
 * ```
 *
 * @param selector - The CSS selector.
 * @returns An array of wrapped elements.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll | Document.querySelectorAll}
 */
export function queryAll(selector: string): Wrapped[] {
    return wrapAll(document.querySelectorAll(selector))
}

JJN.wrap = wrap
