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
 * Native nodes and JJ wrappers are preserved as nodes.
 * Non-object values are coercible to text.
 * Plain objects are accepted for APIs that coerce via `JSON.stringify` / `String`.
 * @category Wrappers
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node | Node}
 * @see {@link JJN.wrap} to convert a Wrappable into a Wrapped type
 */
export type Wrappable = string | number | boolean | bigint | symbol | object | null | undefined | Node | JJN

/**
 * Union type of all possible JJ wrapper classes.
 * Includes {@link JJN} (Node), {@link JJT} (Text), {@link JJE} (Element),
 * {@link JJHE} (HTMLElement), {@link JJSE} (SVGElement), {@link JJME} (MathMLElement),
 * {@link JJD} (Document), {@link JJDF} (DocumentFragment), and {@link JJSR} (ShadowRoot).
 * @category Wrappers
 */
export type Wrapped = JJN | JJT | JJE | JJHE | JJSE | JJME | JJD | JJDF | JJSR

/**
 * Union type of all native DOM nodes that correspond to JJ wrappers.
 * This is the inverse of {@link Wrapped} — represents the unwrapped native DOM types.
 * @category Wrappers
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
