import { assertTrustedHtml, isInstance, isStr, typeErr } from '../internal.js'
import { JJN } from './JJN.js'
import type { JJE } from './JJE.js'
import type { JJHE } from './JJHE.js'
import type { JJDF } from './JJDF.js'
import { elementWrappers } from './WrapperChain.js'
import { JJT } from './JJT.js'

/**
 * Represents any value that can be wrapped by the library.
 * Native nodes and JJ wrappers are preserved as nodes.
 * Non-object values are coercible to text.
 * Plain objects are accepted for APIs that coerce via `JSON.stringify` / `String`.
 * @category Wrappers
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node | Node}
 */
export type Wrappable = string | number | boolean | bigint | symbol | object | null | undefined | Node | JJN

/**
 * Attribute bag accepted by the `tree()` factories.
 *
 * @remarks
 * Numbers and booleans are stringified by the DOM; `null` and `undefined` remove
 * the attribute, matching {@link JJE.setAttr}.
 */
export type TreeAttributes = Record<string, string | number | boolean | null | undefined>

/**
 * Pre-parsed template sources accepted by the template and shadow-initialization helpers.
 *
 * @remarks
 * An HTML *string* is deliberately absent: parsing markup is an injection vector, so
 * string input goes through {@link JJNx.addTemplate} with an explicit opt-in flag.
 * Use `fetchTemplate()` to load markup from a file.
 */
export type TemplateSource =
    | HTMLTemplateElement
    | DocumentFragment
    | HTMLElement
    | JJDF
    | JJHE<HTMLTemplateElement>
    | JJHE

/**
 * Extracts the underlying native DOM node from a wrapper.
 *
 * @internal
 * @remarks
 * If the input is already a native Node, it is returned as is.
 * If the input is a JJ wrapper, its underlying node is returned.
 * Otherwise, the input is coerced into a Text node.
 * Plain objects are stringified with JSON when possible, and fall back to `String(...)`.
 *
 *
 * @param x - The value to unwrap.
 * @returns The underlying DOM node.
 */
function unwrap(x: Wrappable): Node {
    if (isInstance(x, Node)) {
        return x
    }
    if (isInstance(x, JJN)) {
        return x.ref
    }
    return JJT.create(x).ref
}

/**
 * Unwraps an iterable object (e.g. an array or HTMLCollection).
 *
 * @internal
 * @param iterable - The iterable to unwrap.
 * @returns An array of native DOM nodes.
 */
function unwrapAll(iterable: Iterable<Wrappable>): Node[] {
    return Array.from(iterable, unwrap)
}

/**
 * A simple utility function that is used by addChild() and friends to filter out nullish children.
 * @param x any value
 * @returns true if x is undefined or null. False otherwise
 */
function notNullish(x: unknown): boolean {
    return x != null
}

export abstract class JJNx<T extends Element | Document | DocumentFragment> extends JJN<T> {
    /**
     * Finds the first element matching a selector within this Element.
     *
     * @remarks
     * A selector is a runtime string, so the element type cannot be inferred from it.
     * The wrapper defaults to `JJHE` (the common case) and can be overridden when you
     * know the result is SVG or MathML:
     *
     * ```ts
     * const jjInput = doc.find('input', true) // JJHE, so setValue() is available
     * const jjCircle = doc.find<JJSE>('circle', true) // JJSE
     * ```
     *
     * @example
     * ```ts
     * const jjSpan = el.find('span') // Returns null if not found
     * const jjSpan = el.find('span', true) // Throws if not found
     * ```
     *
     * @param selector - The CSS selector.
     * @param required - Whether to throw an error if not found. Defaults to false.
     * @returns The wrapped element, or null if not found and required is false.
     * @throws {ReferenceError} If no element matches and `required` is true.
     * @throws {TypeError} If `selector` is not a valid CSS selector string.
     * @see {@link findAll} for all matches.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector | Element.querySelector}
     */
    find<W extends JJE = JJHE>(selector: string, required: true): W
    find<W extends JJE = JJHE>(selector: string, required?: false): W | null
    find<W extends JJE = JJHE>(selector: string, required = false): W | null {
        const queryResult = this.ref.querySelector(selector)
        if (queryResult) {
            return elementWrappers.from(queryResult) as W
        }
        if (required) {
            throw new ReferenceError(`No element matched query "${selector}"`)
        }
        return null
    }

