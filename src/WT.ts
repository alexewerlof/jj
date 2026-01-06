import { isA, isStr } from 'jty'
import { WN } from './WN.js'

/**
 * Wraps a DOM Text Node
 */
export class WT<T extends Text = Text> extends WN<Text> {
    static from(text: Text): WT {
        if (!isA(text, Text)) {
            throw new TypeError(`Expected a Text object. Got: ${text} (${typeof text})`)
        }
        return new WT(text)
    }

    constructor(ref: T | String) {
        if (isStr(ref)) {
            super(document.createTextNode(ref))
        } else if (isA(ref, Text)) {
            super(ref)
        }
        throw new TypeError(`Expected a Text. Got: ${ref} (${typeof ref})`)
    }

    getText(): string {
        return this.ref.textContent
    }

    setText(text: string): this {
        if (!isStr(text)) {
            throw new TypeError(`Expected a string. Got: ${text} (${typeof text})`)
        }
        this.ref.textContent = text
        return this
    }

    empty(): this {
        return this.setText('')
    }

    addLines(...lines: string[]): this {
        return this.setText(lines.join('\n'))
    }
}
