import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JSDOM } from 'jsdom'
import { ShadowMaster, attr2prop, registerComponent } from './components.js'
import { JJHE } from './JJHE.js'

const { window } = new JSDOM()
global.HTMLElement = window.HTMLElement
global.CSSStyleSheet = window.CSSStyleSheet
global.Element = window.Element
global.Node = window.Node
global.EventTarget = window.EventTarget
global.document = window.document
global.customElements = window.customElements

describe('components', () => {
    describe('ShadowMaster', () => {
        describe('create()', () => {
            it('creates a new instance', () => {
                const sm = ShadowMaster.create()
                assert.ok(sm instanceof ShadowMaster)
            })
        })

        describe('setTemplate()', () => {
            it('sets template from string', async () => {
                const sm = ShadowMaster.create()
                sm.setTemplate('<div>Hello</div>')
                const config = await sm.getResolved()
                assert.strictEqual(config.template, '<div>Hello</div>')
            })

            it('returns this for chaining', () => {
                const sm = ShadowMaster.create()
                const result = sm.setTemplate('<div>test</div>')
                assert.strictEqual(result, sm)
            })

            it('accepts undefined template', async () => {
                const sm = ShadowMaster.create()
                sm.setTemplate(undefined)
                const config = await sm.getResolved()
                assert.strictEqual(config.template, undefined)
            })

            it('resolves template from promise', async () => {
                const sm = ShadowMaster.create()
                sm.setTemplate(Promise.resolve('<div>Async</div>'))
                const config = await sm.getResolved()
                assert.strictEqual(config.template, '<div>Async</div>')
            })

            it('resolves template from function', async () => {
                const sm = ShadowMaster.create()
                sm.setTemplate(() => '<div>Function</div>')
                const config = await sm.getResolved()
                assert.strictEqual(config.template, '<div>Function</div>')
            })

            it('resolves template from async function', async () => {
                const sm = ShadowMaster.create()
                sm.setTemplate(async () => '<div>Async Function</div>')
                const config = await sm.getResolved()
                assert.strictEqual(config.template, '<div>Async Function</div>')
            })

            it('resolves template from JJHE instance', async () => {
                const el = JJHE.create('div')
                el.setAttr('class', 'test')
                el.ref.innerHTML = '<span>content</span>'
                const sm = ShadowMaster.create()
                sm.setTemplate(el)
                const config = await sm.getResolved()
                // JJHE.getHTML() returns innerHTML, not outerHTML
                assert.strictEqual(config.template, '<span>content</span>')
            })

            it('resolves template from HTMLElement', async () => {
                const el = document.createElement('div')
                el.className = 'test'
                el.innerHTML = '<span>content</span>'
                const sm = ShadowMaster.create()
                sm.setTemplate(el)
                const config = await sm.getResolved()
                assert.ok(config.template?.includes('<div'))
                assert.ok(config.template?.includes('class="test"'))
            })

            it('throws TypeError for invalid template type', async () => {
                const sm = ShadowMaster.create()
                sm.setTemplate(123 as any)
                await assert.rejects(async () => await sm.getResolved(), {
                    name: 'TypeError',
                    message: /Expected 'template' to be a string, JJHE, or HTMLElement/,
                })
            })
        })

        describe('addStyles()', () => {
            it('adds style from string', async () => {
                const sm = ShadowMaster.create()
                sm.addStyles('p { color: red; }')
                const config = await sm.getResolved()
                assert.ok(config.styles)
                assert.strictEqual(config.styles.length, 1)
                assert.ok(config.styles[0] instanceof CSSStyleSheet)
            })

            it('adds multiple styles', async () => {
                const sm = ShadowMaster.create()
                sm.addStyles('p { color: red; }', 'div { color: blue; }')
                const config = await sm.getResolved()
                assert.ok(config.styles)
                assert.strictEqual(config.styles.length, 2)
            })

            it('returns this for chaining', () => {
                const sm = ShadowMaster.create()
                const result = sm.addStyles('p { color: red; }')
                assert.strictEqual(result, sm)
            })

            it('resolves style from CSSStyleSheet', async () => {
                const sheet = new CSSStyleSheet()
                const sm = ShadowMaster.create()
                sm.addStyles(sheet)
                const config = await sm.getResolved()
                assert.ok(config.styles)
                assert.strictEqual(config.styles[0], sheet)
            })

            it('resolves style from promise', async () => {
                const sheet = new CSSStyleSheet()
                const sm = ShadowMaster.create()
                sm.addStyles(Promise.resolve(sheet))
                const config = await sm.getResolved()
                assert.ok(config.styles)
                assert.strictEqual(config.styles[0], sheet)
            })

            it('resolves style from function', async () => {
                const sm = ShadowMaster.create()
                sm.addStyles(() => 'p { color: green; }')
                const config = await sm.getResolved()
                assert.ok(config.styles)
                assert.ok(config.styles[0] instanceof CSSStyleSheet)
            })

            it('resolves style from async function', async () => {
                const sm = ShadowMaster.create()
                sm.addStyles(async () => 'p { color: purple; }')
                const config = await sm.getResolved()
                assert.ok(config.styles)
                assert.ok(config.styles[0] instanceof CSSStyleSheet)
            })

            it('throws TypeError for invalid style type', async () => {
                const sm = ShadowMaster.create()
                sm.addStyles(123 as any)
                await assert.rejects(async () => await sm.getResolved(), {
                    name: 'TypeError',
                    message: /Expected 'style' to be a CSS string or CSSStyleSheet/,
                })
            })

            it('handles empty styles array', async () => {
                const sm = ShadowMaster.create()
                const config = await sm.getResolved()
                assert.ok(config.styles)
                assert.strictEqual(config.styles.length, 0)
            })
        })

        describe('getResolved()', () => {
            it('caches the resolved config', async () => {
                const sm = ShadowMaster.create()
                sm.setTemplate('<div>Test</div>')
                const config1 = await sm.getResolved()
                const config2 = await sm.getResolved()
                assert.strictEqual(config1, config2) // Same promise/object
            })

            it('ignores changes after first resolution', async () => {
                const sm = ShadowMaster.create()
                sm.setTemplate('<div>First</div>')
                const config1 = await sm.getResolved()
                sm.setTemplate('<div>Second</div>') // This should be ignored
                const config2 = await sm.getResolved()
                assert.strictEqual(config1, config2)
                assert.strictEqual(config2.template, '<div>First</div>')
            })

            it('combines template and styles', async () => {
                const sm = ShadowMaster.create()
                sm.setTemplate('<p>Hello</p>')
                sm.addStyles('p { color: red; }')
                const config = await sm.getResolved()
                assert.strictEqual(config.template, '<p>Hello</p>')
                assert.ok(config.styles)
                assert.strictEqual(config.styles.length, 1)
            })
        })

        describe('chaining', () => {
            it('allows method chaining', async () => {
                const config = await ShadowMaster.create()
                    .setTemplate('<div>Chained</div>')
                    .addStyles('div { color: red; }', 'div { font-size: 12px; }')
                    .getResolved()

                assert.strictEqual(config.template, '<div>Chained</div>')
                assert.ok(config.styles)
                assert.strictEqual(config.styles.length, 2)
            })
        })
    })

    describe('attr2prop()', () => {
        it('converts kebab-case attribute to camelCase property', () => {
            // Use a plain HTMLElement with dynamic properties instead of custom element
            const el = document.createElement('div') as any
            el.userName = ''
            const result = attr2prop(el, 'user-name', null, 'John')
            assert.strictEqual(result, true)
            assert.strictEqual(el.userName, 'John')
        })

        it('converts single-word attribute to property', () => {
            const el = document.createElement('div') as any
            el.counter = 0
            const result = attr2prop(el, 'counter', '0', '5')
            assert.strictEqual(result, true)
            assert.strictEqual(el.counter, '5')
        })

        it('does not set if old and new values are same', () => {
            const el = document.createElement('div') as any
            el.userName = 'Original'
            const result = attr2prop(el, 'user-name', 'test', 'test')
            assert.strictEqual(result, false)
            assert.strictEqual(el.userName, 'Original')
        })

        it('returns false if property does not exist', () => {
            const el = document.createElement('div')
            const result = attr2prop(el, 'non-existent', null, 'value')
            assert.strictEqual(result, false)
        })

        it('throws TypeError for non-HTMLElement instance', () => {
            assert.throws(() => attr2prop({} as any, 'test', null, 'value'), {
                name: 'TypeError',
                message: /Expected 'instance' to be an HTMLElement/,
            })
        })

        it('works with properties via setters', () => {
            const el = document.createElement('div') as any
            let internalValue = 0
            Object.defineProperty(el, 'testValue', {
                get() {
                    return internalValue
                },
                set(val: any) {
                    internalValue = Number(val)
                },
            })

            attr2prop(el, 'test-value', null, '42')
            assert.strictEqual(el.testValue, 42)
        })
    })

    describe('registerComponent()', () => {
        it('registers a custom element', async () => {
            class TestElement extends HTMLElement {}
            await registerComponent('test-element-1', TestElement)
            assert.strictEqual(customElements.get('test-element-1'), TestElement)
        })

        it('does not re-register if already registered', async () => {
            class TestElement2 extends HTMLElement {}
            await registerComponent('test-element-2', TestElement2)
            // Should not throw when called again
            await registerComponent('test-element-2', TestElement2)
            assert.strictEqual(customElements.get('test-element-2'), TestElement2)
        })

        it('accepts options parameter', async () => {
            class TestElement3 extends HTMLElement {}
            await registerComponent('test-element-3', TestElement3, { extends: 'div' })
            assert.ok(customElements.get('test-element-3'))
        })

        it('throws TypeError for non-string name', async () => {
            class TestElement extends HTMLElement {}
            await assert.rejects(async () => await registerComponent(123 as any, TestElement), {
                name: 'TypeError',
                message: /Expected 'name' to be a string/,
            })
        })

        it('throws TypeError for non-function constructor', async () => {
            await assert.rejects(async () => await registerComponent('test-element-4', 'not-a-function' as any), {
                name: 'TypeError',
                message: /Expected 'constructor' to be a function/,
            })
        })
    })
})
