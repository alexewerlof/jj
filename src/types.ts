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
 * Configuration for the component's template.
 * Can be an HTML string, a JJHE instance, a raw HTMLElement, or a
 * Promise / factory that yields one of those.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
 * @example
 * ```ts
 * const t1: tmplConf = '<div>Hello</div>'
 * const t2: tmplConf = fetchHtml('./template.html') // Lazy loading
 * const t3: tmplConf = () => fetchHtml('./template.html') // Lazy loading
 * const t4: tmplConf = new JJHE(document.createElement('div')) // JJHE instance
 * const t5: tmplConf = document.createElement('div') // Raw HTMLElement
 * const t6: tmplConf = await fetchHtml('./template.html') // Eager loading
 * ```
 */
export type JJTemplateConfig =
    | string
    | JJHE
    | JJDF
    | HTMLElement
    | DocumentFragment
    | Promise<string | JJHE | JJDF | HTMLElement | DocumentFragment>
    | (() =>
          | string
          | JJHE
          | JJDF
          | HTMLElement
          | DocumentFragment
          | Promise<string | JJHE | JJDF | HTMLElement | DocumentFragment>)

/**
 * Configuration for the component's styles.
 * Can be a CSS string, a CSSStyleSheet, or a Promise / factory that yields one of those.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet | CSSStyleSheet}
 * @example
 * ```ts
 * const s1: JJStyleConfig = 'p { color: red; }' // simple string
 * const s2: JJStyleConfig = cssToSheet('p { color: red; }') // Parse string to CSSStyleSheet
 * const s3: JJStyleConfig = await fetchCss('./style.css') // Eager loading
 * const s4: JJStyleConfig = fetchCss('./style.css') // Lazy loading
 * const s5: JJStyleConfig = () => fetchCss('./style.css') // Lazy loading
 * ```
 */
export type JJStyleConfig =
    | string
    | CSSStyleSheet
    | Promise<string | CSSStyleSheet>
    | (() => string | CSSStyleSheet | Promise<string | CSSStyleSheet>)

/**
 * Configuration for initializing a shadowRoot
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets | ShadowRoot.adoptedStyleSheets}
 */
export interface ShadowConfig {
    /** Optional HTML content to set in the shadow root */
    template?: string | DocumentFragment
    /** Optional CSSStyleSheets to adopt in the shadow root */
    styles?: CSSStyleSheet[]
}
