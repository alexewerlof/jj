import { isA, isStr } from 'jty'
import { cssToStyle } from './util.js'
import { JJHE } from './JJHE.js'

/**
 * Fetches a file and returns its contents as string
 * @param url the file location
 * @param mime the HTTP Request Accept header
 * @returns the file contents as a string
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
 * Fetches the contents of a HTML file as string
 * @param url the HTML file location
 * @returns the file content in string
 * @throws if the response is not ok or there's a problem getting the content in text format
 * @remark you can use `import.meta.resolve('./relative-path-to.html')` inside components
 */
export async function fetchHtml(url: URL | string): Promise<string> {
    return await fetchText(url, 'text/html')
}

/**
 * Fetches the contents of a CSS file as string
 * @param url the CSS file location
 * @returns the file content in string
 * @throws if the response is not ok or there's a problem getting the content in text format
 * @remark you can use `import.meta.resolve('./relative-path-to.css')` inside components
 */
export async function fetchCss(url: URL | string): Promise<string> {
    return await fetchText(url, 'text/css')
}

/**
 * Fetches a CSS file and constructs a CSSStyleSheet (suitable for attaching to ShadowRoot for example)
 * @param url the CSS file location
 * @returns the CSSStyleSheet object constructed from the CSS contents
 */
export async function fetchStyle(url: URL | string): Promise<CSSStyleSheet> {
    return await cssToStyle(await fetchCss(url))
}

/**
 * Adds a <link> tag to the document head for prefetching or preloading resources.
 * @param href The URL of the resource.
 * @param rel The relationship of the linked resource ('prefetch' or 'preload').
 * @param as The type of content being loaded ('fetch', 'style', or 'script'). Defaults to 'fetch'.
 * @returns The JJHE instance representing the link element.
 * @throws {TypeError} If href is not a string or URL.
 * @throws {RangeError} If rel or as are not valid values.
 */
export function addLinkPre(
    href: string | URL,
    rel: 'prefetch' | 'preload',
    as: 'fetch' | 'style' | 'script' = 'fetch',
) {
    if (!isStr(href)) {
        if (!isA(href, URL)) {
            throw new TypeError(`Expected a string or URL. Got ${href} (${typeof href})`)
        }
        href = href.toString()
    }
    if (!['prefetch', 'preload'].includes(rel)) {
        throw new RangeError(`rel should be one of 'prefetch' or 'preload'. Got ${rel} (${typeof rel})`)
    }
    if (!['fetch', 'style', 'script'].includes(as)) {
        throw new RangeError(`as should be one of 'fetch' or 'style'. Got ${as} (${typeof as})`)
    }
    const link = JJHE.fromTag('link').setAttrs({
        rel,
        href,
        as,
    })
    document.head.append(link.ref)
    return link
}
