import { describe, it } from 'node:test'
import assert from 'node:assert'
import './attach-jsdom.js'
import { attr2prop, registerComponent } from '../src/index.js'

describe('components', () => {
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
                message: /Call attr2prop\(this, \.\.\.\) from attributeChangedCallback on a custom element instance/,
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

        it('can be returned from a component register method and awaited by importers', async () => {
            class TestElement4 extends HTMLElement {
                static register() {
                    return registerComponent('test-element-4', TestElement4)
                }
            }

            await TestElement4.register()
            assert.strictEqual(customElements.get('test-element-4'), TestElement4)
        })

        it('throws TypeError for non-string name', async () => {
            class TestElement extends HTMLElement {}
            await assert.rejects(async () => await registerComponent(123 as any, TestElement), {
                name: 'TypeError',
                message: /Use a custom-element tag name like/,
            })
        })

        it('throws TypeError for non-function constructor', async () => {
            await assert.rejects(async () => await registerComponent('test-element-5', 'not-a-function' as any), {
                name: 'TypeError',
                message: /Pass the custom element class itself, e\.g\. registerComponent/,
            })
        })
    })
})
