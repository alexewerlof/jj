import { isA, isObj, isStr } from 'jty'
import { WHE } from './WHE.js'
import { WE } from './WE.js'
import { WDF } from './WDF.js'
import { WS } from './WS.js'
import { WT } from './WT.js'
import { WN } from './WN.js'

export type Wrappable = WN | Node | string
export type Wrapped = WHE | WE | WDF | WS | WDF | WT | WN
export type Unwrapped = HTMLElement | Element | ShadowRoot | DocumentFragment | Text | Node

/**
 * @returns the most granual Wrapped subclass.
 */
WN.wrap = (raw: Wrappable): Wrapped => {
    if (isStr(raw)) {
        return WT.from(document.createTextNode(raw))
    }
    if (!isObj(raw)) {
        throw new TypeError(`Expected an object to wrap. Got ${raw} (${typeof raw})`)
    }
    if (isA(raw, WN)) {
        return raw
    }
    if (isA(raw, HTMLElement)) {
        return WHE.from(raw)
    }
    if (isA(raw, Element)) {
        return WE.from(raw)
    }
    if (isA(raw, ShadowRoot)) {
        return WS.from(raw)
    }
    if (isA(raw, DocumentFragment)) {
        return WDF.from(raw)
    }
    if (isA(raw, Text)) {
        return WT.from(raw)
    }
    if (isA(raw, Node)) {
        return WN.from(raw)
    }
    throw new TypeError(`Only Frag or DocumentFragment can be wrapped. Got ${raw} (${typeof raw})`)
}

/**
 * @returns the original DOM node wrapped in the appropriate class
 */
WN.unwrap = (obj: Wrappable): Unwrapped => {
    if (isStr(obj)) {
        return document.createTextNode(obj)
    }
    if (!isObj(obj)) {
        throw new TypeError(`Expected an object. Got ${obj} (${typeof obj})`)
    }
    if (isA(obj, Node)) {
        return obj
    }
    if (isA(obj, WN)) {
        return obj.ref
    }
    throw new TypeError(`Could not unwrap ${obj} (${typeof obj})`)
}
