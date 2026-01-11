import { hasProp, isA, isStr } from 'jty'
import { WE } from './WE.js'

/**
 * Wraps a DOM SVGElement
 */
export class WSE<T extends SVGElement = SVGElement> extends WE<T> {
    static from(ref: SVGElement): WSE {
        return new WSE(ref)
    }

    static fromTag(tagName: string, options?: ElementCreationOptions): WSE {
        if (!isStr(tagName)) {
            throw new TypeError(`Expected a string for tagName. Got: ${tagName} (${typeof tagName})`)
        }
        // SVG elements must be created with the SVG namespace
        const element = document.createElementNS('http://www.w3.org/2000/svg', tagName, options)
        return new WSE(element as SVGElement)
    }

    constructor(ref: T) {
        if (!isA(ref, SVGElement)) {
            throw new TypeError(`Expected a SVGElement. Got ${ref} (${typeof ref})`)
        }
        super(ref)
    }

    getText(): string {
        return this.ref.textContent ?? ''
    }

    setText(text: string): this {
        this.ref.textContent = text
        return this
    }

    empty(): this {
        this.ref.textContent = ''
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

    setFill(value: string): this {
        return this.setAttr('fill', value)
    }

    setStroke(value: string): this {
        return this.setAttr('stroke', value)
    }

    setStrokeWidth(value: string | number): this {
        return this.setAttr('stroke-width', String(value))
    }

    setViewBox(p1: string | (string | number)[] | number, p2?: number, p3?: number, p4?: number): this {
        if (typeof p1 === 'number' && p2 !== undefined && p3 !== undefined && p4 !== undefined) {
            return this.setAttr('viewBox', `${p1} ${p2} ${p3} ${p4}`)
        }
        const value = p1 as string | (string | number)[]
        return this.setAttr('viewBox', Array.isArray(value) ? value.join(' ') : value)
    }

    setWidth(value: string | number): this {
        return this.setAttr('width', String(value))
    }

    setHeight(value: string | number): this {
        return this.setAttr('height', String(value))
    }

    setD(value: string | (string | number)[]): this {
        return this.setAttr('d', Array.isArray(value) ? value.join(' ') : value)
    }

    setTransform(value: string): this {
        return this.setAttr('transform', value)
    }
}
