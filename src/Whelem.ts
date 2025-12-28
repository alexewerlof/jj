import { hasOwnProp, isA } from 'jty'
import { Welem } from './Welem.js'

export class Whelem extends Welem {
    constructor(ref: HTMLElement) {
        if (!isA(ref, HTMLElement)) {
            throw new TypeError(`Expected a HTMLElement. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    get ref(): HTMLElement {
        return super.ref as HTMLElement
    }

    set ref(value: HTMLElement) {
        if (!isA(value, HTMLElement)) {
            throw new TypeError(`Expected a HTMLElement. Got ${value} (${typeof value})`)
        }
        super.ref = value
    }

    getValue(): string {
        if (!hasOwnProp(this.ref, 'value')) {
            throw new Error('Element does not have a value property')
        }
        return this.ref.value
    }

    setValue(value: string): this {
        if (!hasOwnProp(this.ref, 'value')) {
            throw new Error('Element does not have a value property')
        }
        this.ref.value = value
        return this
    }

    getData(name: string): string | undefined {
        return this.ref.dataset[name]
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
