import { isA, isStr } from 'jty'
import { JJN } from './JJN.js'

/**
 * Wraps a DOM Text Node.
 *
 * @remarks
 * The Text interface represents the textual content of Element or Attr.
 * If an element has no markup within its content, it has a single child implementing Text
 * that contains the element's text.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Text | Text}
 */
export class JJT<T extends Text = Text> extends JJN<Text> {
    /**
     * Creates a JJT instance from a Text node.
     *
     * @example
     * ```ts
     * const textNode = document.createTextNode('foo')
     * const text = JJT.from(textNode)
     * ```
     *
     * @param text - The Text node.
     * @returns A new JJT instance.
     * @throws {TypeError} If `text` is not a Text node.
     */
    static from(text: Text): JJT {
        if (!isA(text, Text)) {
            throw new TypeError(`Expected a Text object. Got: ${text} (${typeof text})`)
        }
        return new JJT(text)
    }

    /**
     * Creates an instance of JJT.
     *
     * @example
     * ```ts
     * const text = new JJT('Hello World')
     * ```
     *
     * @param ref - The Text node or a string to create a Text node from.
     * @throws {TypeError} If `ref` is not a Text node or string.
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
     * Gets the text content of the Text node.
     *
     * @example
     * ```ts
     * const content = text.getText()
     * ```
     *
     * @returns The text content.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    getText(): string {
        return this.ref.textContent ?? ''
    }

    /**
     * Sets the text content of the Text node.
     *
     * @example
     * ```ts
     * text.setText('New content')
     * ```
     *
     * @param text - The text to set.
     * @returns This instance for chaining.
     * @throws {TypeError} If `text` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    setText(text: string): this {
        if (!isStr(text)) {
            throw new TypeError(`Expected a string. Got: ${text} (${typeof text})`)
        }
        this.ref.textContent = text
        return this
    }

    /**
     * Clears the text content of the Text node.
     *
     * @example
     * ```ts
     * text.empty()
     * ```
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    empty(): this {
        return this.setText('')
    }

    /**
     * Sets the text content of the Text node to multiple lines joined by newline.
     *
     * @example
     * ```ts
     * text.addLines('Line 1', 'Line 2')
     * ```
     *
     * @param lines - The lines of text.
     * @returns This instance for chaining.
     */
    addLines(...lines: string[]): this {
        return this.setText(lines.join('\n'))
    }
}
