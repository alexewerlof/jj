import { isA } from 'jty'
import { WF } from './WF.js'

/**
 * Wraps a DOM ShadowRoot node (which is a descendant of DocumentFragment)
 */
export class WS<T extends ShadowRoot = ShadowRoot> extends WF<T> {
    constructor(shadow: T) {
        if (!isA(shadow, ShadowRoot)) {
            throw new TypeError(`Expected a ShadowRoot. Got ${shadow} (${typeof shadow})`)
        }
        super(shadow)
    }

    getHtml(): string {
        return this.ref.innerHTML
    }

    setHtml(value: string, unsafe: false): this {
        // TODO: https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/setHTMLUnsafe
        this.ref.innerHTML = value
        return this
    }

    addStyleSheets(...styleSheets: CSSStyleSheet[]): this {
        this.ref.adoptedStyleSheets.push(...styleSheets)
        return this
    }
}
