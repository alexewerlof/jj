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
 * @returns Error message string
 */
export function errMsg(varName: string, expected: string, received: unknown): string {
    return `Expected '${varName}' to be ${expected}. Got ${received} (${typeof received})`
}

/**
 * Creates a TypeError with a standardized error message.
 * Convenience wrapper around errMsg for type errors.
 *
 * @internal
 * @param varName - The name of the variable
 * @param expected - Description of expected type
 * @param received - The actual value received
 * @returns A TypeError ready to be thrown
 */
export function typeErr(varName: string, expected: string, received: unknown): TypeError {
    return new TypeError(errMsg(varName, expected, received))
}
