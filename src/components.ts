import { isInstance, isFn, hasProp, isStr } from 'jty'
import { typeErr, errMsg, keb2cam, pas2keb } from './internal.js'

/**
 * A helper to bridge the attribute world (kebab-case) to the property world (camelCase).
 * It works in tandem with browser's `observedAttributes` feature which triggers
 * `attributeChangedCallback`.
 *
 * @remarks
 * Your custom component class MUST define `static observedAttributes[]` otherwise `attributeChangedCallback` won't trigger.
 * `observedAttributes` should contain kebab-based attribute names.
 *
 * @category Components
 * @example
 * ```ts
 * class MyComponent extends HTMLElement {
 *     static observedAttributes = ['user-name', 'counter']
 *     userName = '' // Property MUST exist on the instance (or prototype setter)
 *     #counter = 0  // You can also use private properties together with getter/setters
 *
 *     attributeChangedCallback(name, oldValue, newValue) {
 *         attr2prop(this, name, oldValue, newValue)
 *     }
 *
 *     get counter() {
 *         return this.#counter
 *     }
 *
 *     set counter(value) {
 *         this.#counter = value
 *         this.#render() // You can call your render function to update the DOM
 *     }
 *
 *     #render() {
 *         const shadow = JJHE.from(this).shadow
 *         if (shadow) {
 *              shadow.find('#user').setText(this.userName)
 *              shadow.find('#counter').setText(this.counter)
 *         }
 *     }
 * }
 * ```
 *
 * @param instance - A reference to the common component instance
 * @param name - kebab-case and in lower case exactly as it appears in `observedAttributes`.
 * @param oldValue - The previous value of the attribute.
 * @param newValue - The new value of the attribute.
 * @returns `true` if it tried to set the attribute; otherwise `false`.
 * @throws {TypeError} if the instance is not an HTMLElement or if the property corresponding to the attribute does not exist on the instance.
 * @throws {Error} if setting the property throws an error for any reason.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes | Responding to attribute changes}
 */
export function attr2prop(instance: HTMLElement, name: string, oldValue: unknown, newValue: unknown) {
    if (!isInstance(instance, HTMLElement)) {
        throw typeErr(
            'instance',
            'an HTMLElement',
            instance,
            'Call attr2prop(this, ...) from attributeChangedCallback on a custom element instance.',
        )
    }
    // Called when observed attributes change.
    if (oldValue !== newValue) {
        try {
            const propName = keb2cam(name)
            if (hasProp(instance, propName)) {
                instance[propName] = newValue
                return true
            }
        } catch (err) {
            throw new Error(
                `Failed to set property using attribute change event ${name}. Old value: ${oldValue}, New value: ${newValue}.`,
                { cause: err },
            )
        }
    }
    return false
}

/**
 * Registers the custom element with the browser and waits till it is defined.
 *
 * @remarks
 * This helper accepts either kebab-case names (`my-widget`) or PascalCase names (`MyWidget`).
 * PascalCase input is normalized to kebab-case internally before registration.
 *
 * The returned promise resolves to:
 * - `false` when the element was newly defined by this call.
 * - `true` when the same constructor had already been defined for the normalized name.
 *
 * Defining components before usage is important for reliability. If markup is rendered before
 * the browser knows the custom element definition, upgrade timing can become race-prone and
 * appear flaky across environments.
 *
 * @category Components
 * @param name - The custom element name. Supports kebab-case or PascalCase and normalizes to kebab-case.
 * @param constructor - The custom element constructor/class.
 * @param options - Optional native `customElements.define` options.
 * @returns A promise resolving to `true` if already defined, `false` if defined by this call.
 * @example
 * ```ts
 * class MyComponent extends HTMLElement {}
 * await defineComponent('my-component', MyComponent)
 * ```
 * A common pattern is exposing a static `defined` promise on the component class.
 * ```ts
 * export class MyComponent extends HTMLElement {
 *     static defined = defineComponent('my-component', MyComponent)
 * }
 * ```
 * That way, importers can await readiness declaratively and in parallel.
 * ```ts
 * import { MyComponent, YourComponent, TheirComponent } ...
 * await Promise.all([
 *     MyComponent.defined,
 *     YourComponent.defined,
 *     TheirComponent.defined,
 * ])
 * ```
 *
 * @throws {TypeError} If name is not a string or constructor is not a function.
 * @throws {SyntaxError} If the normalized name is not a valid custom-element name.
 * @throws {ReferenceError} If another constructor is already defined for the same normalized name.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define | customElements.define}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/whenDefined | customElements.whenDefined}
 */
export async function defineComponent(
    name: string,
    constructor: CustomElementConstructor,
    options?: ElementDefinitionOptions,
): Promise<boolean> {
    if (!isStr(name)) {
        throw typeErr('name', 'a string', name, 'Use a custom-element tag name like "my-widget" or "MyWidget".')
    }
    // If already kebab-case (contains hyphen), accept as-is; otherwise normalize via pas2keb
    const normalizedName = name.includes('-') ? name : pas2keb(name)
    if (!normalizedName.includes('-')) {
        throw new SyntaxError(
            errMsg(
                'name',
                'a custom-element name containing a hyphen',
                name,
                'Use kebab-case like "my-widget" or PascalCase like "MyWidget".',
            ),
        )
    }
    if (!isFn(constructor)) {
        throw typeErr(
            'constructor',
            'a function',
            constructor,
            'Pass the custom element class itself, e.g. defineComponent("my-widget", MyWidget).',
        )
    }
    const definedConstructor = customElements.get(normalizedName)
    if (definedConstructor) {
        if (definedConstructor !== constructor) {
            throw new ReferenceError(
                `A different constructor is already defined for the custom element "${normalizedName}".`,
            )
        }
    } else {
        customElements.define(normalizedName, constructor, options)
        await customElements.whenDefined(normalizedName)
    }
    return Boolean(definedConstructor)
}
