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

    /**
     * Runs a function in the context of this JJET instance.
     *
     * @example
     * ```ts
     * node.run(function() {
     *   console.log(this.ref)
     * })
     * ```
     * @remarks
     * If you want to access the current JJ* instance using `this` keyword, you SHOULD use a `function` not an arrow function.
     * If the function throws, `run()` doesn't swallow the exception.
     * So if you're expecting an error, make sure to wrap it in a `try..catch` block and handle the exception.
     * If the function returns a promise, you can `await` on the response.
     *
     * @param fn - The function to run. `this` inside the function will refer to this JJET instance.
     * @param args - Arguments to pass to the function.
     * @returns The return value of the function.
     */
    run<R, Args extends any[]>(fn: (this: this, ...args: Args) => R, ...args: Args): R {
        return fn.call(this, ...args)
    }
}
