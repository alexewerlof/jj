import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJDF, JJE, JJHE, JJSR } from '../src/index.js'

function ensureAdoptedStyleSheets(shadowRoot: ShadowRoot) {
    if (!('adoptedStyleSheets' in shadowRoot)) {
        Object.defineProperty(shadowRoot, 'adoptedStyleSheets', {
            value: [],
            writable: true,
        })
    }
}

function createTemplateInputs() {
    const fragment = JJDF.create().addChild(JJHE.tree('p', null, 'fragment'))
    const template = document.createElement('template')
    template.innerHTML = '<p>template</p>'

    const element = document.createElement('section')
    element.textContent = 'element'

    return [
        {
            label: 'DocumentFragment from fetchTemplate-like flow',
            template: fragment,
            expected: 'fragment',
        },
        {
            label: 'HTMLTemplateElement',
            template,
            expected: 'template',
        },
        {
            label: 'HTMLElement',
            template: element,
            expected: 'element',
        },
        {
            label: 'HTML string',
            template: '<p>string</p>',
            expected: 'string',
        },
        {
            label: 'JJHE wrapper',
            template: JJHE.tree('p', null, 'wrapper'),
            expected: 'wrapper',
        },
    ]
}

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

            it('throws TypeError for invalid name type', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.setAttr(123 as any, 'value'), TypeError)
            })

            it('throws TypeError when passed an object', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.setAttr({ id: 'my-id' } as any, 2), TypeError)
            })
        })

        describe('setAttrs()', () => {
            it('sets multiple attributes from object', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAttrs({ id: 'my-id', role: 'main' })
                assert.strictEqual(el.getAttribute('id'), 'my-id')
                assert.strictEqual(el.getAttribute('role'), 'main')
            })

            it('is a no-op for null and undefined', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAttrs(null).setAttrs(undefined)
                assert.strictEqual(el.attributes.length, 0)
            })

            it('returns this for chaining', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                const result = jje.setAttrs({ 'data-test': 'ok' })
                assert.strictEqual(result, jje)
            })

            it('throws TypeError for non-object values', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.setAttrs('not-an-object' as any), TypeError)
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

        describe('toggleAttr()', () => {
            it('sets the attribute (to empty string) when value is truthy', () => {
                const el = document.createElement('button')
                const jje = new JJE(el)
                jje.toggleAttr('disabled', true)
                assert.ok(el.hasAttribute('disabled'))
                assert.strictEqual(el.getAttribute('disabled'), '')
            })

            it('removes the attribute when value is falsy (not undefined)', () => {
                const el = document.createElement('button')
                el.setAttribute('disabled', '')
                const jje = new JJE(el)
                jje.toggleAttr('disabled', false)
                assert.ok(!el.hasAttribute('disabled'))
            })

            it('auto-toggles when value is omitted: adds if absent', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.toggleAttr('hidden')
                assert.ok(el.hasAttribute('hidden'))
            })

            it('auto-toggles when value is omitted: removes if present', () => {
                const el = document.createElement('div')
                el.setAttribute('hidden', '')
                const jje = new JJE(el)
                jje.toggleAttr('hidden')
                assert.ok(!el.hasAttribute('hidden'))
            })

            it('auto-toggles when value is explicitly undefined (same as omitted)', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.toggleAttr('hidden', undefined)
                assert.ok(el.hasAttribute('hidden'), 'undefined triggers auto mode, not explicit remove')
            })

            it('returns this for chaining', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.strictEqual(jje.toggleAttr('hidden', true), jje)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.toggleAttr(null as any), TypeError)
            })
        })
    })

    describe('ARIA methods', () => {
        describe('getAriaAttr()', () => {
            it('gets aria attribute value', () => {
                const el = document.createElement('div')
                el.setAttribute('aria-label', 'test')
                const jje = new JJE(el)
                assert.strictEqual(jje.getAriaAttr('label'), 'test')
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.getAriaAttr(123 as any), TypeError)
            })
        })

        describe('hasAriaAttr()', () => {
            it('checks aria attribute existence', () => {
                const el = document.createElement('div')
                el.setAttribute('aria-hidden', 'true')
                const jje = new JJE(el)
                assert.strictEqual(jje.hasAriaAttr('hidden'), true)
                assert.strictEqual(jje.hasAriaAttr('label'), false)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.hasAriaAttr({} as any), TypeError)
            })
        })

        describe('setAriaAttr()', () => {
            it('sets single aria attribute', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAriaAttr('label', 'My Label')
                assert.strictEqual(el.getAttribute('aria-label'), 'My Label')
            })

            it('accepts numbers and converts to strings in single mode', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAriaAttr('level', 2)
                assert.strictEqual(el.getAttribute('aria-level'), '2')
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.setAriaAttr(null as any, 'value'), TypeError)
            })
        })

        describe('setAriaAttrs()', () => {
            it('sets multiple aria attributes from object', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAriaAttrs({ label: 'Test', hidden: 'true' })
                assert.strictEqual(el.getAttribute('aria-label'), 'Test')
                assert.strictEqual(el.getAttribute('aria-hidden'), 'true')
            })

            it('accepts numbers and converts to strings in object mode', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setAriaAttrs({ level: 3 })
                assert.strictEqual(el.getAttribute('aria-level'), '3')
            })

            it('no-ops for nullish input', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.strictEqual(jje.setAriaAttrs(null), jje)
                assert.strictEqual(jje.setAriaAttrs(undefined), jje)
                assert.strictEqual(el.attributes.length, 0)
            })

            it('throws TypeError for invalid object input', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.setAriaAttrs('label' as any), TypeError)
            })
        })

        describe('rmAriaAttr()', () => {
            it('removes aria attributes', () => {
                const el = document.createElement('div')
                el.setAttribute('aria-label', 'test')
                el.setAttribute('aria-hidden', 'true')
                const jje = new JJE(el)
                jje.rmAriaAttr('label', 'hidden')
                assert.strictEqual(el.hasAttribute('aria-label'), false)
                assert.strictEqual(el.hasAttribute('aria-hidden'), false)
            })

            it('throws TypeError for non-string name', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.rmAriaAttr(null as any), Error)
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

            it('throws TypeError for non-string className', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.setClass(null as any), TypeError)
            })
        })

        describe('setClasses()', () => {
            it('sets classes conditionally from object', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.setClasses({ active: true, disabled: false, selected: true })
                assert.ok(el.classList.contains('active'))
                assert.ok(!el.classList.contains('disabled'))
                assert.ok(el.classList.contains('selected'))
            })

            it('no-ops for nullish input', () => {
                const el = document.createElement('div')
                el.className = 'active'
                const jje = new JJE(el)
                assert.strictEqual(jje.setClasses(null), jje)
                assert.strictEqual(jje.setClasses(undefined), jje)
                assert.strictEqual(el.className, 'active')
            })

            it('throws TypeError for invalid classMap input', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.setClasses('active' as any), TypeError)
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

        describe('addClasses()', () => {
            it('adds classes from an array', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.addClasses(['foo', 'bar', 'baz'])
                assert.ok(el.classList.contains('foo'))
                assert.ok(el.classList.contains('bar'))
                assert.ok(el.classList.contains('baz'))
            })

            it('throws TypeError for non-array input', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.addClasses('foo' as any), TypeError)
            })

            it('throws TypeError for non-string class names inside the array', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.addClasses(['foo', 123 as any]), TypeError)
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

        describe('rmClasses()', () => {
            it('removes classes from an array', () => {
                const el = document.createElement('div')
                el.className = 'foo bar baz'
                const jje = new JJE(el)
                jje.rmClasses(['foo', 'baz'])
                assert.ok(!el.classList.contains('foo'))
                assert.ok(el.classList.contains('bar'))
                assert.ok(!el.classList.contains('baz'))
            })

            it('throws TypeError for non-array input', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.rmClasses(null as any), TypeError)
            })

            it('throws TypeError for non-string class names inside the array', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.rmClasses(['foo', null as any]), TypeError)
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
            it('adds the class when value is truthy', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.toggleClass('foo', true)
                assert.ok(el.classList.contains('foo'))
            })

            it('removes the class when value is falsy (not undefined)', () => {
                const el = document.createElement('div')
                el.className = 'foo'
                const jje = new JJE(el)
                jje.toggleClass('foo', false)
                assert.ok(!el.classList.contains('foo'))
            })

            it('auto-toggles when value is omitted: adds if absent', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.toggleClass('foo')
                assert.ok(el.classList.contains('foo'))
            })

            it('auto-toggles when value is omitted: removes if present', () => {
                const el = document.createElement('div')
                el.className = 'foo'
                const jje = new JJE(el)
                jje.toggleClass('foo')
                assert.ok(!el.classList.contains('foo'))
            })

            it('auto-toggles when value is explicitly undefined (same as omitted)', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                jje.toggleClass('foo', undefined)
                assert.ok(el.classList.contains('foo'), 'undefined triggers auto mode, not explicit remove')
            })

            it('returns this for chaining', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.strictEqual(jje.toggleClass('foo', true), jje)
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

    describe('selector methods', () => {
        describe('closest()', () => {
            it('returns closest matching ancestor wrapped in JJE', () => {
                const root = document.createElement('div')
                root.className = 'root'
                const child = document.createElement('span')
                child.className = 'child'
                root.appendChild(child)

                const jje = new JJE(child)
                const match = jje.closest('.root')

                assert.ok(match instanceof JJE)
                assert.strictEqual(match?.ref, root)
            })

            it('returns null when no match is found', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.strictEqual(jje.closest('.missing'), null)
            })

            it('throws TypeError for non-string selector', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)
                assert.throws(() => jje.closest({} as any), TypeError)
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

    describe('setHTML()', () => {
        it('sets innerHTML when unsafe is true', () => {
            const el = document.createElement('div')
            const jje = new JJE(el)
            jje.setHTML('<span>test</span>', true)
            assert.strictEqual(el.innerHTML, '<span>test</span>')
        })

        it('throws when HTML provided but unsafe is not true', () => {
            const el = document.createElement('div')
            const jje = new JJE(el)
            assert.throws(() => jje.setHTML('<span>test</span>'), /Setting innerHTML is unsafe/)
            assert.throws(() => jje.setHTML('<span>test</span>', false), /Setting innerHTML is unsafe/)
        })

        it('allows clearing HTML without unsafe flag', () => {
            const el = document.createElement('div')
            el.innerHTML = '<span>test</span>'
            const jje = new JJE(el)
            jje.setHTML(null)
            assert.strictEqual(el.innerHTML, '')

            el.innerHTML = '<span>test</span>'
            jje.setHTML(undefined)
            assert.strictEqual(el.innerHTML, '')

            el.innerHTML = '<span>test</span>'
            jje.setHTML('') // Empty string is also considered "clearing" or safe enough?
            // Wait, looking at implementation: `html` is falsy so it enters `if (html && ...)` check?
            // if html is '', `html` is false, so check passes.
            assert.strictEqual(el.innerHTML, '')
        })
    })

    describe('shadow methods', () => {
        describe('setShadow()', () => {
            it('attaches an open shadow root and returns this', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)

                const result = jje.setShadow()

                assert.strictEqual(result, jje)
                assert.ok(el.shadowRoot)
            })

            it('is idempotent for an already attached shadow root', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)

                jje.setShadow('open')

                assert.doesNotThrow(() => jje.setShadow('open'))
            })
        })

        describe('getShadow()', () => {
            it('returns null when no shadow root exists', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)

                assert.strictEqual(jje.getShadow(), null)
            })

            it('returns a JJSR when a shadow root exists', () => {
                const el = document.createElement('div')
                const jje = new JJE(el).setShadow('open')

                assert.ok(jje.getShadow() instanceof JJSR)
            })

            it('throws when required and no shadow root exists', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)

                assert.throws(() => jje.getShadow(true), {
                    name: 'ReferenceError',
                    message: /No shadow root found on this element/,
                })
            })
        })

        describe('initShadow()', () => {
            for (const entry of createTemplateInputs()) {
                it(`initializes shadow content from ${entry.label}`, () => {
                    const el = document.createElement('div')
                    const jje = new JJE(el).setShadow('open')

                    jje.initShadow(entry.template)

                    assert.match(jje.getShadow(true).ref.textContent ?? '', new RegExp(entry.expected))
                })
            }

            it('initializes styles and content after constructor-time shadow attachment', async () => {
                const el = document.createElement('div')
                const jje = new JJE(el).setShadow('open')
                const shadow = jje.getShadow(true)
                const sheet = new CSSStyleSheet()

                ensureAdoptedStyleSheets(shadow.ref)
                await sheet.replace(':host { display: block; }')

                jje.initShadow('<p>styled</p>', ':host { color: red; }', sheet)

                assert.strictEqual(shadow.find('p', true).ref.textContent, 'styled')
                assert.strictEqual(shadow.ref.adoptedStyleSheets.length, 2)
            })

            it('throws when the shadow root has not been attached yet', () => {
                const el = document.createElement('div')
                const jje = new JJE(el)

                assert.throws(() => jje.initShadow('<p>missing</p>'), {
                    message: /Failed to initialize shadow DOM/,
                })
            })
        })
    })
})
