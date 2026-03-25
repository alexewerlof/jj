import { isInstance, isStr } from 'jty'
import { JJHE } from './wrappers/index.js'
import { fileExt } from './util.js'
import { createCustomEventInternal, typeErr, errMsg } from './internal.js'

/**
 * Tries to find the best match for the link.as attribute when it's omitted
 * @param href a relative, absolute, or URL resource
 * @returns a valid value for the link.as attribute
 * @throws {TypeError} if it cannot guess a valid value for the 'link.as' attribute
 */
function autoAs(href: string): 'fetch' | 'style' | 'script' {
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
            throw new Error(`No heuristic exists to deduce the 'as' attribute for the URL: ${href}`)
    }
}

/**
 * Creates a `CustomEvent` with JJ's default bubbling and Shadow DOM settings.
 *
 * @remarks
 * Native `CustomEvent` defaults to `bubbles: false` and `composed: false`.
 * JJ defaults both to `true` because cross-component custom events commonly need
 * to bubble out of Shadow DOM boundaries.
 *
 * Pass `options` to override those defaults when you need a local-only event.
 *
 * @category Events
 * @param eventName - The event type name.
 * @param detail - Optional payload exposed as `event.detail`.
 * @param options - Additional `CustomEvent` options excluding `detail`.
 * @returns A configured `CustomEvent` instance.
 * @throws {TypeError} If `eventName` is not a string.
 * @example
 * ```ts
 * const event = customEvent('todo-toggle', { id: '123', done: true })
 * element.dispatchEvent(event)
 * ```
 *
 * @example
 * ```ts
 * const localOnly = customEvent('panel-ready', undefined, {
 *     bubbles: false,
 *     composed: false,
 * })
 * ```
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent | CustomEvent()}
 */
export function customEvent<T = unknown>(
    eventName: string,
    detail?: T,
    options?: Omit<CustomEventInit<T>, 'detail'>,
): CustomEvent<T> {
    return createCustomEventInternal(eventName, detail, options)
}

/**
 * Creates a `<link>` element for prefetching or preloading resources.
 *
 * @remarks
 * This function validates the input arguments and returns a wrapped `JJHE` instance.
 * It does not append the element to the document.
 *
 * @category Fetch
 * @param href - The URL of the resource.
 * @param rel - The relationship of the linked resource ('prefetch' or 'preload').
 * @param as - The type of content being loaded ('fetch' for HTML, 'style' for CSS, or 'script' for JavaScript files).
 * If it's not provided or set to a falsy value, it is set automatically based on the file extension of the href parameter.
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
        if (!isInstance(href, URL)) {
            throw typeErr('href', 'a string or URL', href, 'Pass a URL object or a path string like "/page.html".')
        }
        href = href.toString()
    }

    if (!['prefetch', 'preload'].includes(rel)) {
        throw new RangeError(
            errMsg(
                'rel',
                `'prefetch' or 'preload'`,
                rel,
                'Use "prefetch" for future navigation or "preload" for current-page resources.',
            ),
        )
    }

    if (!as) {
        try {
            as = autoAs(href)
        } catch (cause) {
            throw new Error(
                errMsg(
                    'as',
                    `'fetch', 'style', or 'script'`,
                    as,
                    `Failed to guess the 'as' attribute from the URL: ${href}. Please provide it explicitly.`,
                ),
                { cause },
            )
        }
    }

    if (!['fetch', 'style', 'script'].includes(as)) {
        throw new RangeError(
            errMsg(
                'as',
                `'fetch', 'style', or 'script'`,
                as,
                'Use a valid value or omit it to auto-detect from the URL.',
            ),
        )
    }

    return JJHE.create('link').setAttrMulti({
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
 * @category Fetch
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
 * @throws {Error} If it fails to create the link element or append it to the document head.
 * @see {@link createLinkPre} to create link elements
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload | Link types: preload}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/prefetch | Link types: prefetch}
 */
export function addLinkPre(...args: Parameters<typeof createLinkPre>) {
    try {
        const link = createLinkPre(...args)
        document.head.append(link.ref)
        return link
    } catch (cause) {
        throw new Error(`Failed to create or add <link> to document head`, { cause })
    }
}
