import { cam2keb, errMsg, hasProp, isObj, isStr, keb2cam, typeErr } from '../internal.js'
import { JJE } from './JJE.js'

/**
 * CSSOM properties that exist under a JavaScript-safe alias but are not settable
 * by that name.
 *
 * @remarks
 * `style.cssFloat` is the JS-safe spelling of `float`, because `float` is a reserved
 * word. The CSSOM exposes the alias, so the property table check accepts it, but
 * `setProperty('css-float', …)` is ignored: only `float` is a real CSS property.
 * Resolving the alias keeps the documented "camelCase or kebab-case" promise true.
 *
 * @internal
 */
const STYLE_ALIASES: Record<string, string> = { cssFloat: 'float' }

/**
 * Converts a style property name to the kebab-case form the CSSOM expects.
 *
 * @internal
 */
function styleName(name: string): string {
    if (!isStr(name)) {
        throw typeErr('name', 'a string', name)
    }
    const kebab = cam2keb(name)
    return STYLE_ALIASES[keb2cam(kebab)] ?? kebab
}

/**
 * Reports whether the engine knows this CSS property.
 *
 * @remarks
 * The check reads the engine's own `CSSStyleDeclaration` property table instead of
 * a hardcoded list, so it cannot drift from the platform. `CSS.supports()` is not
 * used because it is absent in some DOM implementations (for example jsdom).
 * Custom properties are always allowed.
 *
 * @internal
 */
function isKnownStyleProperty(style: CSSStyleDeclaration, name: string): boolean {
    return name.startsWith('--') || keb2cam(name) in style
}

/**
 * Base wrapper for elements that support `dataset` and inline `style`.
 *
 * @remarks
 * This includes `HTMLElement`, `SVGElement`, and `MathMLElement`.
 */
export abstract class JJEx<T extends HTMLElement | SVGElement | MathMLElement> extends JJE<T> {
    /**
     * Gets the value of a single inline style property.
     *
     * @example
     * ```ts
     * const display = el.getStyle('display')
     * const color = el.getStyle('backgroundColor') // same as 'background-color'
     * ```
     *
     * @param name - The CSS property name, in kebab-case or camelCase.
     * @returns The property value, or an empty string when it is not set.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style | HTMLElement.style}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue | CSSStyleDeclaration.getPropertyValue}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/style | SVG style attribute}
     */
    getStyle(name: string): string {
        return this.ref.style.getPropertyValue(styleName(name))
    }

    /**
     * Sets a single inline style property, or removes it when the value is nullish.
     *
     * @remarks
     * The name may be written in kebab-case or camelCase; `setStyle('backgroundColor', …)`
     * and `setStyle('background-color', …)` are equivalent. Names the engine does not
     * recognize throw instead of silently doing nothing, which is how a typo or a
     * React-style property name would otherwise fail.
     *
     * @example
     * ```ts
     * el.setStyle('display', 'grid')
     * el.setStyle('backgroundColor', 'red') // camelCase is accepted
     * el.setStyle('opacity', 0.8)
     * el.setStyle('color', null) // removes the property
     * ```
     *
     * @param name - The CSS property name, in kebab-case or camelCase.
     * @param value - The CSS property value, or null/undefined/false to remove the property.
     * @returns This instance for chaining.
     * @throws {TypeError} If `name` is not a string.
     * @throws {RangeError} If `name` is not a CSS property known to this engine.
     * @see {@link setStyles} for setting/removing specific style properties.
     * @see {@link rmStyle} for removing style properties.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style | HTMLElement.style}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty | CSSStyleDeclaration.setProperty}
     */
    setStyle(name: string, value: unknown): this {
        const prop = styleName(name)

        if (value == null || value === false) {
            return this.rmStyle(prop)
        }
        if (!isKnownStyleProperty(this.ref.style, prop)) {
            throw new RangeError(
                errMsg(
                    'name',
                    'a CSS property name',
                    name,
                    'Use kebab-case or camelCase, for example "background-color" or "backgroundColor". For a non-standard property, use el.ref.style.setProperty().',
                ),
            )
        }

        this.ref.style.setProperty(prop, value as string)
        return this
    }

    /**
     * Removes one or more inline style properties.
     *
     * @example
     * ```ts
     * el.rmStyle('display')
     * el.rmStyle('display', 'backgroundColor')
     * ```
     *
     * @param names - The CSS property names to remove, in kebab-case or camelCase.
     * @returns This instance for chaining.
     * @throws {TypeError} If any property name is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/removeProperty | CSSStyleDeclaration.removeProperty}
     */
    rmStyle(...names: string[]): this {
        for (const name of names) {
            this.ref.style.removeProperty(styleName(name))
        }
        return this
    }

