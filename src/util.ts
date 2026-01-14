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
 * Adds an event listener to a target.
 *
 * @param target - The event target.
 * @param eventName - The name of the event.
 * @param handler - The event handler.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener | EventTarget.addEventListener}
 */
export function on(target: EventTarget, eventName: string, handler: EventListenerOrEventListenerObject): void {
    target.addEventListener(eventName, handler)
}

/**
 * Removes an event listener from a target.
 *
 * @param target - The event target.
 * @param eventName - The name of the event.
 * @param handler - The event handler.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener | EventTarget.removeEventListener}
 */
export function off(target: EventTarget, eventName: string, handler: EventListenerOrEventListenerObject): void {
    target.removeEventListener(eventName, handler)
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
