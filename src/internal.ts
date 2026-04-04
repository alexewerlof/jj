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
 * Converts a PascalCase, camelCase, or snake_case string to kebab-case.
 *
 * @internal
 */
export function pas2keb(str: string): string {
    if (!isStr(str)) {
        throw typeErr('str', 'a string', str)
    }
    if (/[^a-zA-Z0-9_]/.test(str)) {
        throw new SyntaxError(
            errMsg(
                'str',
                'alphanumeric characters and underscores',
                str,
                'Remove spaces or punctuation before converting to kebab-case.',
            ),
        )
    }
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .replace(/_/g, '-')
        .toLowerCase()
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
 * Returns the file extension from a path.
 *
 * @internal
 */
export function fileExt(path: string): string {
    if (!isStr(path)) {
        throw typeErr('path', 'a string', path)
    }
    const lastDotIndex = path.lastIndexOf('.')
    if (lastDotIndex === -1) {
        return ''
    }
    const ext = path.slice(lastDotIndex + 1)
    if (ext.indexOf('/') !== -1) {
        return ''
    }
    return ext.toLowerCase().trim()
}

/**
 * A simple utility function that is used by addChild() and friends to filter out nullish children.
 * @param x any value
 * @returns true if x is undefined or null. False otherwise
 */
export function notNullish(x: unknown): boolean {
    return x != null
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
