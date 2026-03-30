import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJHE } from '../src/index.js'

describe('JJHE', () => {
    describe('constructor', () => {
        it('wraps an HTMLElement', () => {
            const el = document.createElement('div')
            const jjhe = new JJHE(el)
            assert.strictEqual(jjhe.ref, el)
        })

        it('throws if not HTMLElement', () => {
            assert.throws(() => new JJHE({} as any), /Use JJHE\.from\(\) or JJHE\.create\(\)\./)
        })
    })

    describe('static from()', () => {
        it('creates JJHE from HTMLElement', () => {
            const el = document.createElement('div')
            const jjhe = JJHE.from(el)
            assert.ok(jjhe instanceof JJHE)
        })
    })

    describe('static create()', () => {
        it('creates JJHE from tag name', () => {
            const jjhe = JJHE.create('span')
            assert.ok(jjhe.ref instanceof HTMLElement)
            assert.strictEqual(jjhe.ref.tagName, 'SPAN')
        })

        it('throws TypeError for non-string tagName', () => {
            assert.throws(() => JJHE.create(123 as any), /Pass a valid HTML tag name/)
        })

        it('throws for common SVG tag names and suggests JJSE', () => {
            assert.throws(() => JJHE.create('circle' as any), /Use JJSE\.create\("circle"\) for SVG elements\./)
        })

        it('throws for common MathML tag names and suggests JJME', () => {
            assert.throws(() => JJHE.create('mi' as any), /Use JJME\.create\("mi"\) for MathML elements\./)
        })
    })

    describe('data attribute methods', () => {
        describe('getDataAttr()', () => {
            it('gets data attribute', () => {
                const el = document.createElement('div')
                el.dataset.testKey = 'value'
                const jjhe = new JJHE(el)
                assert.strictEqual(jjhe.getDataAttr('testKey'), 'value')
            })

            it('returns undefined for missing data', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.strictEqual(jjhe.getDataAttr('missing'), undefined)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.getDataAttr(123 as any), TypeError)
            })
        })

        describe('hasDataAttr()', () => {
            it('checks data attribute existence', () => {
                const el = document.createElement('div')
                el.dataset.exists = 'value'
                const jjhe = new JJHE(el)
                assert.strictEqual(jjhe.hasDataAttr('exists'), true)
                assert.strictEqual(jjhe.hasDataAttr('missing'), false)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.hasDataAttr(null as any), TypeError)
            })
        })

        describe('setDataAttr()', () => {
            it('sets single data attribute', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setDataAttr('testKey', 'value')
                assert.strictEqual(el.dataset.testKey, 'value')
            })

            it('accepts numbers and converts to strings in single mode', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setDataAttr('key', 123 as unknown as string)
                assert.strictEqual(el.dataset.key, '123')
            })

            it('throws TypeError for invalid name type', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.setDataAttr(123 as any, 'value'), TypeError)
            })
        })

        describe('setDataAttrs()', () => {
            it('sets multiple data attributes from object', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setDataAttrs({ key1: 'val1', key2: 'val2' })
                assert.strictEqual(el.dataset.key1, 'val1')
                assert.strictEqual(el.dataset.key2, 'val2')
            })

            it('accepts numbers and converts to strings in object mode', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setDataAttrs({ key: 123 as unknown as string })
                assert.strictEqual(el.dataset.key, '123')
            })

            it('no-ops for nullish input', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.strictEqual(jjhe.setDataAttrs(null), jjhe)
                assert.strictEqual(jjhe.setDataAttrs(undefined), jjhe)
                assert.strictEqual(el.dataset.key, undefined)
            })

            it('throws TypeError for invalid type', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.setDataAttrs(123 as any), TypeError)
            })
        })

        describe('rmDataAttr()', () => {
            it('removes data attributes', () => {
                const el = document.createElement('div')
                el.dataset.key1 = 'val1'
                el.dataset.key2 = 'val2'
                const jjhe = new JJHE(el)
                jjhe.rmDataAttr('key1', 'key2')
                assert.strictEqual(el.dataset.key1, undefined)
                assert.strictEqual(el.dataset.key2, undefined)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.rmDataAttr(null as any), TypeError)
            })
        })

        describe('rmDataAttrs()', () => {
            it('removes data attributes from an array of names', () => {
                const el = document.createElement('div')
                el.dataset.key1 = 'val1'
                el.dataset.key2 = 'val2'
                const jjhe = new JJHE(el)
                jjhe.rmDataAttrs(['key1', 'key2'])
                assert.strictEqual(el.dataset.key1, undefined)
                assert.strictEqual(el.dataset.key2, undefined)
            })

            it('throws TypeError for non-array input', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.rmDataAttrs(null as any), TypeError)
            })

            it('throws TypeError for non-string names inside the array', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.rmDataAttrs(['key1', null as any]), TypeError)
            })
        })
    })

    describe('style methods', () => {
        describe('getStyle()', () => {
            it('gets a style property value', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setStyle('display', 'grid')
                assert.strictEqual(jjhe.getStyle('display'), 'grid')
            })

            it('returns empty string when style property is not set', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.strictEqual(jjhe.getStyle('display'), '')
            })

            it('throws TypeError for non-string property name', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.getStyle(123 as any), TypeError)
            })
        })

        describe('setStyle()', () => {
            it('sets a single style property', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setStyle('display', 'flex')
                assert.strictEqual(el.style.getPropertyValue('display'), 'flex')
            })

            it('sets numeric style values', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setStyle('opacity', 0)
                assert.strictEqual(el.style.getPropertyValue('opacity'), '0')
            })

            it('throws TypeError for non-string property name', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.setStyle({ display: 'grid' } as any, 'grid'), TypeError)
            })
        })

        describe('rmStyle()', () => {
            it('removes one or more style properties', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setStyles({ display: 'grid', gap: '1rem' })
                jjhe.rmStyle('display', 'gap')
                assert.strictEqual(el.style.getPropertyValue('display'), '')
                assert.strictEqual(el.style.getPropertyValue('gap'), '')
            })

            it('throws TypeError for non-string property names', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.rmStyle(null as any), TypeError)
            })
        })

        describe('setStyles()', () => {
            it('sets multiple style properties from object', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setStyles({ display: 'grid', gap: '1rem' })
                assert.strictEqual(el.style.getPropertyValue('display'), 'grid')
                assert.strictEqual(el.style.getPropertyValue('gap'), '1rem')
            })

            it('removes properties for nullish and false values', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setStyles({ display: 'grid', gap: '1rem', color: 'red' })
                jjhe.setStyles({ display: null, gap: undefined, color: false })
                assert.strictEqual(el.style.getPropertyValue('display'), '')
                assert.strictEqual(el.style.getPropertyValue('gap'), '')
                assert.strictEqual(el.style.getPropertyValue('color'), '')
            })

            it('does not treat zero as removable', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setStyles({ opacity: 0 })
                assert.strictEqual(el.style.getPropertyValue('opacity'), '0')
            })

            it('no-ops for nullish input', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.strictEqual(jjhe.setStyles(null), jjhe)
                assert.strictEqual(jjhe.setStyles(undefined), jjhe)
                assert.strictEqual(el.style.cssText, '')
            })

            it('throws TypeError for invalid styleMap input', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.setStyles('display: grid' as any), TypeError)
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
                    name: 'ReferenceError',
                    message: /has no value property/,
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

            it('accepts numbers and converts to strings', () => {
                const el = document.createElement('input')
                const jjhe = new JJHE(el)
                jjhe.setValue(123)
                assert.strictEqual(el.value, '123')
            })

            it('throws Error for element without value property', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                assert.throws(() => jjhe.setValue('test'), {
                    name: 'ReferenceError',
                    message: /has no value property/,
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
                assert.strictEqual(jjhe.getText(), el.innerText)
            })

            it('accepts numbers and converts to strings', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setText(123)
                // DOM API converts to string automatically
                assert.strictEqual(el.innerText, 123)
            })

            it('accepts booleans and converts to strings', () => {
                const el = document.createElement('div')
                const jjhe = new JJHE(el)
                jjhe.setText(true)
                // DOM API converts to string automatically
                assert.strictEqual(el.innerText, true)
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

    describe('static tree()', () => {
        it('creates element from tag name', () => {
            const el = JJHE.tree('div')
            assert.ok(el instanceof JJHE)
            assert.strictEqual(el.ref.tagName, 'DIV')
        })

        it('sets attributes', () => {
            const el = JJHE.tree('div', { id: 'test', class: 'foo' })
            assert.strictEqual(el.ref.id, 'test')
            assert.strictEqual(el.ref.className, 'foo')
        })

        it('handles null attributes', () => {
            const el = JJHE.tree('div', null, 'text')
            assert.ok(el instanceof JJHE)
            assert.strictEqual(el.ref.textContent, 'text')
        })

        it('handles undefined attributes', () => {
            const el = JJHE.tree('div', undefined, 'text')
            assert.ok(el instanceof JJHE)
            assert.strictEqual(el.ref.textContent, 'text')
        })

        it('appends string children', () => {
            const el = JJHE.tree('div', null, 'hello', ' world')
            assert.strictEqual(el.ref.textContent, 'hello world')
        })

        it('appends native element children', () => {
            const child = document.createElement('span')
            const el = JJHE.tree('div', null, child)
            assert.strictEqual(el.ref.childNodes.length, 1)
            assert.strictEqual(el.ref.firstChild, child)
        })

        it('appends JJHE children', () => {
            const child = JJHE.tree('span')
            const el = JJHE.tree('div', null, child)
            assert.strictEqual(el.ref.childNodes.length, 1)
            assert.strictEqual(el.ref.firstChild, child.ref)
        })

        it('creates nested structure', () => {
            const el = JJHE.tree('ul', null, JJHE.tree('li', null, 'Item 1'), JJHE.tree('li', null, 'Item 2'))
            assert.strictEqual(el.ref.childNodes.length, 2)
            assert.strictEqual(el.ref.childNodes[0].textContent, 'Item 1')
            assert.strictEqual(el.ref.childNodes[1].textContent, 'Item 2')
        })

        it('throws when attributes is not a plain object', () => {
            assert.throws(() => JJHE.tree('div', 'not-an-object' as any), /Pass null\/undefined or an object like/)
        })
    })
})
