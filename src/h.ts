import { isDef, isPOJO } from 'jty'
import { Wrappable, JJHE } from './wrappers/index.js'
import { typeErr } from './internal.js'

/**
 * Hyperscript helper to create JJHE instances.
 * The `h` function provides a concise way to create DOM wrappers with attributes and children,
 * similar to hyperscript helpers found in other libraries.
 *
 *
 * @remarks
 * It returns a `JJHE` instance which wraps the native HTMLElement.
 *
 * You may recognize it from other libraries:
 * - [React](https://react.dev/reference/react/createElement)
 * - [Vue](https://vuejs.org/guide/extras/render-function)
 * - [Hyperscript](https://github.com/hyperhype/hyperscript)
 * - [Angular](https://angular.dev/guide/components/programmatic-rendering)
 * - [Lit](https://lit.dev/docs/components/rendering/)
 *
 * This is not exactly a replacement, but it roughly follows the same idea.
 *
 * @example
 * ```ts
 * // Create a simple div
 * h('div', { id: 'app' }, 'Hello World')
 *
 * // Create a nested structure
 * h('ul', { class: 'list' },
 *   h('li', null, 'Item 1'),
 *   h('li', null, 'Item 2')
 * )
 * ```
 *
 * @param tagName - The HTML tag name.
 * @param attributes - Attributes to set on the element. Can be null or undefined.
 * @param children - Children to append (strings, nodes, or other JJHE instances).
 * @returns The created JJHE instance.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement | document.createElement}
 */
export function h(tagName: string, attributes?: Record<string, string> | null, ...children: Wrappable[]): JJHE {
    const ret = JJHE.create(tagName).addChild(...children)
    if (attributes) {
        if (!isPOJO(attributes)) {
            throw typeErr('attributes', 'a plain object', attributes)
        }
        ret.setAttr(attributes)
    }
    return ret
}

/**
 * Similar to the `h()` function but:
 * 1. Without attributes argument
 * 2. Takes an array for children instead of the spread operator.
 *
 * It makes creating typical HTML/SVG snippets more concise and readable.
 *
 * @example
 * ```ts
 * hc('ul', [
 *   hc('li', ['Item 1']),
 *   hc('li', ['Item 2']),
 * ])
 * // is the same as
 * h('ul', null,
 *   h('li', null, 'Item 1'),
 *   h('li', null, 'Item 2'),
 * )
 *
 * // It is especially useful when you have a list of items to render:
 * // Create a simple div
 * const fruits = ['Apple', 'Banana', 'Cherry']
 * hc('ul', fruits.map(fruit => hc('li', [fruit])))
 * // is the same as
 * h('ul', null, ...fruits.map(fruit => h('li', null, fruit)))
 * ```
 * @param tagName The Element Tag Name
 * @param children The children to append (strings, nodes, or other JJHE instances)
 * @returns The created JJHE instance
 * @see {@link h}
 */
export function hc(tagName: string, children: Wrappable[]): JJHE {
    if (isDef(children) && !Array.isArray(children)) {
        throw typeErr('children', 'an array', children)
    }
    return h(tagName, null, ...children)
}
