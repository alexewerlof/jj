import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JSDOM } from 'jsdom'
import { JJD } from './JJD.js'
import './JJN.js'

const { window } = new JSDOM(`
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
    <div id="test-id">Test</div>
    <div class="test-class">Item 1</div>
    <div class="test-class">Item 2</div>
</body>
</html>
`)

global.Document = window.Document
global.Element = window.Element
global.HTMLElement = window.HTMLElement
global.Node = window.Node
global.EventTarget = window.EventTarget
global.document = window.document

describe('JJD', () => {
    describe('constructor', () => {
        it('wraps a Document', () => {
            const jjd = new JJD(document)
            assert.strictEqual(jjd.ref, document)
        })

        it('throws if not Document', () => {
            assert.throws(() => new JJD({} as any), TypeError)
        })
    })

    describe('static from()', () => {
        it('creates JJD from Document', () => {
            const jjd = JJD.from(document)
            assert.ok(jjd instanceof JJD)
        })
    })

    describe('find() by ID', () => {
        it('finds element by id', () => {
            const jjd = new JJD(document)
            const result = jjd.find('#test-id')
            assert.ok(result)
            assert.strictEqual((result.ref as HTMLElement).id, 'test-id')
        })

        it('returns null when not found', () => {
            const jjd = new JJD(document)
            const result = jjd.find('#nonexistent')
            assert.strictEqual(result, null)
        })

        it('throws when required and not found', () => {
            const jjd = new JJD(document)
            assert.throws(() => jjd.find('#nonexistent', true), {
                name: 'TypeError',
                message: /No element matched query "#nonexistent"/,
            })
        })
    })

    describe('head', () => {
        it('returns wrapped head element', () => {
            const jjd = new JJD(document)
            const head = jjd.head
            assert.ok(head)
            assert.strictEqual((head.ref as HTMLElement).tagName, 'HEAD')
        })
    })

    describe('body', () => {
        it('returns wrapped body element', () => {
            const jjd = new JJD(document)
            const body = jjd.body
            assert.ok(body)
            assert.strictEqual((body.ref as HTMLElement).tagName, 'BODY')
        })
    })
})
