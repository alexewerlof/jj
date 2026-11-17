import { isInstance, toStr, typeErr } from '../internal.js'
import { JJET } from './JJET.js'
import { nodeWrappers } from './WrapperChain.js'

/**
 * Wraps a DOM Node.
 *
 * @remarks
 * This is the base class for all JJ wrappers. It provides common functionality for DOM manipulation,
 * traversal, and event handling.
 *
 * @category Wrappers
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node | Node}
 */

export class JJN<T extends Node = Node> extends JJET<T> {
    static {
        nodeWrappers.register(Node, JJN)
    }
    /**
     * Creates a JJN instance from a Node reference.
     *
     * @remarks
     * For better type safety, use the specific wrapper type if you know the Node type:
     * {@link JJHE} for HTMLElement, {@link JJSE} for SVGElement, {@link JJT} for Text, etc.
     *
     * @example
     * ```ts
     * const node = JJN.from(document.createTextNode('hello'))
     * ```
     *
     * @param node - The Node instance.
     * @returns A new JJN instance.
     */
    static from(node: Node): JJN {
        return new JJN(node)
    }

    /**
     * Creates an instance of JJN.
     *
     * @param ref - The Node to wrap.
     * @throws {TypeError} If `ref` is not a Node.
     * @see {@link JJN.from} for the factory form.
     */
    constructor(ref: T) {
        if (!isInstance(ref, Node)) {
            throw typeErr('ref', 'a DOM Node instance', ref)
        }
        super(ref)
    }

    /**
     * Gets the parent node wrapped in the most specific JJ wrapper available.
     *
     * @remarks
     * Returns `null` when this node is detached and therefore has no parent.
     *
     * @example
     * ```ts
     * const text = JJT.create('hello')
     * JJHE.create('div').addChild(text)
     * const parent = text.getParentNode() // JJHE
     * ```
     *
     * @param required - Whether to throw if the node has no parent.
     * @returns The wrapped parent node, or `null` if this node has no parent.
     * @throws {ReferenceError} If `required` is true and the node has no parent.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/parentNode | Node.parentNode}
     */
    getParentNode(required: true): ReturnType<(typeof nodeWrappers)['from']>
    getParentNode(required?: false): ReturnType<(typeof nodeWrappers)['from']> | null
    getParentNode(required = false): ReturnType<(typeof nodeWrappers)['from']> | null {
        const { parentNode } = this.ref
        if (parentNode) {
            return nodeWrappers.from(parentNode)
        }
        if (required) {
            throw new ReferenceError('Node has no parent. Did you forget to attach it to the document?')
        }
        return null
    }

    /**
     * Gets the child nodes wrapped in the most specific JJ wrappers available.
     *
     * @remarks
     * Returns an empty array when this node has no children.
     *
     * @example
     * ```ts
     * const el = JJHE.create('div').addChild('hello', JJHE.create('span'))
     * const children = el.getChildren() // [JJT, JJHE]
     * ```
     *
     * @param required - Whether to throw if the node has no children.
     * @returns The wrapped child nodes.
     * @throws {ReferenceError} If `required` is true and the node has no children.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes | Node.childNodes}
     */
    getChildren(required: true): ReturnType<(typeof nodeWrappers)['fromAll']>
    getChildren(required?: false): ReturnType<(typeof nodeWrappers)['fromAll']>
    getChildren(required = false): ReturnType<(typeof nodeWrappers)['fromAll']> {
        const children = nodeWrappers.fromAll(this.ref.childNodes)
        if (required && children.length === 0) {
            throw new ReferenceError('Node has no children. Did you forget to initialize or append them?')
        }
        return children
    }

    /**
     * Clones the Node.
     *
     * @remarks
     * The clone is wrapped with the same wrapper class as this instance, so further
     * JJ calls keep working on it.
     *
     * @param deep - If true, clones the subtree.
     * @returns A new wrapped instance of the clone.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode | Node.cloneNode}
     */
    clone(deep?: boolean): this {
        return nodeWrappers.from(this.ref.cloneNode(deep)) as this
    }

    /**
     * Removes this node from its parent.
     *
     * @remarks
     * If the node has no parent, this method does nothing.
     *
     * @example
     * ```ts
     * const doc = JJD.from(document)
     * const el = JJHE.create('div')
     * doc.find('body', true).addChild(el)
     * el.rm()
     * ```
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild | Node.removeChild}
     */
    rm(): this {
        const { parentNode } = this.ref
        if (parentNode) {
            parentNode.removeChild(this.ref)
        }
        return this
    }

    /**
     * Creates a Text node from a string and appends it to this Node.
     *
     * @remarks
     * This method is overridden in JJT to append to the existing text content instead.
     *
     * @example
     * ```ts
     * el.addText('Hello ')
     * el.addText('World')
     * // Behaves like document.createTextNode('Hello World') and appends it to el
     * // Falsy values are converted to their string representation, except for empty string which is added as is.
     * el.addText('Hello', '', 'world', null, undefined, '!!!') // Adds 6 text nodes with content 'Hello', '', 'world', 'null', 'undefined', and '!!!' respectively.
     * ```
     *
     * @param textArr - The text to add. The actual text that's added follows the rules in document.createTextNode() which is basically what you get from String()
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode | document.createTextNode}
     */
    addText(...textArr: unknown[]): this {
        for (const text of textArr) {
            this.ref.appendChild(document.createTextNode(toStr(text)))
        }
        return this
    }
}
