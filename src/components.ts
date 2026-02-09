import { hasProp, isA, isFn, isStr } from 'jty'
import { typeErr } from './internal.js'
import { keb2cam } from './case.js'

/**
 * A helper to bridge the attribute world (kebab-case) to the property world (camelCase).
 * It works in tandem with browser's `observedAttributes` feature which triggers
 * `attributeChangedCallback`.
 *
 * @remarks
 * Your custom component class MUST define `static observedAttributes[]` otherwise `attributeChangedCallback` won't trigger.
 * `observedAttributes` should contain kebab-based attribute names.
 *
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
 *             shadow.find('#user').setText(this.userName)
            shadow.find('#counter').setText(this.counter)
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
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes | Responding to attribute changes}
 */
export function attr2prop(instance: HTMLElement, name: string, oldValue: any, newValue: any) {
    if (!isA(instance, HTMLElement)) {
        throw typeErr('instance', 'an HTMLElement', instance)
    }
    // Called when observed attributes change.
    if (oldValue !== newValue) {
        const propName = keb2cam(name)
        if (hasProp(instance, propName)) {
            instance[propName] = newValue
            return true
        }
    }
    return false
}

/**
 * Registers the custom element with the browser and waits till it is defined.
 *
 * @example
 * ```ts
 * class MyComponent extends HTMLElement {}
 * await registerComponent('my-component', MyComponent)
 * ```
 * Another convention is to have a `static async register()` function in the Custom Component.
 * ```ts
 * export class MyComponent extends HTMLElement {
 *     static async register() {
 *         return registerComponent('my-component', MyComponent)
 *     }
 * }
 * ```
 * That way, you can import multiple components and do a `Promise.all()` on all their `.register()`s.
 * ```ts
 * import { MyComponent, YourComponent, TheirComponent } ...
 * await Promise.all([
 *     MyComponent.register(),
 *     YourComponent.register(),
 *     TheirComponent.register(),
 * ])
 *
 * @throws {TypeError} If name is not a string or constructor is not a function
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define | customElements.define}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/whenDefined | customElements.whenDefined}
 */
export async function registerComponent(
    name: string,
    constructor: CustomElementConstructor,
    options?: ElementDefinitionOptions,
): Promise<void> {
    if (!isStr(name)) {
        throw typeErr('name', 'a string', name)
    }
    if (!isFn(constructor)) {
        throw typeErr('constructor', 'a function', constructor)
    }
    if (!customElements.get(name)) {
        customElements.define(name, constructor, options)
        await customElements.whenDefined(name)
    }
}
