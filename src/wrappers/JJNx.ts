import { isInstance, isPromise, isStr } from 'jty'
import { typeErr } from '../internal.js'
import { Wrappable, Wrapped } from './types.js'
import { JJN } from './JJN-raw.js'
import type { JJHE } from './JJHE.js'
import type { JJDF } from './JJDF.js'

export abstract class JJNx<T extends Element | Document | DocumentFragment> extends JJN<T> {
    /**
     * Finds the first element matching a selector within this Element.
     *
     * @example
     * ```ts
     * const span = el.find('span')  // Returns null if not found
     * const span = el.find('span', true)  // Throws if not found
     * ```
     *
     * @param selector - The CSS selector.
     * @param required - Whether to throw an error if not found. Defaults to false.
     * @returns The wrapped element, or null if not found and required is false.
     * @throws {ReferenceError} If selector is not a string or element not found and required is true.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector | Element.querySelector}
     */
    find(selector: string, required = false): Wrapped | null {
        const queryResult = this.ref.querySelector(selector)
        if (queryResult) {
            return JJN.wrap(queryResult)
        }
        if (required) {
            throw new ReferenceError(`No element matched query "${selector}"`)
        }
        return null
    }

    /**
     * Finds all elements matching a selector within this Element.
     *
     * @example
     * ```ts
     * const items = el.findAll('li')
     * ```
     *
     * @param selector - The CSS selector.
     * @returns An array of wrapped elements.
     * @throws {TypeError} If selector is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll | Element.querySelectorAll}
     */
    findAll(selector: string): Wrapped[] {
        return JJN.wrapAll(this.ref.querySelectorAll(selector))
    }

    /**
     * Appends children to this Element.
     *
     * @example
     * ```ts
     * el.addChild(JJHE.tree('span', null, 'hello'))
     * ```
     *
     * @remarks
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @param children - The children to append.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/append | Element.append}
     */
    addChild(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(JJN.isWrappable))
        this.ref.append(...nodes)
        return this
    }

    /**
     * Prepends children to this Element.
     *
     * @example
     * ```ts
     * el.preChild(JJHE.tree('span', null, 'first'))
     * ```
     *
     * @remarks
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @param children - The children to prepend.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend | Element.prepend}
     */
    preChild(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(JJN.isWrappable))
        this.ref.prepend(...nodes)
        return this
    }

    /**
     * Maps an array to children and appends them.
     *
     * @example
     * ```ts
     * node.addChildMap(['a', 'b'], item => JJHE.tree('li', null, item))
     * ```
     *
     * @remarks
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @param array - The source array.
     * @param mapFn - The mapping function returning a Wrappable.
     * @returns This instance for chaining.
     */
    addChildMap(array: Wrappable[], mapFn: (item: Wrappable) => Wrappable) {
        return this.addChild(...array.map(mapFn))
    }

    /**
     * Maps an array to children and prepends them.
     *
     * @example
     * ```ts
     * node.preChildMap(['a', 'b'], item => JJHE.create('li').setText(item))
     * ```
     *
     * @remarks
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @param array - The source array.
     * @param mapFn - The mapping function.
     * @returns This instance for chaining.
     */
    preChildMap(array: Wrappable[], mapFn: (item: Wrappable) => Wrappable) {
        return this.preChild(...array.map(mapFn))
    }

    /**
     * Replaces the existing children of an Element with new children.
     *
     * @remarks
     * If no children are provided, it empties the Element.
     * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
     *
     * @example
     * ```ts
     * el.setChild(JJHE.tree('p', null, 'New Content'))
     * ```
     * @param children - The children to replace with.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.replaceChildren}
     */
    setChild(...children: Wrappable[]): this {
        if (children.length === 0) {
            this.ref.replaceChildren()
        } else {
            const nodes = JJN.unwrapAll(children.filter(JJN.isWrappable))
            this.ref.replaceChildren(...nodes)
        }
        return this
    }

    /**
     * Removes all children from this Element.
     *
     * @example
     * ```ts
     * el.empty()
     * ```
     *
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.setChildren}
     */
    empty(): this {
        return this.setChild()
    }

    /**
     * Clones and appends template-like input to this node.
     *
     * @remarks
     * Supports HTML strings, native template sources, native Nodes, and any JJ wrapper via {@link JJN}.
     * Wrapper inputs are unwrapped and cloned before append.
     *
     * @param template - The template source to clone and append.
     * @returns This instance for chaining.
     * @throws {TypeError} If the template type is unsupported or a Promise was passed.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createRange | Document.createRange}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement | HTMLTemplateElement}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment | DocumentFragment}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement | HTMLElement}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode | Node.cloneNode}
     */
    addTemplate(
        template:
            | string
            | HTMLTemplateElement
            | DocumentFragment
            | HTMLElement
            | JJDF
            | JJHE<HTMLTemplateElement>
            | JJHE,
    ): this {
        if (isStr(template)) {
            // Using Range for faster parsing than innerHTML
            return this.addChild(document.createRange().createContextualFragment(template))
        }
        if (isInstance(template, DocumentFragment) || isInstance(template, HTMLElement)) {
            return this.addChild(
                isInstance(template, HTMLTemplateElement)
                    ? (template.content.cloneNode(true) as DocumentFragment)
                    : (template.cloneNode(true) as Node),
            )
        }
        if (isInstance(template, Node)) {
            return this.addChild(template.cloneNode(true))
        }
        if (isInstance(template, JJN)) {
            return this.addTemplate(template.ref)
        }
        if (isPromise(template)) {
            throw typeErr(
                'template',
                'not a Promise',
                template,
                'Templates must be provided synchronously. Did you forget to await?',
            )
        }
        throw typeErr(
            'template',
            'a string, Node, DocumentFragment, HTMLElement, JJDF, or JJHE',
            template,
            'Pass an HTML string, a DOM template/fragment/element, or a JJ wrapper.',
        )
    }

    /**
     * Clones and sets template-like input as the only children of this node.
     *
     * @remarks
     * Supports HTML strings, native template sources, native Nodes, and any JJ wrapper via {@link JJN}.
     * Wrapper inputs are unwrapped and cloned before set.
     *
     * @example
     * ```ts
     * el.setTemplate('<p>New Content</p>')
     * ```
     * @param template - The template source to clone and set.
     * @returns This instance for chaining.
     * @see {@link addTemplate}
     */
    setTemplate(
        template:
            | string
            | HTMLTemplateElement
            | DocumentFragment
            | HTMLElement
            | JJDF
            | JJHE<HTMLTemplateElement>
            | JJHE,
    ): this {
        return this.empty().addTemplate(template)
    }
}
