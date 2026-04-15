import { isInstance, typeErr } from '../internal.js'

/**
 * Wraps a DOM EventTarget.
 *
 * @remarks
 * This is the base class for all JJ wrappers that wrap an EventTarget.
 *
 * @category Wrappers
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget | EventTarget}
 */
export class JJET<T extends EventTarget = EventTarget> {
    /**
     * Creates a JJET instance from an EventTarget reference.
     *
     * @param ref - The EventTarget instance.
     * @returns A new JJET instance.
     * @see {@link constructor} for input validation behavior.
     */
    static from(ref: EventTarget) {
        return new JJET(ref)
    }

    #ref!: T

    /**
     * Creates a JJET instance.
     *
     * @param ref - The EventTarget to wrap.
     * @throws {TypeError} If `ref` is not an EventTarget.
     * @see {@link JJET.from} for the factory form.
     */
    constructor(ref: T) {
        if (!isInstance(ref, EventTarget)) {
            throw typeErr('ref', 'an EventTarget instance', ref)
        }
        this.#ref = ref
    }

    /**
     * Gets the underlying DOM object.
     *
     * @see {@link run} for fluent callbacks that can also access this same wrapped target.
     */
    get ref() {
        return this.#ref
    }

    /**
     * Adds an event listener.
     *
     * @example
     * ```ts
     * const onResize = () => {
     *     console.log('resized')
     * }
     *
     * JJET.from(window).on('resize', onResize)
     * ```
     *
     * @example
     * ```ts
     * const target = {
     * dispatching a plain Event object.
     *     increment() {
     *         this.count++
     *     },
     * }
     *
     * @param options Optional event initialization dictionary.
     * ```
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Event/Event | Event()} for details on event options.
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
     * @remarks
     * Pass the same handler reference that was used in `on()` to properly remove the listener.
     *
     * @example
     * ```ts
     * const onResize = () => {
     *     console.log('resized')
     * }
     *
     * const win = JJET.from(window)
     * win.on('resize', onResize)
     * win.off('resize', onResize)
     * ```
     *
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
     * @param event - The Event object to dispatch. Since CustomEvent extends Event, you can also dispatch CustomEvent instances here.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent | EventTarget.dispatchEvent}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent | CustomEvent} for creating custom events with payloads.
     * @see {@link triggerEvent} for a convenience wrapper that creates and dispatches an Event in one step.
     * @see {@link triggerCustomEvent} for a convenience wrapper that creates and dispatches a CustomEvent with JJ's default settings in one step.
     */
    trigger(event: Event): this {
        try {
            this.ref.dispatchEvent(event)
            return this
        } catch (cause) {
            throw new Error(`Failed to trigger the event ${JSON.stringify(event)}`, { cause })
        }
    }

    /**
     * Creates a new `Event` and dispatches on the wrapped target.
     *
     * @remarks
     * This is a convenience wrapper around {@link trigger} for the common case of
     * dispatching a plain Event object.
     *
     * The created event defaults to `bubbles: true` and `composed: true`.
     * Pass `options` to override those defaults.
     *
     * @param type The name identifying the type of the event for example 'click'
     * @param options Optional event initialization dictionary.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Event/Event | Event()} for details on event options.
     */
    triggerEvent(type: string, options?: EventInit | undefined): this {
        return this.trigger(new Event(type, { bubbles: true, composed: true, ...options }))
    }

    /**
     * Creates a new `CustomEvent` and dispatches on the wrapped target.
     *
     * @remarks
     * This is a convenience wrapper around {@link trigger} for the common case of
     * dispatching a payload-bearing custom event.
     *
     * The created event defaults to `bubbles: true` and `composed: true`.
     * Pass `options` to override those defaults.
     *
     * @param type - The event type name.
     * @param detail - Optional payload exposed as `event.detail`.
     * @param options - Additional `CustomEvent` options excluding `detail`.
     * @returns This instance for chaining.
     * @example
     * ```ts
     * JJET.from(window).triggerCustomEvent('panel-ready', { id: '123' })
     * ```
     *
     * @example
     * ```ts
     * JJET.from(this).triggerCustomEvent('todo-toggle', {
     *     id: '123',
     *     done: true,
     * })
     * ```
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent | CustomEvent()}
     */
    triggerCustomEvent<T = unknown>(type: string, detail?: T, options?: Omit<CustomEventInit<T>, 'detail'>): this {
        return this.trigger(new CustomEvent(type, { bubbles: true, composed: true, ...options, detail }))
    }

    /**
     * Runs a function in the context of this JJET instance.
     *
     * @example
     * ```ts
     * node
     *   .run(function (jjContext) {
     *     console.log(this.ref)
     *     console.log(jjContext.ref)
     *   })
     *   .trigger(new Event('ready'))
     * ```
     * @remarks
     * Use this to make synchronous adjustments while staying in a fluent chain.
     * The callback return value is ignored.
     * If you want to access the current JJ* instance using `this`, use a `function` rather than an arrow function.
     *
     * @param fn - The synchronous function to run. `this` inside the function will refer to this JJET instance, and the wrapped instance is also passed as the first argument.
     * @returns This instance for chaining.
     * @see {@link ref} for direct access to the wrapped native target.
     * @see {@link on} for event listener chaining.
     * @see {@link trigger} for dispatching events in-chain.
     */
    run(fn: (this: this, jjContext: this) => void): this {
        try {
            fn.call(this, this)
        } catch (cause) {
            throw new Error(`Failed to run the function`, { cause })
        }
        return this
    }
}
