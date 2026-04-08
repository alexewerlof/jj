import { JJDF } from './wrappers/index.js'
import { isStr, typeErr } from './internal.js'

/**
 * Fetches a file and returns its contents as string.
 *
 * @remarks
 * This is a wrapper around the native `fetch` API that handles the response status check
 * and text extraction. It sets the `Accept` header based on the provided mime type.
 *
 * @category Fetch
 * @example
 * ```ts
 * const text = await fetchText('https://example.com/data.txt')
 * ```
 *
 * @param url - The file location.
 * @param mime - The HTTP Request Accept header. Defaults to 'text/*'.
 * @returns The file contents as a string.
 * @throws {TypeError} If `mime` is not a string.
 * @throws {Error} If the fetch fails or the response status is not OK (200-299).
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API | Fetch API}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response/text | Response.text()}
 */
async function fetchText(url: URL | string, mime: string = 'text/*') {
    if (!isStr(mime)) {
        throw typeErr('mime', 'a string', mime)
    }
    const response = await fetch(url, { headers: { Accept: mime } })
    if (!response.ok) {
        throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`)
    }
    return response.text()
}

/**
 * Fetches an HTML template and returns it as a wrapped `DocumentFragment`.
 *
 * @remarks
 * Because this function returns a detached fragment, you can load templates:
 * - eagerly (initialize the promise, reuse the result many times)
 * - lazily (fetch only when a component connects)
 *
 * The returned `JJDF` is suitable for both Shadow DOM and Light DOM flows.
 *
 * @category Fetch
 * @example
 * ```ts
 * // Eager loading: fetch once at module scope, then reuse
 * const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))
 *
 * class MyCard extends HTMLElement {
 *     #root
 *
 *     async connectedCallback() {
 *         this.#root = JJHE.from(this).setShadow('open').getShadow(true)
 *         this.#root.init(await templatePromise)
 *     }
 * }
 * ```
 *
 * @example
 * ```ts
 * // Lazy loading: initialize once on first connection
 * class MyLazyCard extends HTMLElement {
 *     static #templatePromise
 *     #root
 *
 *     async connectedCallback() {
 *         this.#root = JJHE.from(this).setShadow('open').getShadow(true)
 *
 *         if (!MyLazyCard.#templatePromise) {
 *             MyLazyCard.#templatePromise = fetchTemplate(import.meta.resolve('./my-lazy-card.html'))
 *         }
 *
 *         this.#root.init(await MyLazyCard.#templatePromise)
 *     }
 * }
 * ```
 *
 * @param url - The HTML file location.
 * @returns A `JJDF` wrapping a `DocumentFragment` parsed from the fetched HTML.
 * @throws {Error} If the fetch fails or the response is not ok or the retrieved content cannot be parsed as HTML.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/createContextualFragment | Range.createContextualFragment}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment | DocumentFragment}
 */
export async function fetchTemplate(url: URL | string): Promise<JJDF> {
    try {
        const htmlStr = await fetchText(url, 'text/html')
        return JJDF.from(document.createRange().createContextualFragment(htmlStr))
    } catch (err) {
        throw new Error(`Failed to fetch or process HTML from ${url}`, { cause: err })
    }
}

/**
 * Fetches a CSS file and constructs a CSSStyleSheet.
 *
 * @remarks
 * This is particularly useful for Constructable Stylesheets, which can be shared across Shadow DOM boundaries.
 *
 * @category Fetch
 * @example
 * ```ts
 * const sheet = await fetchStyle('./component.css')
 * shadowRoot.adoptedStyleSheets = [sheet]
 * ```
 *
 * @param url - The CSS file location.
 * @returns The CSSStyleSheet object constructed from the CSS contents.
 * @throws {Error} If the fetch fails or the retrieved content cannot be converted to a CSSStyleSheet.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet | CSSStyleSheet}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets | adoptedStyleSheets}
 */
export async function fetchStyle(url: URL | string): Promise<CSSStyleSheet> {
    try {
        const sheet = new CSSStyleSheet()
        return await sheet.replace(await fetchText(url, 'text/css'))
    } catch (err) {
        throw new Error(`Failed to fetch or convert CSS string to CSSStyleSheet from ${url}`, { cause: err })
    }
}
