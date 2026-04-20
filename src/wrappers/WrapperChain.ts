import { isInstance } from '../internal.js'
import type { JJN } from './JJN.js'
import type { JJE } from './JJE.js'

type Registration<N extends Node, W extends JJN<N>> = [new (...args: unknown[]) => N, { from(node: N): W }]
type AnyRegistration = Registration<Node, JJN<Node>>

class WrapperChain<N extends Node, W extends JJN<N>> {
    /**
     * This array keeps the translation tuples from DOM to JJ wrappers.
     * Each record looks like this: [DOMConstructor, WrapperConstructor], where:
     * - `DOMConstructor` is a constructor function for a DOM node type (e.g., `HTMLElement`, `SVGElement`, etc.)
     * - `WrapperConstructor` is the corresponding JJ wrapper class that has a static `from` method to create an instance from a DOM node.
     * When everything is loaded as intended, the array should look like this:
     * [
     *   [HTMLElement, JJHE],
     *   [SVGElement, JJSE],
     *   [MathMLElement, JJME],
     *   [Element, JJE],
     *   [ShadowRoot, JJSR],
     *   [DocumentFragment, JJDF],
     *   [Document, JJD],
     *   [Text, JJT],
     *   [Node, JJN] // This should be the last record, as it is the most generic wrapper.
     * ]
     *
     * The order of the records matters. When wrapping a DOM node, the array is traversed from top to bottom,
     * and the first matching constructor is used to create the wrapper. This ensures that more specific wrappers
     * are chosen over more generic ones. For example, an `HTMLDivElement` will be wrapped with `JJHE` instead of `JJE`,
     * because `HTMLElement` comes before `Element` in the array.
     * The base wrapper `JJN` should be the last record, as it can wrap any Node, but we want to use more specific wrappers when possible.
     * JJET is left out because most often, we want to wrap a Node descendant.
     */
    #translation: AnyRegistration[] = []

    register<N2 extends N, W2 extends W & JJN<N2>>(
        DOMConstructor: Registration<N2, W2>[0],
        WrapperConstructor: Registration<N2, W2>[1],
    ): void {
        const registration: AnyRegistration = [
            DOMConstructor as AnyRegistration[0],
            WrapperConstructor as unknown as AnyRegistration[1],
        ]
        const parentIndex = this.#translation.findIndex(([, RegisteredWrapper]) =>
            Object.prototype.isPrototypeOf.call(RegisteredWrapper, WrapperConstructor),
        )

        if (0 <= parentIndex) {
            this.#translation.splice(parentIndex, 0, registration)
        } else {
            this.#translation.push(registration)
        }
    }

    from(node: N): W {
        for (const [DOMConstructor, WrapperConstructor] of this.#translation) {
            if (isInstance(node, DOMConstructor)) {
                return WrapperConstructor.from(node) as W
            }
        }
        throw new ReferenceError(`No wrapper found for node ${node}`)
    }

    fromAll(nodes: Iterable<N>): W[] {
        return Array.from(nodes).map((node) => this.from(node))
    }
}

export const nodeWrappers = new WrapperChain<Node, JJN<Node>>()
export const elementWrappers = new WrapperChain<Element, JJE<Element>>()
