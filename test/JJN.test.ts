import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJHE, JJME, JJN } from '../src/index.js'
import { isInstance, isOwnInstance } from 'jty'

describe('JJN', () => {
    describe('constructor', () => {
        it('wraps a Node', () => {
            const node = document.createTextNode('test')
            const jjn = new JJN(node)
            assert.strictEqual(jjn.ref, node)
        })

        it('throws if not a Node', () => {
            assert.throws(() => new JJN({} as any), TypeError)
            assert.throws(() => new JJN('string' as any), TypeError)
            assert.throws(() => new JJN(null as any), TypeError)
        })
    })

    describe('static from()', () => {
        it('creates JJN from Node', () => {
            const node = document.createTextNode('test')
            const jjn = JJN.from(node)
            assert.ok(jjn instanceof JJN)
            assert.strictEqual(jjn.ref, node)
        })
    })

    // Skipping wrap() tests for MathMLElement since jsdom doesn't support it natively as of 29.0.1
    describe.skip('static wrap()', () => {
        it('wraps MathMLElement as JJME', () => {
            const raw = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math')
            const wrapped = JJN.wrap(raw)
            assert.ok(wrapped instanceof JJME)
        })
    })

    describe('static isWrappable()', () => {
        it('returns true for strings', () => {
            assert.strictEqual(JJN.isWrappable('test'), true)
        })

        it('returns true for Nodes', () => {
            const node = document.createTextNode('test')
            assert.strictEqual(JJN.isWrappable(node), true)
        })

        it('returns true for JJN instances', () => {
            const node = document.createTextNode('test')
            const jjn = new JJN(node)
            assert.strictEqual(JJN.isWrappable(jjn), true)
        })

        it('returns false for other types', () => {
            assert.strictEqual(JJN.isWrappable(null), false)
            assert.strictEqual(JJN.isWrappable(undefined), false)
            assert.strictEqual(JJN.isWrappable(42), false)
            assert.strictEqual(JJN.isWrappable({}), false)
            assert.strictEqual(JJN.isWrappable([]), false)
        })
    })

    describe('static unwrap()', () => {
        it('unwraps JJN to Node', () => {
            const node = document.createTextNode('test')
            const jjn = new JJN(node)
            const unwrapped = JJN.unwrap(jjn)
            assert.strictEqual(unwrapped, node)
        })

        it('returns Node as is', () => {
            const node = document.createTextNode('test')
            const unwrapped = JJN.unwrap(node)
            assert.strictEqual(unwrapped, node)
        })

        it('creates Text node from string', () => {
            const unwrapped = JJN.unwrap('test')
            assert.ok(unwrapped instanceof Text)
            assert.strictEqual(unwrapped.textContent, 'test')
        })

        it('coerces primitives into Text nodes', () => {
            assert.strictEqual(JJN.unwrap(42 as any).textContent, '42')
            assert.strictEqual(JJN.unwrap(false as any).textContent, 'false')
            assert.strictEqual(JJN.unwrap(5n as any).textContent, '5')
            assert.strictEqual(JJN.unwrap(Symbol('x') as any).textContent, 'Symbol(x)')
        })

        it('coerces nullish values into Text nodes', () => {
            assert.strictEqual(JJN.unwrap(null as any).textContent, 'null')
            assert.strictEqual(JJN.unwrap(undefined as any).textContent, 'undefined')
        })

        it('stringifies plain objects and falls back safely', () => {
            assert.strictEqual(JJN.unwrap({ a: 1 } as any).textContent, '{"a":1}')

            const circular: { self?: unknown } = {}
            circular.self = circular

            assert.strictEqual(JJN.unwrap(circular as any).textContent, '[object Object]')
        })
    })

    describe('static wrapAll()', () => {
        it('wraps array of nodes', () => {
            const nodes = [document.createTextNode('a'), document.createTextNode('b')]
            const wrapped = JJN.wrapAll(nodes)
            assert.strictEqual(wrapped.length, 2)
            assert.ok(wrapped.every((w) => w instanceof JJN))
        })

        it('wraps NodeList', () => {
            const parent = document.createElement('div')
            parent.innerHTML = '<span></span><span></span>'
            const wrapped = JJN.wrapAll(parent.childNodes)
            assert.strictEqual(wrapped.length, 2)
        })
    })

    describe('addText()', () => {
        it('adds text to node', () => {
            const parent = document.createElement('div')
            const jjn = new JJN(parent)
            jjn.addText('test')
            assert.strictEqual(parent.textContent, 'test')
        })

        it('adds multiple texts', () => {
            const parent = document.createElement('div')
            const jjn = new JJN(parent)
            jjn.addText('hello')
            jjn.addText(' world')
            assert.strictEqual(parent.textContent, 'hello world')
        })

        it('ignores null or undefined', () => {
            const parent = document.createElement('div')
            const jjn = new JJN(parent)
            jjn.addText(null)
            jjn.addText(undefined)
            jjn.addText('')
            assert.strictEqual(parent.childNodes.length, 3)
        })

        it('returns this for chaining', () => {
            const parent = document.createElement('div')
            const jjn = new JJN(parent)
            const result = jjn.addText('test')
            assert.strictEqual(result, jjn)
        })
    })

    describe('clone()', () => {
        it('clones node deeply by default', () => {
            const parent = document.createElement('div')
            parent.innerHTML = '<span>test</span>'
            const jjn = new JJN(parent)
            const cloned = jjn.clone(true)
            assert.ok(cloned instanceof JJN)
            assert.notStrictEqual(cloned.ref, parent)
            assert.strictEqual(cloned.ref.childNodes.length, 1)
        })

        it('clones node shallowly when specified', () => {
            const parent = document.createElement('div')
            parent.innerHTML = '<span>test</span>'
            const jjn = new JJN(parent)
            const cloned = jjn.clone(false)
            assert.strictEqual(cloned.ref.childNodes.length, 0)
        })
    })

    describe('getParent()', () => {
        it('returns wrapped parent node', () => {
            const parent = document.createElement('div')
            const child = document.createElement('span')
            parent.appendChild(child)

            const jjn = JJN.from(child)
            const wrappedParent = jjn.getParent()

            assert.ok(wrappedParent)
            assert.strictEqual(wrappedParent?.ref, parent)
            assert.ok(isInstance(wrappedParent, JJHE)) // Should be the most specific wrapper, which is JJHE for HTMLElement
            assert.ok(isOwnInstance(wrappedParent, JJHE))
        })

        it('returns null for detached nodes', () => {
            const child = document.createElement('span')
            const jjn = JJN.from(child)

            assert.strictEqual(jjn.getParent(), null)
        })

        it('returns the most specific wrapper for the parent', () => {
            const parent = document.createElement('div')
            const child = document.createTextNode('test')
            parent.appendChild(child)

            const jjn = JJN.from(child)
            const wrappedParent = jjn.getParent()

            assert.ok(wrappedParent)
            assert.ok(isInstance(wrappedParent, JJHE)) // Should be the most specific wrapper, which is JJHE for HTMLElement
            assert.ok(isOwnInstance(wrappedParent, JJHE))
        })

        it('throws when required and detached', () => {
            const child = document.createElement('span')
            const jjn = JJN.from(child)

            assert.throws(() => jjn.getParent(true), {
                name: 'ReferenceError',
                message: /Node has no parent/,
            })
        })
    })

    describe('getChildren()', () => {
        it('returns wrapped child nodes', () => {
            const parent = document.createElement('div')
            const child1 = document.createElement('span')
            const child2 = document.createTextNode('test')
            parent.append(child1, child2)

            const jjn = JJN.from(parent)
            const children = jjn.getChildren()

            assert.strictEqual(children.length, 2)
            assert.strictEqual(children[0]?.ref, child1)
            assert.strictEqual(children[1]?.ref, child2)
        })

        it('returns an empty array when there are no children', () => {
            const parent = document.createElement('div')
            const jjn = JJN.from(parent)

            assert.deepStrictEqual(jjn.getChildren(), [])
        })

        it('returns the most specific wrappers for children', () => {
            const parent = document.createElement('div')
            const child1 = document.createElement('span')
            const child2 = document.createTextNode('test')
            parent.append(child1, child2)

            const jjn = JJN.from(parent)
            const children = jjn.getChildren()

            assert.ok(isInstance(children[0], JJHE))
            assert.ok(isOwnInstance(children[0], JJHE))
            assert.strictEqual(children[1]?.constructor.name, 'JJT')
        })

        it('throws when required and there are no children', () => {
            const parent = document.createElement('div')
            const jjn = JJN.from(parent)

            assert.throws(() => jjn.getChildren(true), {
                name: 'ReferenceError',
                message: /Node has no children/,
            })
        })
    })

    describe('rm()', () => {
        it('removes node from parent', () => {
            const parent = document.createElement('div')
            const child = document.createElement('span')
            parent.appendChild(child)

            const jjn = JJN.from(child)
            const result = jjn.rm()

            assert.strictEqual(result, jjn)
            assert.strictEqual(parent.childNodes.length, 0)
            assert.strictEqual(child.parentNode, null)
        })

        it('does nothing for detached nodes', () => {
            const child = document.createElement('span')
            const jjn = JJN.from(child)

            assert.doesNotThrow(() => jjn.rm())
            assert.strictEqual(child.parentNode, null)
        })

        it('removes text nodes from their parent', () => {
            const parent = document.createElement('div')
            const child = document.createTextNode('test')
            parent.appendChild(child)

            const jjn = JJN.from(child)
            jjn.rm()

            assert.strictEqual(parent.textContent, '')
            assert.strictEqual(child.parentNode, null)
        })
    })
})
