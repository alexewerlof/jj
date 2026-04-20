import '../../test/attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJN } from './JJN.js'
import { nodeWrappers } from './WrapperChain.js'

type WrapperChainLike<N extends Node, W extends JJN<N>> = {
    register(DOMConstructor: new (...args: unknown[]) => Node, WrapperConstructor: { from(node: any): JJN<Node> }): void
    from(node: N): W
}

class ParentWrapper extends JJN<Element> {
    static from(node: Element): ParentWrapper {
        return new ParentWrapper(node)
    }
}

class ChildWrapper extends ParentWrapper {
    static from(node: HTMLElement): ChildWrapper {
        return new ChildWrapper(node)
    }
}

class BaseWrapper extends JJN<Node> {
    static from(node: Node): BaseWrapper {
        return new BaseWrapper(node)
    }
}

const WrapperChainCtor = nodeWrappers.constructor as new <N extends Node, W extends JJN<N>>() => WrapperChainLike<N, W>

describe('WrapperChain.register', () => {
    it('inserts child wrappers before already-registered parent wrappers', () => {
        const chain = new WrapperChainCtor<Node, JJN<Node>>()

        chain.register(Element, ParentWrapper)
        chain.register(HTMLElement, ChildWrapper)

        assert.ok(chain.from(document.createElement('div')) instanceof ChildWrapper)
    })

    it('appends more generic wrappers after existing specific wrappers', () => {
        const chain = new WrapperChainCtor<Node, JJN<Node>>()

        chain.register(Element, ParentWrapper)
        chain.register(Node, BaseWrapper)

        assert.ok(chain.from(document.createElement('div')) instanceof ParentWrapper)
        assert.ok(chain.from(document.createTextNode('hello')) instanceof BaseWrapper)
    })
})
