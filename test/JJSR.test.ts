import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJDF, JJHE, JJSR } from '../src/index.js'

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

describe('JJSR', () => {
    describe('constructor', () => {
        it('wraps a ShadowRoot', () => {
            const host = document.createElement('div')
            const shadowRoot = host.attachShadow({ mode: 'open' })
            const jjsr = new JJSR(shadowRoot)
            assert.strictEqual(jjsr.ref, shadowRoot)
        })

        it('throws if not ShadowRoot', () => {
            assert.throws(() => new JJSR({} as any), /attachShadow\(\{ mode: "open" \}\)/)
        })
    })

    describe('static from()', () => {
        it('creates JJSR from ShadowRoot', () => {
            const host = document.createElement('div')
            const shadowRoot = host.attachShadow({ mode: 'open' })
            const jjsr = JJSR.from(shadowRoot)
            assert.ok(jjsr instanceof JJSR)
        })
    })

    describe('getHTML()', () => {
        it('gets innerHTML', () => {
            const host = document.createElement('div')
            const shadowRoot = host.attachShadow({ mode: 'open' })
            shadowRoot.innerHTML = '<p>test</p>'
            const jjsr = new JJSR(shadowRoot)
            assert.strictEqual(jjsr.getHTML(), '<p>test</p>')
        })
    })

    describe('setHTML()', () => {
        it('sets innerHTML', () => {
            const host = document.createElement('div')
            const shadowRoot = host.attachShadow({ mode: 'open' })
            const jjsr = new JJSR(shadowRoot)
            jjsr.setHTML('<span>new</span>', true)
            assert.strictEqual(shadowRoot.innerHTML, '<span>new</span>')
        })
    })

    describe('addStyle()', () => {
        it('adopts constructable stylesheets on a shadow root', async () => {
            const host = document.createElement('div')
            const shadowRoot = host.attachShadow({ mode: 'open' })
            const sheet = new CSSStyleSheet()

            ensureAdoptedStyleSheets(shadowRoot)

            await sheet.replace(':host { display: block; }')
            JJSR.from(shadowRoot).addStyle(sheet)

            assert.strictEqual(shadowRoot.adoptedStyleSheets.includes(sheet), true)
        })
    })

    describe('init()', () => {
        for (const entry of createTemplateInputs()) {
            it(`initializes content from ${entry.label}`, () => {
                const host = document.createElement('div')
                const shadowRoot = host.attachShadow({ mode: 'open' })

                JJSR.from(shadowRoot).init(entry.template)

                assert.match(shadowRoot.textContent ?? '', new RegExp(entry.expected))
            })
        }

        it('initializes content and adopts string and constructable styles', async () => {
            const host = document.createElement('div')
            const shadowRoot = host.attachShadow({ mode: 'open' })
            const sheet = new CSSStyleSheet()

            ensureAdoptedStyleSheets(shadowRoot)
            await sheet.replace(':host { display: block; }')

            JJSR.from(shadowRoot).init('<p>styled</p>', ':host { color: red; }', sheet)

            assert.strictEqual(shadowRoot.querySelector('p')?.textContent, 'styled')
            assert.strictEqual(shadowRoot.adoptedStyleSheets.length, 2)
        })
    })
})
