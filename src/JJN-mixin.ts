import { isA, isObj, isStr } from 'jty'
import { JJHE } from './JJHE.js'
import { JJE } from './JJE.js'
import { JJDF } from './JJDF.js'
import { JJSR } from './JJSR.js'
import { JJT } from './JJT.js'
import { JJN } from './JJN.js'
import { JJD } from './JJD.js'
import { JJSE } from './JJSE.js'

export type Wrappable = JJN | Node | string
export type Wrapped = JJN | JJE | JJHE | JJSE | JJD | JJDF | JJSR | JJT
export type Unwrapped = HTMLElement | Element | ShadowRoot | DocumentFragment | Text | Node

/**
 * @returns the most granular Wrapped subclass.
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
    if (isA(raw, Element)) {
        return JJE.from(raw)
    }
    if (isA(raw, ShadowRoot)) {
        return JJSR.from(raw)
    }
    if (isA(raw, DocumentFragment)) {
        return JJDF.from(raw)
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
 * @returns the underlying DOM node.
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
