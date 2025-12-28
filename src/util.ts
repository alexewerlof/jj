import { Wfrag } from './Wfrag.js'
import { Welem } from './Welem.js'
import { isStr } from 'jty'
import { Wnode } from './Wnode.js'

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
    if (item instanceof Wnode) {
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
    if (obj instanceof Welem) {
        return obj.ref
    }
    if (obj instanceof Wfrag) {
        return obj.ref
    }
    throw new TypeError(`Only Frag or DocumentFragment can be unwrapped. Got ${obj} (${typeof obj})`)
}

export function wrap(obj: unknown): Welem | Wfrag | Text {
    if (typeof obj === 'string') {
        return document.createTextNode(obj)
    }
    if (!obj || typeof obj !== 'object') {
        throw new TypeError(`Expected an object. Got ${obj} (${typeof obj})`)
    }
    if (obj instanceof HTMLElement) {
        return new Welem(obj)
    }
    if (obj instanceof DocumentFragment) {
        return new Wfrag(obj)
    }
    if (obj instanceof Welem || obj instanceof Wfrag) {
        return obj
    }
    throw new TypeError(`Only Frag or DocumentFragment can be wrapped. Got ${obj} (${typeof obj})`)
}

export function wrapAll(iterable: Iterable<unknown>): (Welem | Wfrag | Text)[] {
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
