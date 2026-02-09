import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JSDOM } from 'jsdom'
import { JJN } from './JJN.js'

const { window } = new JSDOM()
global.Node = window.Node
global.Text = window.Text
global.Element = window.Element
global.HTMLElement = window.HTMLElement
global.SVGElement = window.SVGElement
global.Document = window.Document
global.DocumentFragment = window.DocumentFragment
global.ShadowRoot = window.ShadowRoot
global.EventTarget = window.EventTarget
global.document = window.document

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

    describe('static isWrapable()', () => {
        it('returns true for strings', () => {
            assert.strictEqual(JJN.isWrapable('test'), true)
        })

        it('returns true for Nodes', () => {
            const node = document.createTextNode('test')
            assert.strictEqual(JJN.isWrapable(node), true)
        })

        it('returns true for JJN instances', () => {
            const node = document.createTextNode('test')
            const jjn = new JJN(node)
            assert.strictEqual(JJN.isWrapable(jjn), true)
        })

        it('returns false for other types', () => {
            assert.strictEqual(JJN.isWrapable(null), false)
            assert.strictEqual(JJN.isWrapable(undefined), false)
            assert.strictEqual(JJN.isWrapable(42), false)
            assert.strictEqual(JJN.isWrapable({}), false)
            assert.strictEqual(JJN.isWrapable([]), false)
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

        it('throws for invalid types', () => {
            assert.throws(() => JJN.unwrap(42 as any), TypeError)
            assert.throws(() => JJN.unwrap({} as any), TypeError)
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
            assert.strictEqual(parent.childNodes.length, 0)
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
})
