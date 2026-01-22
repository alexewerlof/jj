import { isStr } from 'jty'

/**
 * Returns the file extension
 *
 * @remarks
 * This convenience function is primarily used to guess the 'as' attribute of
 * a link preload/prefetch behind the scene.
 *
 * @example
 * ```ts
 * fileExt('file.txt') // => 'txt'
 * fileExt('https://www.alexewerlof.com/path/to/file.js') // => 'js'
 * ```
 *
 * @param path - absolute, relative, or URL path to a file
 * @returns the extension name in lowercase and without any dot prefix
 * @throws {TypeError} If path is not a string.
 */
export function fileExt(path: string): string {
    if (!isStr(path)) {
        throw new TypeError(`Expected a string file path. Got ${path} (${typeof path})`)
    }
    const lastDotIndex = path.lastIndexOf('.')
    if (lastDotIndex === -1) {
        return ''
    }
    const ext = path.slice(lastDotIndex + 1)
    if (ext.indexOf('/') !== -1) {
        return ''
    }
    return ext.toLowerCase().trim()
}

/**
 * Returns a promise that resolves before the next repaint.
 *
 * @remarks
 * Used to give the UI a moment to update.
 *
 * @example
 * ```ts
 * await nextAnimationFrame()
 * ```
 *
 * @returns A promise that resolves with the timestamp.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame | requestAnimationFrame}
 */
export function nextAnimationFrame(): Promise<number> {
    return new Promise((resolve) => requestAnimationFrame(resolve))
}

/**
 * Returns a promise that resolves after the specified delay.
 *
 * @remarks
 * Uses `setTimeout` to delay execution. When used with 0ms, it defers
 * execution to the next macro-task, allowing the event loop to cycle.
 *
 * @example
 * ```ts
 * await sleep(100)
 * await sleep() // equivalent to setTimeout(..., 0)
 * ```
 *
 * @param ms - The delay in milliseconds. Defaults to 0.
 * @returns A promise that resolves after the delay.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/setTimeout | setTimeout}
 */
export function sleep(ms: number = 0): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Adds an event listener to a target.
 *
 * @example
 * ```ts
 * on(window, 'resize', () => console.log('resized'))
 * ```
 *
 * @param target - The event target.
 * @param eventName - The name of the event.
 * @param handler - The event handler.
 * @param options - Optional event listener options.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener | EventTarget.addEventListener}
 */
export function on(
    target: EventTarget,
    eventName: string,
    handler: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions,
): void {
    target.addEventListener(eventName, handler, options)
}

/**
 * Removes an event listener from a target.
 *
 * @example
 * ```ts
 * off(window, 'resize', handler)
 * ```
 *
 * @param target - The event target.
 * @param eventName - The name of the event.
 * @param handler - The event handler.
 * @param options - Optional event listener options or boolean.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener | EventTarget.removeEventListener}
 */
export function off(
    target: EventTarget,
    eventName: string,
    handler: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
): void {
    target.removeEventListener(eventName, handler, options)
}

/**
 * Converts a CSS string to a CSSStyleSheet.
 *
 * @remarks
 * Suitable for attaching to ShadowRoot via `adoptedStyleSheets`.
 *
 * @example
 * ```ts
 * const sheet = await cssToStyle('p { color: red; }')
 * shadowRoot.adoptedStyleSheets = [sheet]
 * ```
 *
 * @param css - The CSS string.
 * @returns A promise resolving to the created CSSStyleSheet.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/replace | CSSStyleSheet.replace}
 */
export async function cssToStyle(css: string): Promise<CSSStyleSheet> {
    const sheet = new CSSStyleSheet()
    return await sheet.replace(css)
}
