import { isA, isStr } from 'jty'
import { JJHE } from './JJHE.js'
import { Wrappable } from './types.js'
import { cssToStyle, fileExt } from './util.js'

/**
 * Hyperscript helper to create JJHE instances.
 * The `h` function provides a concise way to create DOM wrappers with attributes and children,
 * similar to hyperscript helpers found in other libraries.
 *
 *
 * @remarks
 * It returns a `JJHE` instance which wraps the native HTMLElement.
 *
 * You may recognize it from other libraries:
 * - [React](https://react.dev/reference/react/createElement)
 * - [Vue](https://vuejs.org/guide/extras/render-function)
 * - [Hyperscript](https://github.com/hyperhype/hyperscript)
 * - [Angular](https://angular.dev/guide/components/programmatic-rendering)
 * - [Lit](https://lit.dev/docs/components/rendering/)
 *
 * This is not exactly a replacement, but it roughly follows the same idea.
 *
 * @example
 * ```ts
 * // Create a simple div
 * h('div', { id: 'app' }, 'Hello World')
 *
 * // Create a nested structure
 * h('ul', { class: 'list' },
 *   h('li', null, 'Item 1'),
 *   h('li', null, 'Item 2')
 * )
 * ```
 *
 * @param tagName - The HTML tag name.
 * @param attributes - Attributes to set on the element. Can be null or undefined.
 * @param children - Children to append (strings, nodes, or other JJHE instances).
 * @returns The created JJHE instance.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement | document.createElement}
 */
export function h(tagName: string, attributes?: Record<string, string> | null, ...children: Wrappable[]): JJHE {
    const ret = JJHE.fromTag(tagName).append(...children)
    if (attributes) {
        ret.setAttrs(attributes)
    }
    return ret
}

/**
 * Tries to find the best match for the link.as attribute when it's omitted
 * @param href a relative, absolute, or URL resource
 * @returns a valid value for the link.as attribute
 * @throws {TypeError} if it cannot guess a valid value for the 'link.as' attribute
 */
function linkAs(href: string): 'fetch' | 'style' | 'script' {
    switch (fileExt(href)) {
        case 'html':
        case 'htm':
        case 'md':
            return 'fetch'
        case 'css':
            return 'style'
        case 'js':
        case 'mjs':
        case 'cjs':
            return 'script'
        default:
            throw new Error(`No 'as' attribute was specified and we failed to guess it from the URL: ${href}`)
    }
}

/**
 * Creates a `<link>` element for prefetching or preloading resources.
 *
 * @remarks
 * This function validates the input arguments and returns a wrapped `JJHE` instance.
 * It does not append the element to the document.
 *
 * @param href - The URL of the resource.
 * @param rel - The relationship of the linked resource ('prefetch' or 'preload').
 * @param as - The type of content being loaded ('fetch' for HTML, 'style' for CSS, or 'script' for JavaScript files).
 * If it's not provided or set to a falsy value, it runs heuristics to find the best match from the href parameter.
 *
 * @returns The JJHE instance representing the link element. The `<link>` is accessible via `.ref`
 * @throws {TypeError} If `href` is not a string or URL.
 * @throws {RangeError} If `rel` or `as` are not valid values.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload | Link types: preload}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/prefetch | Link types: prefetch}
 */
export function createLinkPre(
    href: string | URL,
    rel: 'prefetch' | 'preload',
    as?: 'fetch' | 'style' | 'script',
): JJHE {
    if (!isStr(href)) {
        if (!isA(href, URL)) {
            throw new TypeError(`Expected a string or URL. Got ${href} (${typeof href})`)
        }
        href = href.toString()
    }

    if (!['prefetch', 'preload'].includes(rel)) {
        throw new RangeError(`rel should be one of 'prefetch' or 'preload'. Got ${rel} (${typeof rel})`)
    }

    if (!as) {
        as = linkAs(href)
        if (!as) {
            throw new Error(`No 'as' attribute was specified and we failed to guess it from the URL: ${href}`)
        }
    }

    if (!['fetch', 'style', 'script'].includes(as)) {
        throw new RangeError(`as should be one of 'fetch' or 'style'. Got ${as} (${typeof as})`)
    }

    return JJHE.fromTag('link').setAttrs({
        href,
        rel,
        as,
    })
}

