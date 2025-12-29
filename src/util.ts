import { WF } from './WF.js'
import { WE } from './WE.js'
import { isObj, isStr } from 'jty'
import { WN } from './WN.js'

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

export function unwrapNodeStr(item: unknown): Node | string {
    if (isStr(item)) {
        return item
    }
    if (item instanceof Node) {
        return item
    }
    if (item instanceof WN) {
        return item.ref
    }
    throw new TypeError(`Expected a Node or string. Got ${item} (${typeof item})`)
}

export function unwrapNodeStrs(items: unknown[]): (Node | string)[] {
    return items.map(unwrapNodeStr)
}

function unwrap(obj: unknown): Node | HTMLElement | DocumentFragment {
    if (typeof obj === 'string') {
        return document.createTextNode(obj)
    }
    if (!obj || typeof obj !== 'object') {
        throw new TypeError(`Expected an object. Got ${obj} (${typeof obj})`)
    }
    if (obj instanceof Text || obj instanceof HTMLElement || obj instanceof DocumentFragment) {
        return obj
    }
    if (obj instanceof WE) {
        return obj.ref
    }
    if (obj instanceof WF) {
        return obj.ref
    }
    throw new TypeError(`Only Frag or DocumentFragment can be unwrapped. Got ${obj} (${typeof obj})`)
}

export function wrap(obj: unknown): WE | WF | Text {
    if (typeof obj === 'string') {
        return document.createTextNode(obj)
    }
    if (!isObj(obj)) {
        throw new TypeError(`Expected an object. Got ${obj} (${typeof obj})`)
    }
    if (obj instanceof HTMLElement) {
        return new WE(obj)
    }
    if (obj instanceof DocumentFragment) {
        return new WF(obj)
    }
    if (obj instanceof WE || obj instanceof WF) {
        return obj
    }
    throw new TypeError(`Only Frag or DocumentFragment can be wrapped. Got ${obj} (${typeof obj})`)
}

export function wrapAll(iterable: Iterable<unknown>): (WE | WF | Text)[] {
    return Array.from(iterable, wrap)
}

export function unwrapAll(iterable: Iterable<unknown>): (Node | HTMLElement | DocumentFragment)[] {
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
