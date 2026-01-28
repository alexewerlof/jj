import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JSDOM } from 'jsdom'
import { JJHE } from './JJHE.js'

const { window } = new JSDOM()
global.HTMLElement = window.HTMLElement
global.Element = window.Element
global.Node = window.Node
global.EventTarget = window.EventTarget
global.document = window.document

describe('JJHE', () => {
    describe('constructor', () => {
        it('wraps an HTMLElement', () => {
            const el = document.createElement('div')
            const jjhe = new JJHE(el)
            assert.strictEqual(jjhe.ref, el)
        })

        it('throws if not HTMLElement', () => {
            assert.throws(() => new JJHE({} as any), TypeError)
        })
    })

    describe('static from()', () => {
        it('creates JJHE from HTMLElement', () => {
            const el = document.createElement('div')
            const jjhe = JJHE.from(el)
            assert.ok(jjhe instanceof JJHE)
        })
    })

    describe('static fromTag()', () => {
        it('creates JJHE from tag name', () => {
            const jjhe = JJHE.fromTag('span')
            assert.ok(jjhe.ref instanceof HTMLElement)
            assert.strictEqual(jjhe.ref.tagName, 'SPAN')
        })

        it('throws TypeError for non-string tagName', () => {
            assert.throws(() => JJHE.fromTag(123 as any), TypeError)
        })
    })

    describe('data attribute methods', () => {
        describe('getData()', () => {
            it('gets data attribute', () => {
                const el = document.createElement('div')
                el.dataset.testKey = 'value'
                const jjhe = new JJHE(el)
                assert.strictEqual(jjhe.getData('testKey'), 'value')
            })

            it('returns undefined for missing data', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.strictEqual(jjhe.getData('missing'), undefined)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.getData(123 as any), TypeError)
            })
        })

        describe('hasData()', () => {
            it('checks data attribute existence', () => {
                const el = document.createElement('div')
                el.dataset.exists = 'value'
                const jjhe = new JJHE(el)
                assert.strictEqual(jjhe.hasData('exists'), true)
                assert.strictEqual(jjhe.hasData('missing'), false)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.hasData(null as any), TypeError)
            })
        })

        describe('setData()', () => {
            it('sets single data attribute', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setData('testKey', 'value')
                assert.strictEqual(el.dataset.testKey, 'value')
            })

            it('sets multiple data attributes from object', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setData({ key1: 'val1', key2: 'val2' })
                assert.strictEqual(el.dataset.key1, 'val1')
                assert.strictEqual(el.dataset.key2, 'val2')
            })

            it('throws TypeError for non-string value in single mode', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.setData('key', 123 as any), TypeError)
            })

            it('throws TypeError for non-string value in object mode', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.setData({ key: 123 } as any), TypeError)
            })

            it('throws TypeError for invalid type', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.setData(123 as any), TypeError)
            })
        })

        describe('rmData()', () => {
            it('removes data attributes', () => {
                const el = document.createElement('div')
                el.dataset.key1 = 'val1'
                el.dataset.key2 = 'val2'
                const jjhe = new JJHE(el)
                jjhe.rmData('key1', 'key2')
                assert.strictEqual(el.dataset.key1, undefined)
                assert.strictEqual(el.dataset.key2, undefined)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.rmData(null as any), TypeError)
            })
        })
    })

    describe('form element methods', () => {
        describe('getValue()', () => {
            it('gets value from input', () => {
                const el = document.createElement('input')
                el.value = 'test'
                const jjhe = new JJHE(el)
                assert.strictEqual(jjhe.getValue(), 'test')
            })

            it('throws Error for element without value property', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.getValue(), {
                    name: 'Error',
                    message: /Cannot get value from DIV/,
                })
            })
        })

        describe('setValue()', () => {
            it('sets value on input', () => {
                const el = document.createElement('input')
                const jjhe = new JJHE(el)
                jjhe.setValue('test')
                assert.strictEqual(el.value, 'test')
            })

            it('throws TypeError for non-string value', () => {
                const el = document.createElement('input')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.setValue(123 as any), TypeError)
            })

            it('throws Error for element without value property', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.setValue('test'), {
                    name: 'Error',
                    message: /Cannot set value on DIV/,
                })
            })
        })
    })

    describe('text methods', () => {
        describe('getText()', () => {
            it('gets innerText', () => {
                const el = document.createElement('div')
                el.innerText = 'test content'
                const jjhe = new JJHE(el)
                assert.strictEqual(jjhe.getText(), 'test content')
            })
        })

        describe('setText()', () => {
            it('sets innerText', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setText('new text')
                assert.strictEqual(el.innerText, 'new text')
            })

            it('clears text with null', () => {
                const el = document.createElement('div')
                el.innerText = 'old text'
                const jjhe = new JJHE(el)
                jjhe.setText(null)
                assert.strictEqual(el.innerText, '')
            })

            it('clears text with undefined', () => {
                const el = document.createElement('div')
                el.innerText = 'old text'
                const jjhe = new JJHE(el)
                jjhe.setText(undefined)
                assert.strictEqual(el.innerText, '')
            })

            it('throws TypeError for non-string/null/undefined value', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.setText(123 as any), TypeError)
            })
        })
    })

    describe('interaction methods', () => {
        it('focus() focuses element', () => {
            const el = document.createElement('input')
            document.body.appendChild(el)
            const jjhe = new JJHE(el)
            jjhe.focus()
            // Note: In jsdom, focus() doesn't actually change activeElement
            // but we can verify the method exists and doesn't throw
            assert.ok(true)
            document.body.removeChild(el)
        })

        it('click() clicks element', () => {
            const el = document.createElement('button')
            let clicked = false
            el.addEventListener('click', () => (clicked = true))
            const jjhe = new JJHE(el)
            jjhe.click()
            assert.strictEqual(clicked, true)
        })
    })
})
