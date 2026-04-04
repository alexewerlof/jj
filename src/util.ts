/**
 * Returns a promise that resolves before the next repaint.
 *
 * @remarks
 * Used to give the UI a moment to update.
 *
 * @category Utilities
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
 * @category Utilities
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
 * Converts a CSS string to a CSSStyleSheet.
 *
 * @remarks
 * Suitable for attaching to ShadowRoot via `adoptedStyleSheets`.
 *
 * @category Utilities
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
