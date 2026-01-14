import { JJHE } from './JJHE.js'
import { Wrappable } from './JJN-mixin.js'

/**
 * Hyperscript helper to create JJHE instances.
 * @param tagName The HTML tag name.
 * @param attributes Attributes to set on the element. Can be null.
 * @param children Children to append.
 * @returns The created JJHE instance.
 */
export function h(tagName: string, attributes?: Record<string, string> | null, ...children: Wrappable[]): JJHE {
    const ret = JJHE.fromTag(tagName).append(...children)
    if (attributes) {
        ret.setAttrs(attributes)
    }
    return ret
}
