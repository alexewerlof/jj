import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { h, hc, JJHE } from '../src/index.js'

describe('helpers', () => {
    describe('h()', () => {
        it('creates element from tag name', () => {
            const el = h('div')
            assert.ok(el instanceof JJHE)
            assert.strictEqual(el.ref.tagName, 'DIV')
        })

        it('sets attributes', () => {
            const el = h('div', { id: 'test', class: 'foo' })
            assert.strictEqual(el.ref.id, 'test')
            assert.strictEqual(el.ref.className, 'foo')
        })

        it('handles null attributes', () => {
            const el = h('div', null, 'text')
            assert.ok(el instanceof JJHE)
            assert.strictEqual(el.ref.textContent, 'text')
        })

        it('appends string children', () => {
            const el = h('div', null, 'hello', ' world')
            assert.strictEqual(el.ref.textContent, 'hello world')
        })

        it('appends element children', () => {
            const child = document.createElement('span')
            const el = h('div', null, child)
            assert.strictEqual(el.ref.childNodes.length, 1)
            assert.strictEqual(el.ref.firstChild, child)
        })

        it('appends JJHE children', () => {
            const child = h('span')
            const el = h('div', null, child)
            assert.strictEqual(el.ref.childNodes.length, 1)
            assert.strictEqual(el.ref.firstChild, child.ref)
        })

        it('creates nested structure', () => {
            const el = h('ul', null, h('li', null, 'Item 1'), h('li', null, 'Item 2'))
            assert.strictEqual(el.ref.childNodes.length, 2)
            assert.strictEqual(el.ref.childNodes[0].textContent, 'Item 1')
            assert.strictEqual(el.ref.childNodes[1].textContent, 'Item 2')
        })
    })

    describe('hc()', () => {
        it('creates element from tag name', () => {
            const el = hc('div', [])
            assert.ok(el instanceof JJHE)
            assert.strictEqual(el.ref.tagName, 'DIV')
        })

        it('appends string children', () => {
            const el = hc('div', ['hello', ' world'])
            assert.strictEqual(el.ref.textContent, 'hello world')
        })

        it('appends element and JJHE children', () => {
            const childEl = document.createElement('span')
            const childJJ = hc('strong', ['x'])
            const el = hc('div', [childEl, childJJ])

            assert.strictEqual(el.ref.childNodes.length, 2)
            assert.strictEqual(el.ref.childNodes[0], childEl)
            assert.strictEqual(el.ref.childNodes[1], childJJ.ref)
        })

        it('creates nested structure', () => {
            const el = hc('ul', [hc('li', ['Item 1']), hc('li', ['Item 2'])])
            assert.strictEqual(el.ref.childNodes.length, 2)
            assert.strictEqual(el.ref.childNodes[0].textContent, 'Item 1')
            assert.strictEqual(el.ref.childNodes[1].textContent, 'Item 2')
        })

        it('throws when children is not an array', () => {
            assert.throws(() => {
                hc('div', 'not-an-array' as unknown as [])
            }, /children/i)
        })
    })
})
