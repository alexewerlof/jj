import { WHE } from './WHE.js'
import { Wrappable } from './WN-mixin.js'

export function h(tagName: string, attributes: Record<string, string>, ...children: Wrappable[]): WHE {
    const ret = WHE.fromTag(tagName).append(...children)
    if (attributes) {
        ret.setAttrs(attributes)
    }
    return ret
}
