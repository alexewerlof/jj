import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJT } from '../src/index.js'

describe('JJT', () => {
    it('wraps a Text node', () => {
        const text = document.createTextNode('foo')
        const jjt = new JJT(text)
        assert.strictEqual(jjt.ref, text)
    })

    it('creates from static from()', () => {
        const text = document.createTextNode('foo')
        const jjt = JJT.from(text)
        assert.strictEqual(jjt.ref, text)
    })

    it('creates from static fromStr()', () => {
        const jjt = JJT.fromStr('foo')
        assert.ok(jjt.ref instanceof Text)
        assert.strictEqual(jjt.getText(), 'foo')
    })

    it('throws if not Text', () => {
        assert.throws(() => new JJT({} as any), TypeError)
        assert.throws(() => new JJT('foo' as any), TypeError)
    })

    it('gets text', () => {
        const jjt = JJT.fromStr('foo')
        assert.strictEqual(jjt.getText(), 'foo')
    })

    it('sets text', () => {
        const jjt = JJT.fromStr('foo')
        jjt.setText('bar')
        assert.strictEqual(jjt.getText(), 'bar')
        assert.strictEqual(jjt.ref.textContent, 'bar')
    })

    it('sets text with null/undefined', () => {
        const jjt = JJT.fromStr('foo')
        jjt.setText(null)
        assert.strictEqual(jjt.getText(), '')

        jjt.setText('bar')
        jjt.setText()
        assert.strictEqual(jjt.getText(), '')
    })

    it('empties text', () => {
        const jjt = JJT.fromStr('foo')
        jjt.empty()
        assert.strictEqual(jjt.getText(), '')
    })

    it('adds text', () => {
        const jjt = JJT.fromStr('foo')
        jjt.addText('bar')
        assert.strictEqual(jjt.getText(), 'foobar')
    })

    it('adds text to empty content', () => {
        const jjt = JJT.fromStr('')
        jjt.addText('foo')
        assert.strictEqual(jjt.getText(), 'foo')
    })

    it('adds empty, null, or undefined text', () => {
        const jjt = JJT.fromStr('foo')
        jjt.addText('')
        jjt.addText(null)
        jjt.addText(undefined)
        jjt.addText()
        assert.strictEqual(jjt.getText(), 'foo')
    })
})
