/** Used to Give the UI a moment to update */
export function nextAnimationFrame(): Promise<number> {
    return new Promise((resolve) => requestAnimationFrame(resolve))
}

export function on(target: EventTarget, eventName: string, handler: EventListenerOrEventListenerObject): void {
    target.addEventListener(eventName, handler)
}

export function off(target: EventTarget, eventName: string, handler: EventListenerOrEventListenerObject): void {
    target.removeEventListener(eventName, handler)
}

export async function ensureComponent(
    name: string,
    constructor: CustomElementConstructor,
): Promise<CustomElementConstructor> {
    if (!customElements.get(name)) {
        customElements.define(name, constructor)
        await customElements.whenDefined(name)
        return constructor
    }
    return constructor
}
