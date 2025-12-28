import { Wfrag } from './Wfrag.js'
import { off, on, unwrapAll, wrap, wrapAll } from './util.js'

/**
 * Represents a wrapped HTMLElement
 */
export class Welem {
    #elem!: HTMLElement

    constructor(ref: string | HTMLElement) {
        this.elem = typeof ref === 'string' ? document.createElement(ref) : ref
    }

    static from(htmlElement: HTMLElement): Welem {
        return new Welem(htmlElement)
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

    get elem(): HTMLElement {
        return this.#elem
    }

    set elem(value: HTMLElement) {
        if (!(value instanceof HTMLElement)) {
            throw new TypeError(`Expected an string or HTMLElement. Got: ${value} (${typeof value})`)
        }
        this.#elem = value
    }

    byClass(className: string): (Welem | Wfrag | Text)[] {
        return wrapAll(this.elem.getElementsByClassName(className))
    }

    query(selector: string): Welem | Wfrag | Text {
        return wrap(this.elem.querySelector(selector))
    }

    queryAll(selector: string): (Welem | Wfrag | Text)[] {
        return wrapAll(this.elem.querySelectorAll(selector))
    }

    clone(deep?: boolean): Welem {
        return new Welem(this.elem.cloneNode(deep) as HTMLElement)
    }

    getValue(): string {
        return (this.elem as HTMLInputElement).value
    }

    setValue(value: string): this {
        ;(this.elem as HTMLInputElement).value = value
        return this
    }

    getData(name: string): string | undefined {
        return this.elem.dataset[name]
    }

    setData(name: string, value: string): this {
        this.elem.dataset[name] = value
        return this
    }

    setDataObj(obj: Record<string, string>): this {
        for (const [name, value] of Object.entries(obj)) {
            this.setData(name, value)
        }
        return this
    }

    rmData(name: string): this {
        delete this.elem.dataset[name]
        return this
    }

    getAria(name: string): string | null {
        return this.elem.getAttribute(`aria-${name}`)
    }

    setAria(name: string, value: string): this {
        this.elem.setAttribute(`aria-${name}`, value)
        return this
    }

    setAriaObj(obj: Record<string, string>): this {
        for (const [name, value] of Object.entries(obj)) {
            this.setAria(name, value)
        }
        return this
    }

    rmAria(name: string): this {
        this.elem.removeAttribute(`aria-${name}`)
        return this
    }

    getAttr(name: string): string | null {
        return this.elem.getAttribute(name)
    }

    setAttr(name: string, value: string): this {
        this.elem.setAttribute(name, value)
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
            this.elem.removeAttribute(name)
        }
        return this
    }

    addClass(...classNames: string[]): this {
        this.elem.classList.add(...classNames)
        return this
    }

    rmClass(...classNames: string[]): this {
        this.elem.classList.remove(...classNames)
        return this
    }

    on(eventName: string, handler: EventListenerOrEventListenerObject): this {
        on(this.elem, eventName, handler)
        return this
    }

    onClick(handler: EventListenerOrEventListenerObject): this {
        return this.on('click', handler)
    }

    off(eventName: string, handler: EventListenerOrEventListenerObject): this {
        off(this.elem, eventName, handler)
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
        this.elem.remove()
        return this
    }

    focus(): this {
        this.elem.focus()
        return this
    }

    click(): this {
        this.elem.click()
        return this
    }

    empty(): this {
        this.elem.innerText = ''
        return this
    }

    append(...children: unknown[]): this {
        this.elem.append(...unwrapAll(children))
        return this
    }

    mapAppend<T>(array: T[], mapFn: (item: T) => unknown): this {
        return this.append(...array.map(mapFn))
    }

    prepend(...children: unknown[]): this {
        this.elem.prepend(...unwrapAll(children))
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

    getText(): string {
        return this.elem.innerText
    }

    setText(text: string): this {
        this.elem.innerText = text
        return this
    }

    getHtml(): string {
        return this.elem.innerHTML
    }

    setHtml(html: string): this {
        this.elem.innerHTML = html
        return this
    }

    setShadow(mode: ShadowRootMode = 'open', html?: string, ...styleSheets: CSSStyleSheet[]): this {
        const shadowRoot = this.elem.shadowRoot ?? this.elem.attachShadow({ mode })
        if (html) {
            shadowRoot.innerHTML = html
        }
        if (styleSheets.length) {
            shadowRoot.adoptedStyleSheets.push(...styleSheets)
        }
        return this
    }

    getShadow(): Wfrag {
        if (!this.elem.shadowRoot) throw new Error('No shadow root')
        return new Wfrag(this.elem.shadowRoot)
    }
}
