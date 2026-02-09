import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JSDOM } from 'jsdom'
import { ShadowMaster } from './ShadowMaster.js'
import { JJHE } from './JJHE.js'
import { JJDF } from './JJDF.js'

const { window } = new JSDOM()
global.HTMLElement = window.HTMLElement
global.CSSStyleSheet = window.CSSStyleSheet
global.Element = window.Element
global.Node = window.Node
global.EventTarget = window.EventTarget
global.document = window.document
global.customElements = window.customElements
global.DocumentFragment = window.DocumentFragment
global.HTMLTemplateElement = window.HTMLTemplateElement

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

        it('resolves template from function', async () => {
            const sm = ShadowMaster.create()
            sm.setTemplate(() => '<div>From Function</div>')
            const config = await sm.getResolved()
            assert.strictEqual(config.template, '<div>From Function</div>')
        })

        it('resolves template from promise', async () => {
            const sm = ShadowMaster.create()
            sm.setTemplate(Promise.resolve('<div>From Promise</div>'))
            const config = await sm.getResolved()
            assert.strictEqual(config.template, '<div>From Promise</div>')
        })

        it('resolves template from async function', async () => {
            const sm = ShadowMaster.create()
            sm.setTemplate(async () => '<div>From Async Function</div>')
            const config = await sm.getResolved()
            assert.strictEqual(config.template, '<div>From Async Function</div>')
        })

        it('resolves template from JJHE instance', async () => {
            const el = JJHE.create('div')
            el.setAttr('class', 'test')
            el.ref.innerHTML = '<span>content</span>'
            const sm = ShadowMaster.create()
            sm.setTemplate(el)
            const config = await sm.getResolved()
            assert.strictEqual(config.template, '<div class="test"><span>content</span></div>')
        })

        it('resolves template from HTMLTemplateElement', async () => {
            const el = document.createElement('template')
            el.innerHTML = '<span>template content</span>'
            const sm = ShadowMaster.create()
            sm.setTemplate(el)
            const config = await sm.getResolved()
            assert.ok(config.template instanceof DocumentFragment)
            assert.strictEqual(config.template.textContent, 'template content')
        })

        it('resolves template from HTMLElement', async () => {
            const el = document.createElement('div')
            el.className = 'test'
            el.innerHTML = '<span>content</span>'
            const sm = ShadowMaster.create()
            sm.setTemplate(el)
            const config = await sm.getResolved()
            // We know it's a string here because we passed a div
            const tmpl = config.template as string
            assert.ok(tmpl.includes('<div'))
            assert.ok(tmpl.includes('class="test"'))
        })

        it('resolves template from JJDF instance', async () => {
            const frag = document.createDocumentFragment()
            const div = document.createElement('div')
            div.textContent = 'fragment content'
            frag.appendChild(div)
            const jjdf = JJDF.from(frag)

            const sm = ShadowMaster.create()
            sm.setTemplate(jjdf)
            const config = await sm.getResolved()

            assert.ok(config.template instanceof DocumentFragment)
            assert.notStrictEqual(config.template, frag)
            assert.strictEqual(config.template.textContent, 'fragment content')
        })

        it('throws TypeError for invalid template type', async () => {
            const sm = ShadowMaster.create()
            sm.setTemplate(123 as any)
            await assert.rejects(async () => await sm.getResolved(), {
                name: 'TypeError',
                message: /Expected 'template' to be a string, JJHE, JJDF, HTMLElement, or DocumentFragment/,
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
