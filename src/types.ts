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
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node | Node}
 */
export type Wrappable = string | Node | JJN

/**
 * Union type of all possible JJ wrapper classes.
 */
export type Wrapped = JJN | JJT | JJE | JJHE | JJSE | JJD | JJDF | JJSR

/**
 * Union type of all native DOM nodes that correspond to JJ wrappers.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node | Node}
 */
export type Unwrapped = Node | Text | Element | HTMLElement | SVGElement | Document | DocumentFragment | ShadowRoot

/**
 * Represents a resource that can be a direct value, a Promise, or a function returning either.
 * Used for lazy loading or dynamic generation.
 *
 * @example
 * ```ts
 * type MyConfig = JJResource<string>
 * const c1: MyConfig = 'value'
 * const c2: MyConfig = Promise.resolve('value')
 * const c3: MyConfig = () => 'value'
 * const c4: MyConfig = async () => 'value'
 * ```
 */
export type JJResource<T> = T | Promise<T> | (() => T | Promise<T>)

/**
 * Configuration for the component's template.
 * Can be an HTML string, a JJHE instance, or a raw HTMLElement.
 *
 * @example
 * ```ts
 * const t1: JJTemplateConfig = '<div>Hello</div>'
 * const t2: JJTemplateConfig = fetchHtml('./template.html')
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
 */
export type JJTemplateConfig = JJResource<string | JJHE | HTMLElement>

/**
 * Configuration for the component's styles.
 * Can be a CSS string or a CSSStyleSheet.
 *
 * @example
 * ```ts
 * const s1: JJStyleConfig = 'p { color: red; }'
 * const s2: JJStyleConfig = fetchCss('./style.css')
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet | CSSStyleSheet}
 */
export type JJStyleConfig = JJResource<string | CSSStyleSheet>

/**
 * Configuration for one or more style resources.
 */
export type JJStylesConfig = JJStyleConfig | JJStyleConfig[]

/**
 * Configuration for initializing a shadowRoot
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets | ShadowRoot.adoptedStyleSheets}
 */
export interface ShadowConfig {
    /** Optional HTML content to set in the shadow root */
    template?: string
    /** Optional CSSStyleSheets to adopt in the shadow root */
    styles?: CSSStyleSheet[]
}
