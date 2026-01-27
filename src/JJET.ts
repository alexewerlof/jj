import { isA } from 'jty'

/**
 * Wraps a DOM EventTarget.
 *
 * @remarks
 * This is the base class for all JJ wrappers that wrap an EventTarget.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget | EventTarget}
 */
export class JJET<T extends EventTarget = EventTarget> {
    static from(ref: EventTarget) {
        return new JJET(ref)
    }

    #ref!: T

    /**
     * Creates a JJET instance.
     *
     * @param ref - The EventTarget to wrap.
     * @throws {TypeError} If `ref` is not an EventTarget.
     */
    constructor(ref: T) {
        if (!isA(ref, EventTarget)) {
            throw new TypeError(`Expected an EventTarget. Got ${ref} (${typeof ref})`)
        }
        this.#ref = ref
    }

    /**
     * Gets the underlying DOM object.
     */
    get ref() {
        return this.#ref
    }

    /**
     * Adds an event listener.
     *
     *  * @example
     * ```ts
     * JJET.from(window).on('resize', () => console.log('resized'))
     * ```
     * @param eventName - The name of the event.
     * @param handler - The event handler.
     * @param options - Optional event listener options.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener | EventTarget.addEventListener}
     */
    on(eventName: string, handler: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions): this {
        this.ref.addEventListener(eventName, handler, options)
        return this
    }

    /**
     * Removes an event listener.
     *
     *  * @example
     * ```ts
     * JJET.from(window).off('resize', previouslyAttachedHandler)
     * ```
     * @param eventName - The name of the event.
     * @param handler - The event handler.
     * @param options - Optional event listener options or boolean.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener | EventTarget.removeEventListener}
     */
    off(
        eventName: string,
        handler: EventListenerOrEventListenerObject | null,
        options?: EventListenerOptions | boolean,
    ): this {
        this.ref.removeEventListener(eventName, handler, options)
        return this
    }

    /**
     * Dispatches an Event at the specified EventTarget.
     *
     * @param event - The Event object to dispatch.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent | EventTarget.dispatchEvent}
     */
    trigger(event: Event): this {
        this.ref.dispatchEvent(event)
        return this
    }
}
