import { isStr } from 'jty'

/**
 * Internal utilities for the JJ library.
 * These are not part of the public API.
 */

/**
 * Creates a gzip-friendly error message by concatenating strings.
 * This avoids repeating common error message patterns that compress well.
 *
 * @remarks
 * Uses backtick strings to take advantage of gzip compression across the codebase.
 * Common patterns like `Expected 'x' to be ...` compress very efficiently.
 *
 * @internal
 * @param varName - The name of the variable
 * @param expected - Description of expected type
 * @param received - The actual value received
 * @param extra - Optional short hint explaining what went wrong or how to fix it.
 * @returns Error message string
 */
export function errMsg(varName: string, expected: unknown, received: unknown, extra?: string): string {
    const ret = `Expected '${varName}' to be ${expected}. Got ${received} (${typeof received})`
    return extra ? `${ret}.\n${extra}` : ret
}

/**
 * Creates a TypeError with a standardized error message.
 * Convenience wrapper around errMsg for type errors.
 *
 * @internal
 * @param varName - The name of the variable
 * @param expected - Description of expected type
 * @param received - The actual value received
 * @param extra - Optional short hint explaining what went wrong or how to fix it.
 * @returns A TypeError ready to be thrown
 */
export function typeErr(varName: string, expected: unknown, received: unknown, extra?: string): TypeError {
    return new TypeError(errMsg(varName, expected, received, extra))
}

/**
 * Internal shared implementation for creating custom events.
 *
 * @internal
 * @param eventName - The event type name.
 * @param detail - Optional event payload stored on `event.detail`.
 * @param options - Additional `CustomEvent` options excluding `detail`.
 * @returns A configured `CustomEvent` instance.
 */
export function createCustomEventInternal<T = unknown>(
    eventName: string,
    detail?: T,
    options?: Omit<CustomEventInit<T>, 'detail'>,
): CustomEvent<T> {
    if (!isStr(eventName)) {
        throw typeErr('eventName', 'a string', eventName, 'Pass an event name like "todo-toggle".')
    }

    return new CustomEvent<T>(eventName, {
        bubbles: true,
        composed: true,
        ...options,
        detail,
    })
}
