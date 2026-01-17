import { isStr } from 'jty'

/**
 * Converts a PascalCase, camelCase, or snake_case string to kebab-case.
 *
 * @remarks
 * This function is useful for converting JavaScript property names to CSS or HTML attribute names.
 * It strictly validates the input to contain only alphanumeric characters and underscores.
 *
 * @example
 * ```ts
 * pas2keb('backgroundColor') // 'background-color'
 * pas2keb('MyComponent') // 'my-component'
 * pas2keb('user_id') // 'user-id'
 * ```
 *
 * @param str - The string to convert.
 * @returns The kebab-case string.
 * @throws {TypeError} If `str` is not a string or contains invalid characters (anything other than `/[a-zA-Z0-9_]/`).
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace | String.prototype.replace}
 */
export function pas2keb(str: string): string {
    if (!isStr(str)) {
        throw new TypeError(`Expected a string. Got ${str} (${typeof str})`)
    }
    if (/[^a-zA-Z0-9_]/.test(str)) {
        throw new TypeError(`Invalid characters in string. Only alphanumeric and underscores are allowed. Got: ${str}`)
    }
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .replace(/_/g, '-')
        .toLowerCase()
}

/**
 * Converts a kebab-case string to PascalCase.
 *
 * @remarks
 * This function splits the string by hyphens and capitalizes the first letter of each segment.
 * It handles multiple hyphens by ignoring empty segments.
 *
 * @example
 * ```ts
 * keb2pas('background-color') // 'BackgroundColor'
 * keb2pas('my-component') // 'MyComponent'
 * keb2pas('multi--dash') // 'MultiDash'
 * ```
 *
 * @param str - The string to convert.
 * @returns The PascalCase string.
 * @throws {TypeError} If `str` is not a string.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split | String.prototype.split}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map | Array.prototype.map}
 */
export function keb2pas(str: string): string {
    if (!isStr(str)) {
        throw new TypeError(`Expected a string. Got ${str} (${typeof str})`)
    }
    return (
        str
            .split('-')
            .filter(Boolean) // Remove empty strings from leading/trailing/multiple hyphens
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('') ||
        // Handle strings that were not kebab-case to begin with (e.g. 'single', 'camelCase')
        (str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : '')
    )
}

/**
 * Converts a kebab-case string to camelCase.
 *
 * @remarks
 * This function is primarily useful for converting attributes to JavaScript property names.
 * Leading and trailing hyphens are removed before conversion.
 *
 * @example
 * ```ts
 * keb2cam('background-color') // 'backgroundColor'
 * keb2cam('-webkit-transform') // 'webkitTransform'
 * ```
 *
 * @param str - The string to convert.
 * @returns The camelCase string.
 * @throws {TypeError} If `str` is not a string.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace | String.prototype.replace}
 */
export function keb2cam(str: string): string {
    if (!isStr(str)) {
        throw new TypeError(`Expected a string. Got ${str} (${typeof str})`)
    }
    return str
        .replace(/^-+|-+$/g, '') // Remove any leading or trailing hyphens
        .replace(/-+([a-z])/g, (g, c) => c.toUpperCase())
}
