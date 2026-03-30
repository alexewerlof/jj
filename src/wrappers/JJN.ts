import { isInstance, isObj } from 'jty'
import { JJN } from './JJN-raw.js'
import { JJHE } from './JJHE.js'
import { JJE } from './JJE.js'
import { JJDF } from './JJDF.js'
import { JJSR } from './JJSR.js'
import { JJT } from './JJT.js'
import { JJD } from './JJD.js'
import { JJME } from './JJME.js'
import { JJSE } from './JJSE.js'
import { Wrappable, Wrapped } from './types.js'

JJN.wrap = function wrap(raw: Wrappable): Wrapped {
    if (isObj(raw)) {
        if (isInstance(raw, JJN)) {
            return raw
        }
        if (isInstance(raw, HTMLElement)) {
            return JJHE.from(raw)
        }
        if (isInstance(raw, SVGElement)) {
            return JJSE.from(raw)
        }
        if (isInstance(raw, MathMLElement)) {
            return JJME.from(raw)
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
    }
    return JJT.create(String(raw))
}

export { JJN }
