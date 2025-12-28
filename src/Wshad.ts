import { isA } from 'jty'
import { Wfrag } from './Wfrag.js'

export class Wshad {
    #shad!: ShadowRoot

    constructor(shadow: ShadowRoot) {
        this.shad = shadow
    }

    get shad(): ShadowRoot {
        return this.#shad
    }

    set shad(value: ShadowRoot) {
        if (!isA(value, ShadowRoot)) {
            throw new TypeError(`Expected a ShadowRoot. Got ${value} (${typeof value})`)
        }
        this.#shad = value
    }

    getHtml() {
        return this.shad.innerHTML
    }

    setHtml(value: string) {
        this.shad.innerHTML = value
    }

    addStyleSheets(...styleSheets: CSSStyleSheet[]) {
        this.shad.adoptedStyleSheets.push(...styleSheets)
    }
}
