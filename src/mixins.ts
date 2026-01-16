import { isA, isObj, isStr } from 'jty'
import { JJHE } from './JJHE.js'
import { JJE } from './JJE.js'
import { JJDF } from './JJDF.js'
import { JJSR } from './JJSR.js'
import { JJT } from './JJT.js'
import { JJN } from './JJN.js'
import { JJD } from './JJD.js'
import { JJSE } from './JJSE.js'
import { Unwrapped, Wrappable, Wrapped } from './types.js'
import { IById } from './mixin-types.js'

export const { wrapAll, unwrapAll } = JJN

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
 * Extracts the underlying native DOM node from a wrapper.
 *
 * @remarks
 * If the input is already a native Node, it is returned as is.
 * If the input is a string, a new Text node is created and returned.
 *
 * @example
 * ```ts
 * const rawElement = JJN.unwrap(myJJHE) // Returns HTMLElement
 * ```
 *
 * @param obj - The object to unwrap.
 * @returns The underlying DOM node.
 * @throws {TypeError} If the input cannot be unwrapped.
 */
export function unwrap(obj: Wrappable): Unwrapped {
    if (isStr(obj)) {
        return document.createTextNode(obj)
    }
    if (!isObj(obj)) {
        throw new TypeError(`Expected an object. Got ${obj} (${typeof obj})`)
    }
    if (isA(obj, Node)) {
        return obj
    }
    if (isA(obj, JJN)) {
        return obj.ref
    }
    throw new TypeError(`Could not unwrap ${obj} (${typeof obj})`)
}

/**
 * Finds an element by ID in the document.
 *
 * @param id - The ID to search for.
 * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
 * @returns The wrapped element, or null if not found and throwIfNotFound is false.
 * @throws {TypeError} If the element is not found and throwIfNotFound is true.
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
 * @param selector - The CSS selector.
 * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
 * @returns The wrapped element, or null.
 * @throws {TypeError} If not found and throwIfNotFound is true.
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
 * @param selector - The CSS selector.
 * @returns An array of wrapped elements.
 */
export function queryAll(selector: string): Wrapped[] {
    return wrapAll(document.querySelectorAll(selector))
}

const DDF: IById = {
    /**
     * Finds an element by ID within this Document or DocumentFragment.
     *
     * @param this - The JJD or JJDF instance.
     * @param id - The ID to search for.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null if not found and throwIfNotFound is false.
     */
    byId(this: JJD | JJDF, id: string, throwIfNotFound = true): Wrapped | null {
        const el = this.ref.getElementById(id)
        if (el) {
            return wrap(el)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Element with id ${id} not found`)
        }
        return null
    },
}

const EDDF = {
    /**
     * Finds the first element matching a selector within this element's context.
     *
     * @param this - The JJE, JJD or JJDF instance.
     * @param selector - The CSS selector.
     * @param throwIfNotFound - Whether to throw an error if not found. Defaults to true.
     * @returns The wrapped element, or null.
     * @throws {TypeError} If context is invalid or element not found (when requested).
     */
    query(this: JJE | JJD | JJDF, selector: string, throwIfNotFound = true): Wrapped | null {
        const queryResult = this.ref.querySelector(selector)
        if (queryResult) {
            return wrap(queryResult)
        }
        if (throwIfNotFound) {
            throw new TypeError(`Element with selector ${selector} not found`)
        }
        return null
    },

    /**
     * Finds all elements matching a selector within this element's context.
     *
     * @param this - The JJE, JJD or JJDF instance.
     * @param selector - The CSS selector.
     * @returns An array of wrapped elements.
     */
    queryAll(this: JJE | JJD | JJDF, selector: string): Wrapped[] {
        return wrapAll(this.ref.querySelectorAll(selector))
    },

    /**
     * Appends children to this node using native append.
     *
     * @param this - The JJE, JJD or JJDF instance.
     * @param children - The children to append.
     * @returns This instance for chaining.
     */
    append<T extends JJE | JJD | JJDF>(this: T, ...children: Wrappable[]): T {
        const nodes = unwrapAll(children)
        this.ref.append(...nodes)
        return this
    },

    /**
     * Prepends children to this node using native prepend.
     *
     * @param this - The JJE, JJD or JJDF instance.
     * @param children - The children to prepend.
     * @returns This instance for chaining.
     */
    prepend<T extends JJE | JJD | JJDF>(this: T, ...children: Wrappable[]): T {
        const nodes = unwrapAll(children)
        this.ref.prepend(...nodes)
        return this
    },

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
    replaceChildren<T extends JJE | JJD | JJDF>(this: T, ...children: Wrappable[]): T {
        const nodes = unwrapAll(children)
        this.ref.replaceChildren(...nodes)
        return this
    },

    /**
     * Removes all children from this node.
     *
     * @returns This instance for chaining.
     */
    empty<T extends JJE | JJD | JJDF>(this: T): T {
        this.replaceChildren()
        return this
    },
}

function assignPrototype(Class: any, ...mixins: any[]) {
    for (const mixin of mixins) {
        Object.assign(Class.prototype, mixin)
    }
}

JJN.wrap = wrap
JJN.unwrap = unwrap

assignPrototype(JJE, EDDF)
assignPrototype(JJD, DDF, EDDF)
assignPrototype(JJDF, DDF, EDDF)
