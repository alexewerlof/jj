import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JSDOM } from 'jsdom'
import { JJE } from './JJE.js'

const { window } = new JSDOM()
global.Element = window.Element
global.HTMLElement = window.HTMLElement
global.SVGElement = window.SVGElement
global.Node = window.Node
global.EventTarget = window.EventTarget
global.document = window.document

describe('JJE', () => {
    describe('constructor', () => {
        it('wraps an Element', () => {
            const el = document.createElement('div')
            const jje = new JJE(el)
            assert.strictEqual(jje.ref, el)
        })

        it('throws if not Element', () => {
            assert.throws(() => new JJE({} as any), TypeError)
            assert.throws(() => new JJE(document.createTextNode('text') as any), TypeError)
        })
    })

    describe('static from()', () => {
        it('creates JJE from Element', () => {
            const el = document.createElement('div')
            const jje = JJE.from(el)
            assert.ok(jje instanceof JJE)
            assert.strictEqual(jje.ref, el)
        })
    })

    describe('attribute methods', () => {
        describe('getAttr()', () => {
            it('gets attribute value', () => {
                const el = document.createElement('div')
                el.setAttribute('data-test', 'value')
                const jje = new JJE(el)
                assert.strictEqual(jje.getAttr('data-test'), 'value')
            })

            it('returns null for missing attribute', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.strictEqual(jje.getAttr('missing'), null)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.getAttr(123 as any), {
                    name: 'TypeError',
                    message: /Expected 'name' to be a string/,
                })
            })
        })

        describe('hasAttr()', () => {
            it('returns true for existing attribute', () => {
                const el = document.createElement('div')
                el.setAttribute('data-test', 'value')
                const jje = new JJE(el)
                assert.strictEqual(jje.hasAttr('data-test'), true)
            })

            it('returns false for missing attribute', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.strictEqual(jje.hasAttr('missing'), false)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.hasAttr(null as any), TypeError)
            })
        })

        describe('setAttr()', () => {
            it('sets single attribute', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAttr('data-test', 'value')
                assert.strictEqual(el.getAttribute('data-test'), 'value')
            })

            it('sets multiple attributes from object', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAttr({ id: 'my-id', 'data-test': 'value' })
                assert.strictEqual(el.getAttribute('id'), 'my-id')
                assert.strictEqual(el.getAttribute('data-test'), 'value')
            })

            it('returns this for chaining', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                const result = jje.setAttr('x', 'y')
                assert.strictEqual(result, jje)
            })

            it('accepts numbers and converts to strings', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAttr('x', 123)
                assert.strictEqual(el.getAttribute('x'), '123')
            })

            it('accepts booleans and converts to strings', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAttr('enabled', true)
                assert.strictEqual(el.getAttribute('enabled'), 'true')
            })

            it('accepts numbers in object mode', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAttr({ x: 10, y: 20 })
                assert.strictEqual(el.getAttribute('x'), '10')
                assert.strictEqual(el.getAttribute('y'), '20')
            })

            it('throws TypeError for invalid nameOrObj type', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.setAttr(123 as any), TypeError)
            })
        })

        describe('rmAttr()', () => {
            it('removes single attribute', () => {
                const el = document.createElement('div')
                el.setAttribute('data-test', 'value')
                const jje = new JJE(el)
                jje.rmAttr('data-test')
                assert.strictEqual(el.hasAttribute('data-test'), false)
            })

            it('removes multiple attributes', () => {
                const el = document.createElement('div')
                el.setAttribute('a', '1')
                el.setAttribute('b', '2')
                const jje = new JJE(el)
                jje.rmAttr('a', 'b')
                assert.strictEqual(el.hasAttribute('a'), false)
                assert.strictEqual(el.hasAttribute('b'), false)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.rmAttr(null as any), TypeError)
            })
        })
    })

    describe('ARIA methods', () => {
        describe('getAria()', () => {
            it('gets aria attribute value', () => {
                const el = document.createElement('div')
                el.setAttribute('aria-label', 'test')
                const jje = new JJE(el)
                assert.strictEqual(jje.getAria('label'), 'test')
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.getAria(123 as any), TypeError)
            })
        })

        describe('hasAria()', () => {
            it('checks aria attribute existence', () => {
                const el = document.createElement('div')
                el.setAttribute('aria-hidden', 'true')
                const jje = new JJE(el)
                assert.strictEqual(jje.hasAria('hidden'), true)
                assert.strictEqual(jje.hasAria('label'), false)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.hasAria({} as any), TypeError)
            })
        })

        describe('setAria()', () => {
            it('sets single aria attribute', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAria('label', 'My Label')
                assert.strictEqual(el.getAttribute('aria-label'), 'My Label')
            })

            it('sets multiple aria attributes from object', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAria({ label: 'Test', hidden: 'true' })
                assert.strictEqual(el.getAttribute('aria-label'), 'Test')
                assert.strictEqual(el.getAttribute('aria-hidden'), 'true')
            })

            it('accepts numbers and converts to strings in single mode', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAria('level', 2)
                assert.strictEqual(el.getAttribute('aria-level'), '2')
            })

            it('accepts numbers and converts to strings in object mode', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAria({ level: 3 })
                assert.strictEqual(el.getAttribute('aria-level'), '3')
            })
        })

        describe('rmAria()', () => {
            it('removes aria attributes', () => {
                const el = document.createElement('div')
                el.setAttribute('aria-label', 'test')
                el.setAttribute('aria-hidden', 'true')
                const jje = new JJE(el)
                jje.rmAria('label', 'hidden')
                assert.strictEqual(el.hasAttribute('aria-label'), false)
                assert.strictEqual(el.hasAttribute('aria-hidden'), false)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.rmAria(null as any), TypeError)
            })
        })
    })

    describe('class methods', () => {
        describe('getClass()', () => {
            it('gets className', () => {
                const el = document.createElement('div')
                el.className = 'foo bar'
                const jje = new JJE(el)
                assert.strictEqual(jje.getClass(), 'foo bar')
            })
        })

        describe('setClass()', () => {
            it('sets className from string', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setClass('foo bar')
                assert.strictEqual(el.className, 'foo bar')
            })

            it('sets classes conditionally from object', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setClass({ active: true, disabled: false, selected: true })
                assert.ok(el.classList.contains('active'))
                assert.ok(!el.classList.contains('disabled'))
                assert.ok(el.classList.contains('selected'))
            })
        })

        describe('addClass()', () => {
            it('adds single class', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.addClass('foo')
                assert.ok(el.classList.contains('foo'))
            })

            it('adds multiple classes', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.addClass('foo', 'bar', 'baz')
                assert.ok(el.classList.contains('foo'))
                assert.ok(el.classList.contains('bar'))
                assert.ok(el.classList.contains('baz'))
            })

            it('throws TypeError for non-string className', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.addClass(123 as any), TypeError)
            })
        })

        describe('rmClass()', () => {
            it('removes classes', () => {
                const el = document.createElement('div')
                el.className = 'foo bar baz'
                const jje = new JJE(el)
                jje.rmClass('foo', 'baz')
                assert.ok(!el.classList.contains('foo'))
                assert.ok(el.classList.contains('bar'))
                assert.ok(!el.classList.contains('baz'))
            })

            it('throws TypeError for non-string className', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.rmClass(null as any), TypeError)
            })
        })

        describe('hasClass()', () => {
            it('checks class existence', () => {
                const el = document.createElement('div')
                el.className = 'foo bar'
                const jje = new JJE(el)
                assert.strictEqual(jje.hasClass('foo'), true)
                assert.strictEqual(jje.hasClass('baz'), false)
            })

            it('throws TypeError for non-string className', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.hasClass([] as any), TypeError)
            })
        })

        describe('toggleClass()', () => {
            it('toggles class', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.toggleClass('foo')
                assert.ok(el.classList.contains('foo'))
                jje.toggleClass('foo')
                assert.ok(!el.classList.contains('foo'))
            })

            it('throws TypeError for non-string className', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.toggleClass({} as any), TypeError)
            })
        })

        describe('replaceClass()', () => {
            it('replaces class', () => {
                const el = document.createElement('div')
                el.className = 'foo'
                const jje = new JJE(el)
                jje.replaceClass('foo', 'bar')
                assert.ok(!el.classList.contains('foo'))
                assert.ok(el.classList.contains('bar'))
            })

            it('throws TypeError for non-string oldClassName', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.replaceClass(null as any, 'bar'), TypeError)
            })

            it('throws TypeError for non-string newClassName', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.replaceClass('foo', undefined as any), TypeError)
            })
        })
    })

    describe('visibility methods', () => {
        it('hide() sets hidden and aria-hidden', () => {
            const el = document.createElement('div')
            const jje = new JJE(el)
            jje.hide()
            assert.strictEqual(el.hasAttribute('hidden'), true)
            assert.strictEqual(el.getAttribute('aria-hidden'), 'true')
        })

        it('show() removes hidden and aria-hidden', () => {
            const el = document.createElement('div')
            el.setAttribute('hidden', '')
            el.setAttribute('aria-hidden', 'true')
            const jje = new JJE(el)
            jje.show()
            assert.strictEqual(el.hasAttribute('hidden'), false)
            assert.strictEqual(el.hasAttribute('aria-hidden'), false)
        })
    })
})
