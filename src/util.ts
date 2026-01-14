/** Used to Give the UI a moment to update */
export function nextAnimationFrame(): Promise<number> {
    return new Promise((resolve) => requestAnimationFrame(resolve))
}

/**
 * Adds an event listener to a target.
 * @param target The event target.
 * @param eventName The name of the event.
 * @param handler The event handler.
 */
export function on(target: EventTarget, eventName: string, handler: EventListenerOrEventListenerObject): void {
    target.addEventListener(eventName, handler)
}

/**
 * Removes an event listener from a target.
 * @param target The event target.
 * @param eventName The name of the event.
 * @param handler The event handler.
 */
export function off(target: EventTarget, eventName: string, handler: EventListenerOrEventListenerObject): void {
    target.removeEventListener(eventName, handler)
}

/**
 * Converts a CSS string to a CSSStyleSheet (suitable for attaching to ShadowRoot for example)
 */
export async function cssToStyle(css: string): Promise<CSSStyleSheet> {
    const sheet = new CSSStyleSheet()
    return await sheet.replace(css)
}