    /**
     * Sets or removes multiple inline style properties from an object map, or no-ops for nullish input.
     *
     * @remarks
     * This helper is useful for setting several properties at once.
     * - `null` or `undefined`: does nothing and returns `this`
     * - plain object: non-nullish values set properties, `null`/`undefined`/`false` remove properties
     * - anything else: throws `TypeError`
     *
     * Property names may be kebab-case or camelCase, matching {@link setStyle}.
     *
     * @example
     * ```ts
     * el.setStyles({
     *   display: 'grid',
     *   backgroundColor: 'red', // camelCase is accepted
     *   gap: '1rem',
     *   opacity: 0,
     *   color: null, // removes the property
     * })
     * el.setStyles(null) // no-op
     * ```
     *
     * @param styleMap - Style property map or nullish to skip.
     * @returns This instance for chaining.
     * @throws {TypeError} If `styleMap` is not nullish and not a plain object.
     * @see {@link setStyle} for setting a single style property.
     */
    setStyles(styleMap?: Record<string, unknown> | null): this {
        if (styleMap == null) {
            return this
        }
        if (!isObj(styleMap)) {
            throw typeErr(
                'styleMap',
                'a plain object',
                styleMap,
                'Pass null/undefined or an object like { display: "grid" }.',
            )
        }

        try {
            for (const [name, value] of Object.entries(styleMap)) {
                if (value == null || value === false) {
                    this.rmStyle(name)
                } else {
                    this.setStyle(name, value)
                }
            }
        } catch (cause) {
            throw new Error(`Failed to set some styles from object: ${JSON.stringify(styleMap)}.`, { cause })
        }
        return this
    }

    /**
     * Gets a data attribute from the element.
     *
     * @example
     * ```ts
     * const value = el.getDataAttr('myKey')
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @returns The value of the attribute, or undefined if not set.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement/dataset | MathMLElement.dataset}
     */
    getDataAttr(name: string): string | undefined {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }
        return this.ref.dataset[name]
    }

    /**
     * Checks if a data attribute exists on the element.
     *
     * @example
     * ```ts
     * if (el.hasDataAttr('myKey')) {
     *   // ...
     * }
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @returns True if the attribute exists, false otherwise.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement/dataset | MathMLElement.dataset}
     */
    hasDataAttr(name: string): boolean {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }
        return hasProp(this.ref.dataset, name)
    }

    /**
     * Sets a single data attribute on the element, or removes it when the value is nullish.
     *
     * @remarks
     * The name is the camelCase form: `setDataAttr('userId', …)` writes `data-user-id`.
     *
     * @example
     * ```ts
     * el.setDataAttr('myKey', 'myValue')
     * el.setDataAttr('count', 42) // Coerced to "42"
     * el.setDataAttr('selected', null) // Removes data-selected
     * ```
     *
     * @param name - The data attribute name (in camelCase).
     * @param value - The value to assign, or null/undefined to remove the attribute.
     * @returns This instance for chaining.
     * @throws {TypeError} If `name` is not a string.
     * @see {@link setDataAttrs} for setting multiple data attributes at once.
     * @see {@link getDataAttr} for reading a data attribute by its camelCase name.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement/dataset | MathMLElement.dataset}
     */
    setDataAttr(name: string, value?: unknown): this {
        if (!isStr(name)) {
            throw typeErr('name', 'a string', name)
        }

        if (value == null) {
            delete this.ref.dataset[name]
        } else {
            this.ref.dataset[name] = String(value)
        }
        return this
    }

    /**
     * Sets multiple data attributes from an object, or no-ops for nullish input.
     *
     * @remarks
     * This helper is useful for optional dataset bags in builder APIs.
     * - `null` or `undefined`: does nothing and returns `this`
     * - plain object: sets each data attribute; a `null`/`undefined` value removes it
     * - anything else: throws `TypeError`
     *
     * @example
     * ```ts
     * el.setDataAttrs({ myKey: 'myValue', otherKey: 'otherValue' })
     * el.setDataAttrs(null) // no-op
     * ```
     *
     * @param attributes - Data attributes object or nullish to skip.
     * @returns This instance for chaining.
     * @throws {TypeError} If `attributes` is not nullish and not a plain object.
     * @see {@link setDataAttr} for setting a single data attribute.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement/dataset | MathMLElement.dataset}
     */
    setDataAttrs(attributes?: Record<string, unknown> | null): this {
        if (attributes == null) {
            return this
        }
        if (!isObj(attributes)) {
            throw typeErr(
                'attributes',
                'a plain object',
                attributes,
                'Pass null/undefined or an object like { userId: "42" }.',
            )
        }

        try {
            for (const [name, value] of Object.entries(attributes)) {
                this.setDataAttr(name, value)
            }
        } catch (cause) {
            throw new Error(`Failed to set some data attributes from object: ${JSON.stringify(attributes)}.`, { cause })
        }
        return this
    }

    /**
     * Removes one or more data attributes from the element.
     *
     * @example
     * ```ts
     * el.rmDataAttr('myKey')  // Remove single
     * el.rmDataAttr('myKey', 'otherKey')  // Remove multiple
     * ```
     *
     * @param names - The data attribute name(s) (in camelCase).
     * @returns This instance for chaining.
     * @throws {TypeError} If any name is not a string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement/dataset | MathMLElement.dataset}
     */
    rmDataAttr(...names: string[]): this {
        for (const name of names) {
            if (!isStr(name)) {
                throw typeErr('name', 'a string', name)
            }
            delete this.ref.dataset[name]
        }
        return this
    }

    /**
     * Removes multiple data attributes from an array of names.
     *
     * @example
     * ```ts
     * el.rmDataAttrs(['myKey', 'otherKey'])
     * ```
     *
     * @param names - The data attribute names to remove (in camelCase).
     * @returns This instance for chaining.
     * @throws {TypeError} If `names` is not an array.
     * @throws {TypeError} If any name in `names` is not a string.
     * @see {@link rmDataAttr} for removing one or more data attributes via rest arguments.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset | SVGElement.dataset}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MathMLElement/dataset | MathMLElement.dataset}
     */
    rmDataAttrs(names: string[]): this {
        if (!Array.isArray(names)) {
            throw typeErr('names', 'an array', names)
        }
        return this.rmDataAttr(...names)
    }
}
