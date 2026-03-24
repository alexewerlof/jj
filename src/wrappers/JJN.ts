import { isInstance, isObj, isStr } from 'jty'
import { typeErr } from '../internal.js'
import { JJHE } from './JJHE.js'
import { JJE } from './JJE.js'
import { JJDF } from './JJDF.js'
import { JJSR } from './JJSR.js'
import { JJT } from './JJT.js'
import { JJN } from './JJN-raw.js'
import { JJD } from './JJD.js'
import { JJSE } from './JJSE.js'
import { Wrappable, Wrapped } from './types.js'

JJN.wrap = function wrap(raw: Wrappable): Wrapped {
    if (isStr(raw)) {
        return JJT.fromStr(raw)
    }
    if (!isObj(raw)) {
        throw typeErr('raw', 'an object', raw, 'Pass a string, DOM node, or JJ wrapper.')
    }
    if (isInstance(raw, JJN)) {
        return raw
    }
    if (isInstance(raw, HTMLElement)) {
        return JJHE.from(raw)
    }
    if (isInstance(raw, SVGElement)) {
        return JJSE.from(raw)
    }
    if (isInstance(raw, Element)) {
        return JJE.from(raw)
    }
    if (isInstance(raw, ShadowRoot)) {
        return JJSR.from(raw)
    }
    if (isInstance(raw, DocumentFragment)) {
        return JJDF.from(raw)
    }
    if (isInstance(raw, Document)) {
        return JJD.from(raw)
    }
    if (isInstance(raw, Text)) {
        return JJT.from(raw)
    }
    if (isInstance(raw, Node)) {
        return JJN.from(raw)
    }
    throw typeErr('raw', 'a Node', raw, 'Pass a DOM node, or use JJT.fromStr(text) for plain text.')
}

export { JJN }
