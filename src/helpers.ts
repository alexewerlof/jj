import { isInstance, isStr } from 'jty'
import { JJHE } from './wrappers/index.js'
import { fileExt } from './util.js'
import { typeErr, errMsg } from './internal.js'

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
        as = linkAs(href)
        if (!as) {
            throw new Error(`Could not guess 'as' attribute from URL: ${href}`)
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

    return JJHE.create('link').setAttr({
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
 * @see {@link createLinkPre} to create link elements
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload | Link types: preload}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/prefetch | Link types: prefetch}
 */
export function addLinkPre(...args: Parameters<typeof createLinkPre>) {
    const link = createLinkPre(...args)
    document.head.append(link.ref)
    return link
}
