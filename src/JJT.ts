import { isA, isStr } from 'jty'
import { JJN } from './JJN.js'
import { typeErr } from './internal.js'

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
        return new JJT(text)
    }

    static fromStr(text: string): JJT {
        return new JJT(document.createTextNode(text))
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
    constructor(ref: T) {
        if (!isA(ref, Text)) {
            throw new TypeError(
                `JJT expects a Text node. Got ${ref} (${typeof ref}). ` +
                    `Create a Text node with JJT.fromStr() or document.createTextNode('text').`,
            )
        }
        super(ref)
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
        return this.ref.textContent
    }

    /**
     * Sets the text content of the Text node.
     *
     * @example
     * ```ts
     * text.setText('New content')
     * ```
     *
     * @param text - The text to set. Set it to null or undefined to remove all text
     * @returns This instance for chaining.
     * @throws {TypeError} If `text` is not a string, null, or undefined.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    setText(text?: string | null): this {
        if (text === undefined) {
            text = null
        }
        if (text !== null && !isStr(text)) {
            throw typeErr('text', 'a string or null or undefined', text)
        }
        this.ref.textContent = text
        return this
    }

    /**
     * Appends text to the existing content.
     *
     * @example
     * ```ts
     * text.setText('hello')
     * text.addText(' world')
     * console.log(text.getText()) // 'hello world'
     * ```
     *
     * @param text - The string to add to the existing contents. If null or undefined, nothing is added.
     * @returns This instance for chaining.
     * @throws {TypeError} If `text` is not a string, null, or undefined.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    addText(text?: string | null): this {
        if (text === undefined) {
            text = null
        }
        if (text !== null && !isStr(text)) {
            throw typeErr('text', 'a string or null or undefined', text)
        }
        if (text) {
            this.ref.textContent += text
        }
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
}
