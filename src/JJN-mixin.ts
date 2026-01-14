import { isA, isObj, isStr } from 'jty'
import { JJHE } from './JJHE.js'
import { JJE } from './JJE.js'
import { JJDF } from './JJDF.js'
import { JJSR } from './JJSR.js'
import { JJT } from './JJT.js'
import { JJN } from './JJN.js'
import { JJD } from './JJD.js'
import { JJSE } from './JJSE.js'

/**
 * Represents any value that can be wrapped by the library.
 * Can be a native Node, a string (which becomes a Text node), or an existing JJ wrapper.
 */
export type Wrappable = JJN | Node | string

/**
 * Union type of all possible JJ wrapper classes.
 */
export type Wrapped = JJN | JJE | JJHE | JJSE | JJD | JJDF | JJSR | JJT

/**
 * Union type of all native DOM nodes that correspond to JJ wrappers.
 */
export type Unwrapped = HTMLElement | Element | SVGElement | ShadowRoot | Document | DocumentFragment | Text | Node

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
 * @param raw - The object to wrap.
 * @returns The most granular Wrapped subclass instance.
 * @throws {TypeError} If the input is not a Node, string, or JJ wrapper.
 */
JJN.wrap = (raw: Wrappable): Wrapped => {
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
JJN.unwrap = (obj: Wrappable): Unwrapped => {
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
