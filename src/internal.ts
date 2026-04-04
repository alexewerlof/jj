/**
 * Internal utilities for the JJ library.
 * These are not part of the public API.
 */

import { isStr } from 'jty'

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
 * Converts a kebab-case string to camelCase.
 *
 * @internal
 */
export function keb2cam(str: string): string {
    if (!isStr(str)) {
        throw typeErr('str', 'a string', str)
    }
    return str.replace(/^-+|-+$/g, '').replace(/-+([a-z])/g, (g, c) => c.toUpperCase())
}

/**
 * Converts a value to its string representation.
 * It is primarily used for creating Text nodes from non-string inputs.
 * @param x a value to be converted
 * @returns the string representation. For objects, it tries to convert using JSON.stringify()
 */
export function toStr(x: unknown): string {
    switch (typeof x) {
        case 'string':
            return x
        case 'object':
            if (x === null) {
                return 'null'
            }
            try {
                return JSON.stringify(x)
            } catch {
                return String(x)
            }
        case 'function':
            return x.toString()
        default:
            // number
            // boolean
            // bigint
            // symbol
            // undefined
            return String(x)
    }
}
