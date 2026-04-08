/**
 * Internal utilities for the JJ library.
 * These are not part of the public API.
 */

const NS = 'http://www.w3.org/'

/**
 * MathML namespace URI used by DOM namespace-aware APIs like `document.createElementNS`.
 *
 * @remarks
 * Keep this value aligned with the official W3C MathML namespace.
 *
 * @category Constants
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/MathML/Reference/Attribute | MathML}
 */
export const MATHML_NS = NS + '1998/Math/MathML'

/**
 * SVG namespace URI used by DOM namespace-aware APIs like `document.createElementNS`.
 *
 * @remarks
 * Keep this value aligned with the official W3C SVG namespace.
 *
 * @category Constants
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/Namespaces_crash_course | SVG namespaces}
 */
export const SVG_NS = NS + '2000/svg'

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
 * Checks if the provided value is a string.
 *
 * @internal
 */
export function isStr(x: unknown): x is string {
    return typeof x === 'string'
}

/**
 * Checks if a value is a number and not NaN.
 *
 * @internal
 */
export function isNum(x: unknown): x is number {
    return typeof x === 'number' && !Number.isNaN(x)
}

/**
 * Checks if a value is a plain object.
 *
 * @internal
 */
export function isObj(x: unknown): x is Record<PropertyKey, unknown> {
    return typeof x === 'object' && x !== null && Object.getPrototypeOf(x) === Object.prototype
}

/**
 * Checks if a provided value is an instance of the provided class.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isInstance<T extends new (...args: any[]) => any>(
    x: unknown,
    classConstructor: T,
): x is InstanceType<T> {
    if (typeof classConstructor !== 'function') {
        throw typeErr('classConstructor', 'a constructor function', classConstructor)
    }
    return x instanceof classConstructor
}

/**
 * Checks if the provided value has the specified property.
 *
 * @internal
 */
export function hasProp<K extends PropertyKey>(x: unknown, propName: K): x is Record<K, unknown> {
    return x !== null && typeof x === 'object' && propName in x
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
