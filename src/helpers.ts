import { isInstance, isFn, hasProp, isStr } from 'jty'
import { JJHE, JJDF } from './wrappers/index.js'
import { cssToStyle, fileExt } from './util.js'
import { typeErr, errMsg } from './internal.js'
import { keb2cam } from './case.js'

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
export async function fetchText(url: URL | string, mime: string = 'text/*') {
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
 * Fetches the contents of a HTML file as string.
 *
 * @remarks
 * Useful for loading HTML templates dynamically.
 * You can use `import.meta.resolve('./relative-path-to.html')` to resolve paths relative to the current module.
 *
 * @category Fetch
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
 * @category Fetch
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
 * Fetches an HTML template and returns it as a wrapped `DocumentFragment`.
 *
 * @remarks
 * This helper combines {@link fetchHtml} with `Range.createContextualFragment()` and wraps the
 * resulting fragment in `JJDF`.
 *
 * Because it returns a detached fragment, you can load templates:
 * - eagerly (fetch once, reuse many times)
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
 *         this.#root = JJHE.from(this).initShadow('open').shadow
 *         this.#root.addTemplate(await templatePromise)
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
 *         this.#root = JJHE.from(this).initShadow('open').shadow
 *
 *         if (!MyLazyCard.#templatePromise) {
 *             MyLazyCard.#templatePromise = fetchTemplate(import.meta.resolve('./my-lazy-card.html'))
 *         }
 *
 *         this.#root.addTemplate(await MyLazyCard.#templatePromise)
 *     }
 * }
 * ```
 *
 * @param url - The HTML file location.
 * @returns A `JJDF` wrapping a `DocumentFragment` parsed from the fetched HTML.
 * @throws {Error} If the fetch fails or the response is not ok.
 * @see {@link fetchHtml} for fetching HTML content
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/createContextualFragment | Range.createContextualFragment}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment | DocumentFragment}
 */
export async function fetchTemplate(url: URL | string): Promise<JJDF> {
    const html = await fetchHtml(url)
    return JJDF.from(document.createRange().createContextualFragment(html))
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
 * @throws {Error} If the fetch fails.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet | CSSStyleSheet}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets | adoptedStyleSheets}
 */
export async function fetchStyle(url: URL | string): Promise<CSSStyleSheet> {
    return await cssToStyle(await fetchCss(url))
}

/**
 * A helper to bridge the attribute world (kebab-case) to the property world (camelCase).
 * It works in tandem with browser's `observedAttributes` feature which triggers
 * `attributeChangedCallback`.
 *
 * @remarks
 * Your custom component class MUST define `static observedAttributes[]` otherwise `attributeChangedCallback` won't trigger.
 * `observedAttributes` should contain kebab-based attribute names.
 *
 * @category Components
 * @example
 * ```ts
 * class MyComponent extends HTMLElement {
 *     static observedAttributes = ['user-name', 'counter']
 *     userName = '' // Property MUST exist on the instance (or prototype setter)
 *     #counter = 0  // You can also use private properties together with getter/setters
 *
 *     attributeChangedCallback(name, oldValue, newValue) {
 *         attr2prop(this, name, oldValue, newValue)
 *     }
 *
 *     get counter() {
 *         return this.#counter
 *     }
 *
 *     set counter(value) {
 *         this.#counter = value
 *         this.#render() // You can call your render function to update the DOM
 *     }
 *
 *     #render() {
 *         const shadow = JJHE.from(this).shadow
 *         if (shadow) {
 *              shadow.find('#user').setText(this.userName)
 *              shadow.find('#counter').setText(this.counter)
 *         }
 *     }
 * }
 * ```
 *
 * @param instance - A reference to the common component instance
 * @param name - kebab-case and in lower case exactly as it appears in `observedAttributes`.
 * @param oldValue - The previous value of the attribute.
 * @param newValue - The new value of the attribute.
 * @returns `true` if it tried to set the attribute; otherwise `false`.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes | Responding to attribute changes}
 */
export function attr2prop(instance: HTMLElement, name: string, oldValue: unknown, newValue: unknown) {
    if (!isInstance(instance, HTMLElement)) {
        throw typeErr(
            'instance',
            'an HTMLElement',
            instance,
            'Call attr2prop(this, ...) from attributeChangedCallback on a custom element instance.',
        )
    }
    // Called when observed attributes change.
    if (oldValue !== newValue) {
        const propName = keb2cam(name)
        if (hasProp(instance, propName)) {
            instance[propName] = newValue
            return true
        }
    }
    return false
}

/**
 * Registers the custom element with the browser and waits till it is defined.
 *
 * @category Components
 * @example
 * ```ts
 * class MyComponent extends HTMLElement {}
 * await registerComponent('my-component', MyComponent)
 * ```
 * Another convention is to have a `static async register()` function in the Custom Component.
 * ```ts
 * export class MyComponent extends HTMLElement {
 *     static async register() {
 *         return registerComponent('my-component', MyComponent)
 *     }
 * }
 * ```
 * That way, you can import multiple components and do a `Promise.all()` on all their `.register()`s.
 * ```ts
 * import { MyComponent, YourComponent, TheirComponent } ...
 * await Promise.all([
 *     MyComponent.register(),
 *     YourComponent.register(),
 *     TheirComponent.register(),
 * ])
 * ```
 *
 * @throws {TypeError} If name is not a string or constructor is not a function
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define | customElements.define}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/whenDefined | customElements.whenDefined}
 */
export async function registerComponent(
    name: string,
    constructor: CustomElementConstructor,
    options?: ElementDefinitionOptions,
): Promise<void> {
    if (!isStr(name)) {
        throw typeErr('name', 'a string', name, 'Use a custom-element tag name like "my-widget".')
    }
    if (!isFn(constructor)) {
        throw typeErr(
            'constructor',
            'a function',
            constructor,
            'Pass the custom element class itself, e.g. registerComponent("my-widget", MyWidget).',
        )
    }
    if (!customElements.get(name)) {
        customElements.define(name, constructor, options)
        await customElements.whenDefined(name)
    }
}
