import { hasProp, isA, isStr } from 'jty'
import { WE } from './WE.js'

/**
 * Wraps a DOM HTMLElement (which is a descendant of Element)
 */
export class WHE<T extends HTMLElement = HTMLElement> extends WE<T> {
    static from(element: HTMLElement): WHE {
        if (!isA(element, HTMLElement)) {
            throw new TypeError(`Expected a HTMLElement. Got: ${element} (${typeof element})`)
        }
        return new WHE(element)
    }

    static fromTag(tagName: string, options?: ElementCreationOptions): WE {
        if (!isStr(tagName)) {
            throw new TypeError(`Expected a string for tagName. Got: ${tagName} (${typeof tagName})`)
        }
        return new WE(document.createElement(tagName, options))
    }

    static byId(id: string): WHE | null {
        const el = document.getElementById(id)
        return el ? WHE.from(el) : el
    }

    constructor(ref: T) {
        if (!isA(ref, HTMLElement)) {
            throw new TypeError(`Expected a HTMLElement. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    getValue(): string {
        if (!hasProp(this.ref, 'value')) {
            throw new Error('Element does not have a value property')
        }
        return this.ref.value
    }

    setValue(value: string): this {
        if (!hasProp(this.ref, 'value')) {
            throw new Error('Element does not have a value property')
        }
        this.ref.value = value
        return this
    }

    getData(name: string): string | undefined {
        return this.ref.dataset[name]
    }

    hasData(name: string): boolean {
        return hasProp(this.ref.dataset, name)
    }

    setData(name: string, value: string): this {
        this.ref.dataset[name] = value
        return this
    }

    setDataObj(obj: Record<string, string>): this {
        for (const [name, value] of Object.entries(obj)) {
            this.setData(name, value)
        }
        return this
    }

    rmData(name: string): this {
        delete this.ref.dataset[name]
        return this
    }

    focus(): this {
        this.ref.focus()
        return this
    }

    click(): this {
        this.ref.click()
        return this
    }

    empty(): this {
        this.ref.innerText = ''
        return this
    }

    getText(): string {
        return this.ref.innerText
    }

    setText(text: string): this {
        this.ref.innerText = text
        return this
    }
}
