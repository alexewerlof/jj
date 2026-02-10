import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJSR } from '../src/index.js'

describe('JJSR', () => {
    describe('constructor', () => {
        it('wraps a ShadowRoot', () => {
            const host = document.createElement('div')
            const shadowRoot = host.attachShadow({ mode: 'open' })
            const jjsr = new JJSR(shadowRoot)
            assert.strictEqual(jjsr.ref, shadowRoot)
        })

        it('throws if not ShadowRoot', () => {
            assert.throws(() => new JJSR({} as any), TypeError)
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
})