    /**
     * Finds all elements matching a selector within this Element.
     *
     * @remarks
     * Defaults to `JJHE[]`; override the type parameter for SVG or MathML results,
     * the same way as {@link find}.
     *
     * @example
     * ```ts
     * const jjItems = el.findAll('li')
     * ```
     *
     * @param selector - The CSS selector.
     * @returns An array of wrapped elements.
     * @throws {TypeError} If selector is not a string.
     * @see {@link find} for the first match.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll | Element.querySelectorAll}
     */
    findAll<W extends JJE = JJHE>(selector: string): W[] {
        return elementWrappers.fromAll(this.ref.querySelectorAll(selector)) as W[]
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
        const nodes = unwrapAll(children.filter(notNullish))
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
        if (!Array.isArray(children)) {
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
        const nodes = unwrapAll(children.filter(notNullish))
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
        if (!Array.isArray(children)) {
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
    addChildMap<T>(array: T[], mapFn: (value: T, index: number, array: T[]) => Wrappable) {
        if (!Array.isArray(array)) {
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
    preChildMap<T>(array: T[], mapFn: (value: T, index: number, array: T[]) => Wrappable) {
        if (!Array.isArray(array)) {
            throw typeErr('array', 'an array', array)
        }

        try {
            return this.preChildren(array.map(mapFn))
        } catch (cause) {
            throw new Error('Failed to map array to children', { cause })
        }
    }

    /**
     * Gets the parent node wrapped in the most specific JJ wrapper available.
     *
     * @remarks
     * Returns `null` when this node is detached and therefore has no parent.
     *
     * @example
     * ```ts
     * const child = JJHE.create('span')
     * JJHE.create('div').addChild(child)
     * const parent = child.getParent() // JJHE
     * ```
     *
     * @param required - Whether to throw if the node has no parent.
     * @returns The wrapped parent node, or `null` if this node has no parent.
     * @throws {ReferenceError} If `required` is true and the node has no parent.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/parentNode | Node.parentNode}
     */
    getParent(required: true): JJHE
    getParent(required?: false): JJHE | null
    getParent(required = false): JJHE | null {
        const { parentElement } = this.ref
        if (parentElement) {
            return elementWrappers.from(parentElement) as JJHE
        }
        if (required) {
            throw new ReferenceError('Node has no parent. Did you forget to attach it to the document?')
        }
        return null
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
            const nodes = unwrapAll(children.filter(notNullish))
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
        if (!Array.isArray(children)) {
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
    setChildMap<T>(array: T[], mapFn: (value: T, index: number, array: T[]) => Wrappable): this {
        if (!Array.isArray(array)) {
            throw typeErr('array', 'an array', array)
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
     * An HTML **string** is parsed as markup, so it requires an explicit `unsafe` opt-in —
     * the same rule as {@link JJE.setHTML}. Pre-parsed sources (a `DocumentFragment`, a
     * `<template>`, or `await fetchTemplate(...)`) need no flag. Use {@link JJE.setText}
     * for untrusted text.
     *
     * @example
     * ```ts
     * list.addTemplate('<li>Static markup</li>', true) // trusted literal
     * list.addTemplate(await templatePromise) // already parsed
     * ```
     *
     * @param template - The template source to clone and append.
     * @param unsafe - Explicit opt-in required when `template` is an HTML string.
     * @returns This instance for chaining.
     * @throws {TypeError} If the template type is unsupported or a Promise was passed.
     * @throws {Error} If `template` is a non-empty string and `unsafe` is not `true`.
     * @see {@link setTemplate} for replacing existing children with a cloned template.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createRange | Document.createRange}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement | HTMLTemplateElement}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment | DocumentFragment}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement | HTMLElement}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode | Node.cloneNode}
     */
    addTemplate(template: string | TemplateSource, unsafe?: boolean): this {
        assertTrustedHtml(template, unsafe)

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
        if (isInstance(template, Promise)) {
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
     * An HTML string needs the same explicit `unsafe` opt-in as {@link addTemplate}.
     *
     * @example
     * ```ts
     * el.setTemplate('<p>Static markup</p>', true) // trusted literal
     * el.setTemplate(await templatePromise) // already parsed
     * ```
     *
     * @param template - The template source to clone and set.
     * @param unsafe - Explicit opt-in required when `template` is an HTML string.
     * @returns This instance for chaining.
     * @throws {Error} If `template` is a non-empty string and `unsafe` is not `true`.
     * @see {@link addTemplate}
     * @see {@link empty} for clearing children without adding a replacement template.
     */
    setTemplate(template: string | TemplateSource, unsafe?: boolean): this {
        return this.empty().addTemplate(template, unsafe)
    }
}
