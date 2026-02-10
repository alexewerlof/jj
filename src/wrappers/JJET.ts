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
    #boundHandlers = new WeakMap<EventListenerOrEventListenerObject, EventListenerOrEventListenerObject>()

    /**
     * Creates a JJET instance.
     *
     * @param ref - The EventTarget to wrap.
     * @throws {TypeError} If `ref` is not an EventTarget.
     */
    constructor(ref: T) {
        if (!isA(ref, EventTarget)) {
            throw new TypeError(`JJET expects an EventTarget instance. Got ${ref} (${typeof ref}). `)
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
     * Gets or creates a bound version of the handler.
     *
     * @remarks
     * Bound handlers are cached in a WeakMap to ensure `off()` can properly remove listeners.
     * When the original handler is garbage collected, the bound version is automatically removed.
     *
     * @param handler - The event handler to bind.
     * @returns The bound handler, or null if the input is null.
     */
    #getBoundHandler(handler: EventListenerOrEventListenerObject | null): EventListenerOrEventListenerObject | null {
        if (handler === null) return null

        let bound = this.#boundHandlers.get(handler)
        if (!bound) {
            // Bind the handler to this JJET instance
            if (typeof handler === 'function') {
                bound = handler.bind(this)
            } else {
                // EventListenerObject with handleEvent method
                bound = { handleEvent: handler.handleEvent.bind(this) }
            }
            this.#boundHandlers.set(handler, bound)
        }
        return bound
    }

    /**
     * Adds an event listener.
     *
     * @remarks
     * The handler is automatically bound to this JJET instance, so `this` inside the handler
     * refers to the JJET instance, not the DOM element. To access the DOM element, use `this.ref`.
     *
     * @example
     * ```ts
     * JJET.from(window).on('resize', function() {
     *   console.log(this) // JJET instance
     *   console.log(this.ref) // window object
     * })
     * ```
     * @param eventName - The name of the event.
     * @param handler - The event handler.
     * @param options - Optional event listener options.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener | EventTarget.addEventListener}
     */
    on(eventName: string, handler: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions): this {
        const boundHandler = this.#getBoundHandler(handler)
        this.ref.addEventListener(eventName, boundHandler, options)
        return this
    }

    /**
     * Removes an event listener.
     *
     * @remarks
     * Pass the same handler reference that was used in `on()` to properly remove the listener.
     *
     * @example
     * ```ts
     * const handler = function() { console.log(this) }
     * JJET.from(window).on('resize', handler)
     * JJET.from(window).off('resize', handler)
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
        const boundHandler = this.#getBoundHandler(handler)
        this.ref.removeEventListener(eventName, boundHandler, options)
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
