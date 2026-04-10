import { isInstance, isStr, typeErr } from '../internal.js'

/**
 * Creates a `CustomEvent` with JJ's default bubbling and Shadow DOM settings.
 *
 * @remarks
 * Native `CustomEvent` defaults to `bubbles: false` and `composed: false`.
 * JJ defaults both to `true` because cross-component custom events commonly need
 * to bubble out of Shadow DOM boundaries.
 *
 * Pass `options` to override those defaults when you need a local-only event.
 *
 * @category Events
 * @param type - The event type name.
 * @param detail - Optional payload exposed as `event.detail`.
 * @param options - Additional `CustomEvent` options excluding `detail`.
 * @returns A configured `CustomEvent` instance.
 * @throws {TypeError} If `eventName` is not a string.
 * @example
 * ```ts
 * const event = customEvent('todo-toggle', { id: '123', done: true })
 * element.dispatchEvent(event)
 * ```
 *
 * @example
 * ```ts
 * const localOnly = customEvent('panel-ready', undefined, {
 *     bubbles: false,
 *     composed: false,
 * })
 * ```
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent | CustomEvent()}
 */
export function customEvent<T = unknown>(
    type: string,
    detail?: T,
    options?: Omit<CustomEventInit<T>, 'detail'>,
): CustomEvent<T> {
    if (!isStr(type)) {
        throw typeErr('eventName', 'a string', type, 'Pass an event name like "todo-toggle".')
    }

    return new CustomEvent<T>(type, {
        bubbles: true,
        composed: true,
        ...options,
        detail,
    })
}

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
     *     count: 0,
     *     increment() {
     *         this.count++
     *     },
     * }
     *
     * JJET.from(window).on('click', target.increment.bind(target))
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
     * @param type The name identifying the type of the event for example 'click'
     * @param eventInitDict Optional event initialization dictionary.
     * @returns This instance for chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Event/Event | Event()} for details on the eventInitDict options.
     */
    triggerEvent(type: string, eventInitDict?: EventInit | undefined): this {
        return this.trigger(new Event(type, eventInitDict))
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
     * @param eventName - The event type name.
     * @param detail - Optional payload exposed as `event.detail`.
     * @param options - Additional `CustomEvent` options excluding `detail`.
     * @returns This instance for chaining.
     * @throws {TypeError} If `eventName` is not a string.
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
    triggerCustomEvent<T = unknown>(eventName: string, detail?: T, options?: Omit<CustomEventInit<T>, 'detail'>): this {
        return this.trigger(new CustomEvent(eventName, { bubbles: true, composed: true, ...options, detail }))
    }

    /**
     * Runs a function in the context of this JJET instance.
     *
     * @example
     * ```ts
     * node
     *   .run(function (context) {
     *     console.log(this.ref)
     *     console.log(context.ref)
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
    run(fn: (this: this, context: this) => void): this {
        try {
            fn.call(this, this)
        } catch (cause) {
            throw new Error(`Failed to run the function`, { cause })
        }
        return this
    }
}
