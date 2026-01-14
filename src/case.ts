/**
 * Converts a PascalCase or camelCase string to kebab-case.
 * @param str The string to convert.
 * @returns The kebab-case string.
 * @throws {TypeError} If str is not a string or contains invalid characters.
 */
export function pas2keb(str: string): string {
    if (typeof str !== 'string') {
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
 * @param str The string to convert.
 * @returns The PascalCase string.
 */
export function keb2pas(str: string): string {
    if (typeof str !== 'string') {
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
 * @param str The string to convert.
 * @returns The camelCase string.
 */
export function keb2cam(str: string): string {
    if (typeof str !== 'string') {
        throw new TypeError(`Expected a string. Got ${str} (${typeof str})`)
    }
    return str
        .replace(/^-+|-+$/g, '') // Remove any leading or trailing hyphens
        .replace(/-+([a-z])/g, (g, c) => c.toUpperCase())
}
