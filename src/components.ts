import { isInstance, isFn, hasProp, isStr } from 'jty'
import { typeErr, errMsg, keb2cam } from './internal.js'

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
 * Note that the component name should contain a hyphen to be valid.
 * Define the component before usage to avoid FOUC (Flash of Unstyled Content).
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
 * @throws {SyntaxError} If the given name is invalid for custom-elements.
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
        throw typeErr('name', 'a string', name, 'Pass a valid name like "my-component".')
    }
    if (!name.includes('-')) {
        throw new SyntaxError(
            errMsg('name', 'a custom-element name containing a hyphen', name, 'Use kebab-case like "my-component".'),
        )
    }
    if (!isFn(constructor)) {
        throw typeErr(
            'constructor',
            'a function',
            constructor,
            'Pass the custom element class itself, e.g. defineComponent("my-component", MyComponent).',
        )
    }
    const definedConstructor = customElements.get(name)
    if (definedConstructor) {
        if (definedConstructor !== constructor) {
            throw new ReferenceError(`A different constructor is already defined for the custom element "${name}".`)
        }
    } else {
        customElements.define(name, constructor, options)
        await customElements.whenDefined(name)
    }
    return Boolean(definedConstructor)
}
