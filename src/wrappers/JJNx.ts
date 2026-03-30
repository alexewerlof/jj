import { isArr, isInstance, isPromise, isStr } from 'jty'
import { notNullish, typeErr } from '../internal.js'
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
     * To make template codes easier, this function ignores nullish children (`null` and `undefined`).
     * Other non-node values are coerced into Text nodes.
     *
     * @param children - The children to append.
     * @returns This instance for chaining.
     * @see {@link addChildren} for the array-based form.
     * @see {@link addChildMap} for mapping arrays into appended children.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/append | Element.append}
     */
    addChild(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(notNullish))
        this.ref.append(...nodes)
        return this
    }

    /**
     * Appends an array of children to this Element.
     *
     * @remarks
     * This is the array-based companion to {@link addChild}.
     * To make template codes easier, this function ignores nullish children (`null` and `undefined`).
     * Other non-node values are coerced into Text nodes.
     *
     * @example
     * ```ts
     * el.addChildren([JJHE.tree('span', null, 'hello'), ' world'])
     * ```
     *
     * @param children - The children to append.
     * @returns This instance for chaining.
     * @throws {TypeError} If `children` is not an array.
     * @see {@link addChild} for the variadic form.
     * @see {@link addChildMap} for mapping arrays into appended children.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/append | Element.append}
     */
    addChildren(children: Wrappable[]): this {
        if (!isArr(children)) {
            throw typeErr('children', 'an array of Wrappable', children)
        }
        return this.addChild(...children)
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
     * To make template codes easier, this function ignores nullish children (`null` and `undefined`).
     * Other non-node values are coerced into Text nodes.
     *
     * @param children - The children to prepend.
     * @returns This instance for chaining.
     * @see {@link preChildren} for the array-based form.
     * @see {@link preChildMap} for mapping arrays into prepended children.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend | Element.prepend}
     */
    preChild(...children: Wrappable[]): this {
        const nodes = JJN.unwrapAll(children.filter(notNullish))
        this.ref.prepend(...nodes)
        return this
    }

    /**
     * Prepends an array of children to this Element.
     *
     * @remarks
     * This is the array-based companion to {@link preChild}.
     * To make template codes easier, this function ignores nullish children (`null` and `undefined`).
     * Other non-node values are coerced into Text nodes.
     *
     * @example
     * ```ts
     * el.preChildren([JJHE.tree('span', null, 'first'), ' child'])
     * ```
     *
     * @param children - The children to prepend.
     * @returns This instance for chaining.
     * @throws {TypeError} If `children` is not an array.
     * @see {@link preChild} for the variadic form.
     * @see {@link preChildMap} for mapping arrays into prepended children.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend | Element.prepend}
     */
    preChildren(children: Wrappable[]): this {
        if (!isArr(children)) {
            throw typeErr('children', 'an array of Wrappable', children)
        }
        return this.preChild(...children)
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
     * To make template codes easier, this function ignores nullish children (`null` and `undefined`).
     * Other non-node values are coerced into Text nodes.
     *
     * @param array - The source array.
     * @param mapFn - The mapping function returning a Wrappable.
     * @returns This instance for chaining.
     * @throws {TypeError} If `array` is not an array.
     * @throws {Error} If mapping the array or appending the children fails.
     * @see {@link addChild} for directly appending variadic children.
     * @see {@link addChildren} for appending a pre-built array of children.
     */
    addChildMap<T>(array: T[], mapFn: (item: T) => Wrappable) {
        if (!isArr(array)) {
            throw typeErr('array', 'an array', array)
        }

        try {
            return this.addChildren(array.map(mapFn))
        } catch (cause) {
            throw new Error('Failed to map array to children', { cause })
        }
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
     * To make template codes easier, this function ignores nullish children (`null` and `undefined`).
     * Other non-node values are coerced into Text nodes.
     *
     * @param array - The source array.
     * @param mapFn - The mapping function.
     * @returns This instance for chaining.
     * @throws {TypeError} If `array` is not an array.
     * @throws {Error} If mapping the array or prepending the children fails.
     * @see {@link preChild} for directly prepending variadic children.
     * @see {@link preChildren} for prepending a pre-built array of children.
     */
    preChildMap<T>(array: T[], mapFn: (item: T) => Wrappable) {
        if (!isArr(array)) {
            throw typeErr('array', 'an array', array)
        }

        try {
            return this.preChildren(array.map(mapFn))
        } catch (cause) {
            throw new Error('Failed to map array to children', { cause })
        }
    }

    /**
     * Replaces the existing children of an Element with new children.
     *
     * @remarks
     * If no children are provided, it empties the Element.
     * To make template codes easier, this function ignores nullish children (`null` and `undefined`).
     * Other non-node values are coerced into Text nodes.
     *
     * @example
     * ```ts
     * el.setChild(JJHE.tree('p', null, 'New Content'))
     * ```
     * @param children - The children to replace with.
     * @returns This instance for chaining.
     * @see {@link setChildren} for the array-based form.
     * @see {@link setChildMap} for mapping arrays into replacement children.
     * @see {@link empty} for clearing all children.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.replaceChildren}
     */
    setChild(...children: Wrappable[]): this {
        if (children.length === 0) {
            this.ref.replaceChildren()
        } else {
            const nodes = JJN.unwrapAll(children.filter(notNullish))
            this.ref.replaceChildren(...nodes)
        }
        return this
    }

    /**
     * Replaces the existing children of an Element with an array of children.
     *
     * @remarks
     * This is the array-based companion to {@link setChild}.
     * Passing an empty array empties the Element.
     * To make template codes easier, this function ignores nullish children (`null` and `undefined`).
     * Other non-node values are coerced into Text nodes.
     *
     * @example
     * ```ts
     * el.setChildren([JJHE.tree('p', null, 'New Content')])
     * ```
     *
     * @param children - The children to replace with.
     * @returns This instance for chaining.
     * @throws {TypeError} If `children` is not an array of Wrappable.
     * @see {@link setChild} for the variadic form.
     * @see {@link setChildMap} for mapping arrays into replacement children.
     * @see {@link empty} for clearing all children.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.replaceChildren}
     */
    setChildren(children: Wrappable[]): this {
        if (!isArr(children)) {
            throw typeErr('children', 'an array of Wrappable', children)
        }
        return this.setChild(...children)
    }

    /**
     * Maps an array to children and replaces the existing children with the result.
     *
     * @remarks
     * This is the mapping companion to {@link setChildren}.
     * To make template codes easier, this function ignores mapped nullish children (`null` and `undefined`).
     * Other non-node values are coerced into Text nodes.
     * Errors thrown by the mapping function or child replacement are wrapped with a higher-level error that preserves the original cause.
     *
     * @example
     * ```ts
     * node.setChildMap(['a', 'b'], item => JJHE.tree('li', null, item))
     * ```
     *
     * @param array - The source array.
     * @param mapFn - The mapping function returning a Wrappable.
     * @returns This instance for chaining.
     * @throws {TypeError} If `array` is not an array of Wrappable.
     * @throws {Error} If mapping the array or replacing the children fails.
     * @see {@link setChildren} for replacing children from a pre-built array.
     * @see {@link setChild} for the variadic replacement form.
     * @see {@link empty} for clearing all children without replacements.
     */
    setChildMap(array: Wrappable[], mapFn: (item: Wrappable) => Wrappable) {
        if (!isArr(array)) {
            throw typeErr('array', 'an array of Wrappable', array)
        }

        try {
            return this.setChildren(array.map(mapFn))
        } catch (cause) {
            throw new Error('Failed to map array to children', { cause })
        }
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
     * @see {@link setChild} for replacing children with a variadic list.
     * @see {@link setChildren} for replacing children with an array.
     * @see {@link setChildMap} for replacing children from mapped input.
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
     * @see {@link setTemplate} for replacing existing children with a cloned template.
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
     * @see {@link empty} for clearing children without adding a replacement template.
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
