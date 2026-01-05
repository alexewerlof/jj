import { WF } from './WF.js'
import { WE } from './WE.js'
import { isA, isObj, isStr } from 'jty'
import { WN } from './WN.js'
import { WHE } from './WHE.js'
import { WS } from './WS.js'
import { WT } from './WT.js'

/** Used to Give the UI a moment to update */
export function nextAnimationFrame(): Promise<number> {
    return new Promise((resolve) => requestAnimationFrame(resolve))
}

export function on(target: EventTarget, eventName: string, handler: EventListenerOrEventListenerObject): void {
    target.addEventListener(eventName, handler)
}

export function off(target: EventTarget, eventName: string, handler: EventListenerOrEventListenerObject): void {
    target.removeEventListener(eventName, handler)
}

export type Wrappable = WN | Node | string
export type Wrapped = WHE | WE | WF | WF | WS | WT | WN

/**
 * @returns the most granual Wrapped subclass.
 */
export function wrap(raw: Wrappable): Wrapped {
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
        return WF.from(raw)
    }
    if (isA(raw, Text)) {
        return WT.from(raw)
    }
    if (isA(raw, Node)) {
        return WN.from(raw)
    }
    throw new TypeError(`Only Frag or DocumentFragment can be wrapped. Got ${raw} (${typeof raw})`)
}

export function wrapAll(iterable: Iterable<Wrappable>): Wrapped[] {
    return Array.from(iterable, wrap)
}

export type Unwrapped = HTMLElement | Element | ShadowRoot | DocumentFragment | Text | Node

/**
 * @returns the original DOM node wrapped in the appropriate class
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
    if (isA(obj, WN)) {
        return obj.ref
    }
    throw new TypeError(`Could not unwrap ${obj} (${typeof obj})`)
}

/**
 * unwraps an iteratable object (e.g. an array of HTMLCollection)
 */
export function unwrapAll(iterable: Iterable<Wrappable>): Unwrapped[] {
    return Array.from(iterable, unwrap)
}

export async function ensureComponent(
    name: string,
    constructor: CustomElementConstructor,
): Promise<CustomElementConstructor> {
    if (!customElements.get(name)) {
        customElements.define(name, constructor)
        await customElements.whenDefined(name)
        return constructor
    }
    return constructor
}
