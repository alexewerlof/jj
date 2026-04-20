import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJHE, JJN } from '../src/index.js'
import { isInstance } from '../src/internal.js'

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

        it('coerces primitives and objects via toStr()', () => {
            const parent = document.createElement('div')
            const jjn = new JJN(parent)

            jjn.addText(false)
            jjn.addText(0)
            jjn.addText({ ok: true })
            jjn.addText(Symbol('x'))

            assert.strictEqual(parent.textContent, 'false0{"ok":true}Symbol(x)')
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

    describe('getParentNode()', () => {
        it('returns wrapped parent node', () => {
            const parent = document.createElement('div')
            const child = document.createElement('span')
            parent.appendChild(child)

            const jjn = JJN.from(child)
            const wrappedParent = jjn.getParentNode()

            assert.ok(wrappedParent)
            assert.strictEqual(wrappedParent?.ref, parent)
            assert.ok(isInstance(wrappedParent, JJHE)) // Should be the most specific wrapper, which is JJHE for HTMLElement
            assert.strictEqual(wrappedParent?.constructor, JJHE)
        })

        it('returns null for detached nodes', () => {
            const child = document.createElement('span')
            const jjn = JJN.from(child)

            assert.strictEqual(jjn.getParentNode(), null)
        })

        it('returns the most specific wrapper for the parent', () => {
            const parent = document.createElement('div')
            const child = document.createTextNode('test')
            parent.appendChild(child)

            const jjn = JJN.from(child)
            const wrappedParent = jjn.getParentNode()

            assert.ok(wrappedParent)
            assert.ok(isInstance(wrappedParent, JJHE)) // Should be the most specific wrapper, which is JJHE for HTMLElement
            assert.strictEqual(wrappedParent?.constructor, JJHE)
        })

        it('throws when required and detached', () => {
            const child = document.createElement('span')
            const jjn = JJN.from(child)

            assert.throws(() => jjn.getParentNode(true), {
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
            const children = jjn.getChildren(true)

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
            const children = jjn.getChildren(true)

            assert.ok(isInstance(children[0], JJHE))
            assert.strictEqual(children[0]?.constructor, JJHE)
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
