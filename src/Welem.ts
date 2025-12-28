import { Wfrag } from './Wfrag.js'
import { Wnode } from './Wnode.js'
import { off, on, unwrapAll, unwrapNodeStrs, wrap, wrapAll } from './util.js'

/**
 * Represents a wrapped Element
 */
export class Welem extends Wnode {
    constructor(ref: Element) {
        if (!(ref instanceof Element)) {
            throw new TypeError(`Expected a Element. Got: ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    static from(Element: Element): Welem {
        return new Welem(Element)
    }

    static fromIter(iterable: Iterable<Element>): Welem[] {
        return Array.from(iterable, Welem.from)
    }

    static fromTag(tagName: string): Welem {
        return new Welem(document.createElement(tagName))
    }

    static byId(id: string): Welem | Wfrag | Text {
        const el = document.getElementById(id)
        if (!el) throw new TypeError(`Element with id ${id} not found`)
        return wrap(el)
    }

    static byClass(className: string): (Welem | Wfrag | Text)[] {
        return wrapAll(document.getElementsByClassName(className))
    }

    static query(selector: string): Welem | Wfrag | Text {
        return wrap(document.querySelector(selector))
    }

    static queryAll(selector: string): (Welem | Wfrag | Text)[] {
        return wrapAll(document.querySelectorAll(selector))
    }

    get ref(): Element {
        return super.ref as Element
    }

    set ref(value: Element) {
        if (!(value instanceof Element)) {
            throw new TypeError(`Expected a Element. Got: ${value} (${typeof value})`)
        }
        super.ref = value
    }

    byClass(className: string): (Welem | Wfrag | Text)[] {
        return wrapAll(this.ref.getElementsByClassName(className))
    }

    query(selector: string): Welem | Wfrag | Text {
        return wrap(this.ref.querySelector(selector))
    }

    queryAll(selector: string): (Welem | Wfrag | Text)[] {
        return wrapAll(this.ref.querySelectorAll(selector))
    }

    clone(deep?: boolean): Welem {
        return new Welem(this.ref.cloneNode(deep) as Element)
    }

    getAria(name: string): string | null {
        return this.ref.getAttribute(`aria-${name}`)
    }

    setAria(name: string, value: string): this {
        this.ref.setAttribute(`aria-${name}`, value)
        return this
    }

    setAriaObj(obj: Record<string, string>): this {
        for (const [name, value] of Object.entries(obj)) {
            this.setAria(name, value)
        }
        return this
    }

    rmAria(name: string): this {
        this.ref.removeAttribute(`aria-${name}`)
        return this
    }

    getAttr(name: string): string | null {
        return this.ref.getAttribute(name)
    }

    setAttr(name: string, value: string): this {
        this.ref.setAttribute(name, value)
        return this
    }

    setAttrObj(obj: Record<string, string>): this {
        for (const [name, value] of Object.entries(obj)) {
            this.setAttr(name, value)
        }
        return this
    }

    rmAttrs(...names: string[]): this {
        for (const name of names) {
            this.ref.removeAttribute(name)
        }
        return this
    }

    addClass(...classNames: string[]): this {
        this.ref.classList.add(...classNames)
        return this
    }

    rmClass(...classNames: string[]): this {
        this.ref.classList.remove(...classNames)
        return this
    }

    on(eventName: string, handler: EventListenerOrEventListenerObject): this {
        on(this.ref, eventName, handler)
        return this
    }

    onClick(handler: EventListenerOrEventListenerObject): this {
        return this.on('click', handler)
    }

    off(eventName: string, handler: EventListenerOrEventListenerObject): this {
        off(this.ref, eventName, handler)
        return this
    }

    hide(): this {
        return this.setAttr('hidden', '').setAttr('aria-hidden', 'true')
    }

    show(): this {
        return this.rmAttrs('hidden', 'aria-hidden')
    }

    disable(): this {
        return this.setAttr('disabled', '').setAttr('aria-disabled', 'true')
    }

    enable(): this {
        return this.rmAttrs('disabled', 'aria-disabled')
    }

    rm(): this {
        this.ref.remove()
        return this
    }

    append(...children: unknown[]): this {
        this.ref.append(...unwrapNodeStrs(children))
        return this
    }

    mapAppend<T>(array: T[], mapFn: (item: T) => unknown): this {
        return this.append(...array.map(mapFn))
    }

    prepend(...children: unknown[]): this {
        this.ref.prepend(...unwrapNodeStrs(children))
        return this
    }

    mapPrepend<T>(array: T[], mapFn: (item: T) => unknown): this {
        return this.prepend(...array.map(mapFn))
    }

    getTitle(): string | null {
        return this.getAttr('title')
    }

    setTitle(title: string): this {
        return this.setAttr('title', title)
    }

    getHtml(): string {
        return this.ref.innerHTML
    }

    setHtml(html: string): this {
        this.ref.innerHTML = html
        return this
    }

    setShadow(mode: ShadowRootMode = 'open', html?: string, ...styleSheets: CSSStyleSheet[]): this {
        const shadowRoot = this.ref.shadowRoot ?? this.ref.attachShadow({ mode })
        if (html) {
            shadowRoot.innerHTML = html
        }
        if (styleSheets.length) {
            shadowRoot.adoptedStyleSheets.push(...styleSheets)
        }
        return this
    }

    getShadow(): Wfrag {
        if (!this.ref.shadowRoot) throw new Error('No shadow root')
        return new Wfrag(this.ref.shadowRoot)
    }
}