/**
 * Adds a `<link>` tag to the document head for prefetching or preloading resources.
 *
 * @remarks
 * This function helps in optimizing performance by telling the browser to fetch resources
 * that might be needed later (prefetch) or are needed immediately (preload).
 *
 * Please refer to {@link createLinkPre} for more details.
 *
 * @example
 * ```ts
 * // Preload a script
 * addLinkPre('https://example.com/script.js', 'preload', 'script')
 *
 * // Prefetch a future page's CSS
 * addLinkPre('/next-page.css', 'prefetch', 'style')
 * ```
 *
 * @param args - The arguments to be passed to {@link createLinkPre}.
 * @returns The JJHE instance representing the link element.
 * @throws {TypeError} If `href` is not a string or URL.
 * @throws {RangeError} If `rel` or `as` are not valid values.
 * @see {@link createLinkPre}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload | Link types: preload}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/prefetch | Link types: prefetch}
 */
export function addLinkPre(...args: Parameters<typeof createLinkPre>) {
    const link = createLinkPre(...args)
    document.head.append(link.ref)
    return link
}

/**
 * Fetches a file and returns its contents as string.
 *
 * @remarks
 * This is a wrapper around the native `fetch` API that handles the response status check
 * and text extraction. It sets the `Accept` header based on the provided mime type.
 *
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
export async function fetchText(url: URL | string, mime: string = 'text/*') {
    if (!isStr(mime)) {
        throw new TypeError(`Expected a string mime like 'text/html' or 'text/css'. Got ${mime} (${typeof mime})`)
    }
    const response = await fetch(url, { headers: { Accept: mime } })
    if (!response.ok) {
        throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`)
    }
    return response.text()
}

/**
 * Fetches the contents of a HTML file as string.
 *
 * @remarks
 * Useful for loading HTML templates dynamically.
 * You can use `import.meta.resolve('./relative-path-to.html')` to resolve paths relative to the current module.
 *
 * @example
 * ```ts
 * const template = await fetchHtml('./template.html')
 * ```
 *
 * @param url - The HTML file location.
 * @returns The file content as a string.
 * @throws {Error} If the response is not ok.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types | MIME types}
 */
export async function fetchHtml(url: URL | string): Promise<string> {
    return await fetchText(url, 'text/html')
}

/**
 * Fetches the contents of a CSS file as string.
 *
 * @remarks
 * You can use `import.meta.resolve('./relative-path-to.css')` inside components to resolve relative paths.
 *
 * @example
 * ```ts
 * const css = await fetchCss('./style.css')
 * ```
 *
 * @param url - The CSS file location.
 * @returns The file content as a string.
 * @throws {Error} If the response is not ok.
 */
export async function fetchCss(url: URL | string): Promise<string> {
    return await fetchText(url, 'text/css')
}

/**
 * Fetches a CSS file and constructs a CSSStyleSheet.
 *
 * @remarks
 * This is particularly useful for Constructable Stylesheets, which can be shared across Shadow DOM boundaries.
 *
 * @example
 * ```ts
 * const sheet = await fetchStyle('./component.css')
 * shadowRoot.adoptedStyleSheets = [sheet]
 * ```
 *
 * @param url - The CSS file location.
 * @returns The CSSStyleSheet object constructed from the CSS contents.
 * @throws {Error} If the fetch fails.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet | CSSStyleSheet}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets | adoptedStyleSheets}
 */
export async function fetchStyle(url: URL | string): Promise<CSSStyleSheet> {
    return await cssToStyle(await fetchCss(url))
}
