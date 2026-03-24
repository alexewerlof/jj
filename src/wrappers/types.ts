import type { JJD } from './JJD.js'
import type { JJDF } from './JJDF.js'
import type { JJE } from './JJE.js'
import type { JJHE } from './JJHE.js'
import type { JJN } from './JJN-raw.js'
import type { JJME } from './JJME.js'
import type { JJSE } from './JJSE.js'
import type { JJSR } from './JJSR.js'
import type { JJT } from './JJT.js'

/**
 * Represents any value that can be wrapped by the library.
 * Can be a native Node, a string (which becomes a Text node), or an existing JJ wrapper.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node | Node}
 */
export type Wrappable = string | Node | JJN

/**
 * Union type of all possible JJ wrapper classes.
 */
export type Wrapped = JJN | JJT | JJE | JJHE | JJSE | JJME | JJD | JJDF | JJSR

/**
 * Union type of all native DOM nodes that correspond to JJ wrappers.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node | Node}
 */
export type Unwrapped =
    | Node
    | Text
    | Element
    | HTMLElement
    | SVGElement
    | MathMLElement
    | Document
    | DocumentFragment
    | ShadowRoot
