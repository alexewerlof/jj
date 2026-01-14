import type { JJD } from './JJD.js'
import type { JJDF } from './JJDF.js'
import type { JJE } from './JJE.js'
import type { JJHE } from './JJHE.js'
import type { JJN } from './JJN.js'
import type { JJSE } from './JJSE.js'
import type { JJSR } from './JJSR.js'
import type { JJT } from './JJT.js'

/**
 * Represents any value that can be wrapped by the library.
 * Can be a native Node, a string (which becomes a Text node), or an existing JJ wrapper.
 */
export type Wrappable = string | Node | JJN

/**
 * Union type of all possible JJ wrapper classes.
 */
export type Wrapped = JJN | JJT | JJE | JJHE | JJSE | JJD | JJDF | JJSR

/**
 * Union type of all native DOM nodes that correspond to JJ wrappers.
 */
export type Unwrapped = Node | Text | Element | HTMLElement | SVGElement | Document | DocumentFragment | ShadowRoot

/**
 * Represents a resource that can be a direct value, a Promise, or a function returning either.
 * Used for lazy loading or dynamic generation.
 */
export type JJResource<T> = T | Promise<T> | (() => T | Promise<T>)

/**
 * Configuration for the component's template.
 * Can be an HTML string, a JJHE instance, or a raw HTMLElement.
 */
export type JJTemplateConfig = JJResource<string | JJHE | HTMLElement>

/**
 * Configuration for the component's styles.
 * Can be a CSS string or a CSSStyleSheet.
 */
export type JJStyleConfig = JJResource<string | CSSStyleSheet>

/**
 * Configuration for one or more style resources.
 */
export type JJStylesConfig = JJStyleConfig | JJStyleConfig[]

/**
 * Configuration object for defining a JJCC component.
 */
export interface JJConfig {
    /** The tag name for the custom element. Must contain a hyphen. */
    name: string
    /** The template configuration. */
    template?: JJTemplateConfig
    /** The styles configuration. */
    styles?: JJStylesConfig
    /** The Shadow DOM mode. Defaults to 'open'. */
    templateMode?: 'open' | 'closed'
}
