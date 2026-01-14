import { JJHE } from './JJHE.js'
import { Wrappable } from './JJN-mixin.js'

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
    const ret = JJHE.fromTag(tagName).append(...children)
    if (attributes) {
        ret.setAttrs(attributes)
    }
    return ret
}
