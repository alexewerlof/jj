import { isA, isStr } from 'jty'
import { JJN } from './JJN.js'

/**
 * Wraps a DOM Text Node
 */
export class JJT<T extends Text = Text> extends JJN<Text> {
    /**
     * Creates a JJT instance from a Text node.
     * @param text The Text node.
     * @returns A new JJT instance.
     * @throws {TypeError} If text is not a Text node.
     */
    static from(text: Text): JJT {
        if (!isA(text, Text)) {
            throw new TypeError(`Expected a Text object. Got: ${text} (${typeof text})`)
        }
        return new JJT(text)
    }

    /**
     * Creates an instance of JJT.
     * @param ref The Text node or a string to create a Text node from.
     * @throws {TypeError} If ref is not a Text node or string.
     */
    constructor(ref: T | string) {
        if (isStr(ref)) {
            super(document.createTextNode(ref))
        } else if (isA(ref, Text)) {
            super(ref)
        } else {
            throw new TypeError(`Expected a Text. Got: ${ref} (${typeof ref})`)
        }
    }

    /**
     * Gets the text content.
     * @returns The text content.
     */
    getText(): string {
        return this.ref.textContent ?? ''
    }

    /**
     * Sets the text content.
     * @param text The text to set.
     * @returns This instance.
     * @throws {TypeError} If text is not a string.
     */
    setText(text: string): this {
        if (!isStr(text)) {
            throw new TypeError(`Expected a string. Got: ${text} (${typeof text})`)
        }
        this.ref.textContent = text
        return this
    }

    /**
     * Clears the text content.
     * @returns This instance.
     */
    empty(): this {
        return this.setText('')
    }

    /**
     * Sets the text content to multiple lines joined by newline.
     * @param lines The lines of text.
     * @returns This instance.
     */
    addLines(...lines: string[]): this {
        return this.setText(lines.join('\n'))
    }
}
