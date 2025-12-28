import { isA } from 'jty'
import { Wfrag } from './Wfrag.js'

export class Wshad extends Wfrag {
    constructor(shadow: ShadowRoot) {
        if (!isA(shadow, ShadowRoot)) {
            throw new TypeError(`Expected a ShadowRoot. Got ${shadow} (${typeof shadow})`)
        }
        super(shadow)
    }

    get ref() {
        return super.ref as ShadowRoot
    }

    set ref(value) {
        if (!isA(value, ShadowRoot)) {
            throw new TypeError(`Expected a ShadowRoot. Got ${value} (${typeof value})`)
        }
        super.ref = value
    }

    getHtml() {
        return this.ref.innerHTML
    }

    setHtml(value: string) {
        this.ref.innerHTML = value
        return this
    }

    addStyleSheets(...styleSheets: CSSStyleSheet[]) {
        this.ref.adoptedStyleSheets.push(...styleSheets)
        return this
    }
}
