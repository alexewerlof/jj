import { isInstance } from 'jty'
import { typeErr } from '../internal.js'
import { JJN } from './JJN-raw.js'

/**
 * Wraps a DOM Text Node.
 *
 * @remarks
 * The Text interface represents the textual content of Element or Attr.
 * If an element has no markup within its content, it has a single child implementing Text
 * that contains the element's text.
 *
 * @category Wrappers
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Text | Text}
 */
export class JJT<T extends Text = Text> extends JJN<Text> {
    /**
     * Creates a JJT instance from a Text node.
     *
     * @remarks
        * Use {@link JJT.create} to create a Text node from a string.
     * For other Node types, use {@link JJN.from} or the specific wrapper type.
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
        * @see {@link JJT.create} for creating from string input.
     */
    static from(text: Text): JJT {
        return new JJT(text)
    }

    /**
     * Creates a JJT instance from a string.
     *
     * @param text - The string to convert into a Text node.
     * @returns A new JJT instance wrapping a Text node.
     * @see {@link JJT.from} for wrapping an existing Text node.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode | document.createTextNode}
     */
    static create(text: string): JJT {
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
     * @see {@link JJT.from} for wrapping an existing Text node.
        * @see {@link JJT.create} for creating from a plain string.
     */
    constructor(ref: T) {
        if (!isInstance(ref, Text)) {
            throw typeErr(
                'ref',
                'a Text node',
                ref,
                "Create a Text node with JJT.create() or document.createTextNode('text').",
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
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    setText(text?: unknown): this {
        this.ref.textContent = text as string | null
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
     * @param textArr - The string to add to the existing contents. If null or undefined, nothing is added.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
     */
    addText(...textArr: unknown[]): this {
        this.setText(this.getText() + textArr.join(''))
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
