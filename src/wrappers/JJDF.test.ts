import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JSDOM } from 'jsdom'
import { JJDF } from './JJDF.js'
import './JJN.js'

const { window } = new JSDOM()
global.DocumentFragment = window.DocumentFragment
global.Element = window.Element
global.HTMLElement = window.HTMLElement
global.SVGElement = window.SVGElement
global.Node = window.Node
global.EventTarget = window.EventTarget
global.document = window.document

describe('JJDF', () => {
    describe('constructor', () => {
        it('wraps a DocumentFragment', () => {
            const frag = document.createDocumentFragment()
            const jjdf = new JJDF(frag)
            assert.strictEqual(jjdf.ref, frag)
        })

        it('throws if not DocumentFragment', () => {
            assert.throws(() => new JJDF({} as any), TypeError)
        })
    })

    describe('static from()', () => {
        it('creates JJDF from DocumentFragment', () => {
            const frag = document.createDocumentFragment()
            const jjdf = JJDF.from(frag)
            assert.ok(jjdf instanceof JJDF)
        })
    })

    describe('static create()', () => {
        it('creates new DocumentFragment', () => {
            const jjdf = JJDF.create()
            assert.ok(jjdf instanceof JJDF)
            assert.ok(jjdf.ref instanceof DocumentFragment)
        })
    })

    describe('find() by ID', () => {
        it('finds element by id in fragment', () => {
            const frag = document.createDocumentFragment()
            const div = document.createElement('div')
            div.id = 'test-id'
            frag.appendChild(div)

            const jjdf = new JJDF(frag)
            const result = jjdf.find('#test-id')
            assert.ok(result)
            assert.strictEqual((result.ref as HTMLElement).id, 'test-id')
        })

        it('returns null when not found', () => {
            const frag = document.createDocumentFragment()
            const jjdf = new JJDF(frag)
            const result = jjdf.find('#nonexistent')
            assert.strictEqual(result, null)
        })

        it('throws when required and not found', () => {
            const frag = document.createDocumentFragment()
            const jjdf = new JJDF(frag)
            assert.throws(() => jjdf.find('#nonexistent', true), TypeError)
        })
    })
})
