import { errMsg, hasProp, isInstance, isStr, keb2cam, typeErr } from './internal.js'

/**
 * A helper to bridge the attribute world (kebab-case) to the property world (camelCase).
 * It works in tandem with browser's `observedAttributes` feature which triggers
 * `attributeChangedCallback`.
 *
 * @remarks
 * Your custom component class MUST define `static observedAttributes[]` otherwise `attributeChangedCallback` won't trigger.
 * `observedAttributes` should contain kebab-based attribute names.
 *
 * An observed attribute with no matching property is always a bug — a typo in
 * `observedAttributes`, a missing setter, or a renamed field — and silently doing nothing
 * would leave the UI un-updated with no signal. So this throws instead of returning
 * `false`. When the attribute is merely *unchanged* it is a no-op.
 *
 * @category Components
 *
 * @param instance - A reference to the common component instance
 * @param name - kebab-case and in lower case exactly as it appears in `observedAttributes`.
 * @param oldValue - The previous value of the attribute.
 * @param newValue - The new value of the attribute.
 * @returns `true` when the property was assigned; `false` when the value did not change.
 * @throws {TypeError} If the instance is not an HTMLElement.
 * @throws {ReferenceError} If no property matches the attribute name (see the message for the expected property name).
 * @throws {Error} If setting the property throws.
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
        const propName = keb2cam(name)
        if (!hasProp(instance, propName)) {
            throw new ReferenceError(
                errMsg(
                    'name',
                    `an attribute whose property "${propName}" exists on ${instance.constructor.name}`,
                    name,
                    `Add a "${propName}" getter/setter to ${instance.constructor.name}, or remove "${name}" from observedAttributes.`,
                ),
            )
        }
        try {
            instance[propName] = newValue
            return true
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
 * Note that the component name should contain a hyphen to be valid. Define the component
 * before usage to avoid FOUC (Flash of Unstyled Content).
 *
 * The returned boolean reports what happened, **not** readiness — awaiting the promise is
 * the readiness signal. Read it only if you need to distinguish the two cases:
 *
 * - `false` — this call defined the element.
 * - `true` — the element was already defined with the same constructor (a no-op).
 *
 * A different constructor for an already-registered name throws rather than silently
 * keeping the old one.
 *
 * @category Components
 * @param name - The custom element name. Must be kebab-case with a hyphen (`my-component`); PascalCase is rejected.
 * @param constructor - The custom element constructor/class.
 * @param options - Optional native `customElements.define` options.
 * @returns `false` if this call defined the element, `true` if it was already defined.
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
    if (typeof constructor !== 'function') {
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
