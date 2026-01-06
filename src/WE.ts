import { isA } from 'jty'
import { WF } from './WF.js'
import { WN } from './WN.js'
import { off, on } from './util.js'
import { Wrapped } from './WN-mixin.js'

/**
 * Wraps a DOM Element (which is a descendant of Node)
 */
export class WE<T extends Element = Element> extends WN<T> {
    static byClass(className: string): WE[] {
        return Array.from(document.getElementsByClassName(className), WE.from)
    }

    static from(element: Element): WE {
        if (!isA(element, Element)) {
            throw new TypeError(`Expected a WE or Element. Got: ${element} (${typeof element})`)
        }
        return new WE(element)
    }

    static fromIter(iterable: Iterable<Element>): WE[] {
        return Array.from(iterable, WE.from)
    }

    static query(selector: string): Wrapped | null {
        const queryResult = document.querySelector(selector)
        return queryResult === null ? null : WN.wrap(queryResult)
    }

    static queryAll(selector: string): Wrapped[] {
        return WN.wrapAll(document.querySelectorAll(selector))
    }

    constructor(ref: T) {
        if (!isA(ref, Element)) {
            throw new TypeError(`Expected a Element. Got: ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    byClass(className: string): WE[] {
        return Array.from(this.ref.getElementsByClassName(className), WE.from)
    }

    query(selector: string): Wrapped | null {
        const queryResult = this.ref.querySelector(selector)
        return queryResult ? WE.from(queryResult) : null
    }

    queryAll(selector: string): Wrapped[] {
        return Array.from(this.ref.querySelectorAll(selector), WE.from)
    }

    getAttr(name: string): string | null {
        return this.ref.getAttribute(name)
    }

    hasAttr(name: string): boolean {
        return this.ref.hasAttribute(name)
    }

    setAttr(name: string, value: string): this {
        this.ref.setAttribute(name, value)
        return this
    }

    setAttrs(obj: Record<string, string>): this {
        for (const [name, value] of Object.entries(obj)) {
            this.setAttr(name, value)
        }
        return this
    }

    rmAttr(name: string) {
        return this.rmAttrs(name)
    }

    rmAttrs(...names: string[]): this {
        for (const name of names) {
            this.ref.removeAttribute(name)
        }
        return this
    }

    getAria(name: string): string | null {
        return this.ref.getAttribute(`aria-${name}`)
    }

    hasAria(name: string): boolean {
        return this.ref.hasAttribute(`aria-${name}`)
    }

    setAria(name: string, value: string): this {
        this.ref.setAttribute(`aria-${name}`, value)
        return this
    }

    rmAria(name: string): this {
        this.ref.removeAttribute(`aria-${name}`)
        return this
    }

    addClass(...classNames: string[]): this {
        this.ref.classList.add(...classNames)
        return this
    }

    rmClasses(...classNames: string[]): this {
        this.ref.classList.remove(...classNames)
        return this
    }

    rmClass(className: string) {
        return this.rmClasses(className)
    }

    hasClass(className: string): boolean {
        return this.ref.classList.contains(className)
    }

    toggleClass(className: string): this {
        this.ref.classList.toggle(className)
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

    /**
     * @remarks
     * **Note:** You can't attach a shadow root to every type of element. There are some that can't have a
     * shadow DOM for security reasons (for example `<a>`).
     */
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

    getShadow(): WF {
        if (!this.ref.shadowRoot) throw new Error('No shadow root')
        return new WF(this.ref.shadowRoot)
    }
}
