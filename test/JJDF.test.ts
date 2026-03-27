import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJDF, JJHE } from '../src/index.js'

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
            assert.throws(() => jjdf.find('#nonexistent', true), ReferenceError)
        })
    })

    describe('addTemplate()', () => {
        it('appends parsed nodes from an HTML string', () => {
            const host = JJDF.create()

            host.addTemplate('<span id="hello">hello</span>')

            assert.strictEqual(host.find('#hello')?.ref.textContent, 'hello')
        })

        it('clones HTMLTemplateElement content', () => {
            const host = JJDF.create()
            const template = document.createElement('template')
            template.innerHTML = '<em id="from-template">from-template</em>'

            host.addTemplate(template)

            assert.strictEqual(host.find('#from-template')?.ref.textContent, 'from-template')
        })

        it('accepts JJ wrappers via JJN recursion', () => {
            const host = JJDF.create()
            const source = JJHE.create('section').setAttr('id', 'wrapped-node')
            source.ref.textContent = 'wrapped-node'

            host.addTemplate(source)

            assert.strictEqual(host.find('#wrapped-node')?.ref.textContent, 'wrapped-node')
            assert.notStrictEqual(host.find('#wrapped-node')?.ref, source.ref)
        })

        it('accepts JJDF wrappers via JJN recursion', () => {
            const host = JJDF.create()
            const source = JJDF.create().addTemplate('<strong id="wrapped-fragment">wrapped-fragment</strong>')

            host.addTemplate(source)

            assert.strictEqual(host.find('#wrapped-fragment')?.ref.textContent, 'wrapped-fragment')
        })

        it('throws for Promise inputs', () => {
            const host = JJDF.create()

            assert.throws(() => host.addTemplate(Promise.resolve('<span>x</span>') as any), TypeError)
        })

        it('throws for unsupported inputs', () => {
            const host = JJDF.create()

            assert.throws(() => host.addTemplate(123 as any), TypeError)
        })
    })
})
