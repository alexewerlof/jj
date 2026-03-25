import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJME } from '../src/index.js'

describe('JJME', () => {
    describe('constructor', () => {
        it('wraps a MathMLElement', () => {
            const math = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math')
            const jjme = new JJME(math)
            assert.strictEqual(jjme.ref, math)
        })

        it('throws if not MathMLElement', () => {
            const div = document.createElement('div')
            assert.throws(() => new JJME(div as any), /Expected 'ref' to be a MathML element/)
        })
    })

    describe('static from()', () => {
        it('creates JJME from MathMLElement', () => {
            const mi = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi')
            const jjme = JJME.from(mi)
            assert.ok(jjme instanceof JJME)
        })
    })

    describe('static create()', () => {
        it('creates MathML element from tag name', () => {
            const jjme = JJME.create('mfrac')
            assert.strictEqual(jjme.ref.namespaceURI, 'http://www.w3.org/1998/Math/MathML')
            assert.strictEqual(jjme.ref.tagName, 'mfrac')
        })

        it('throws TypeError for non-string tagName', () => {
            assert.throws(() => JJME.create(123 as any), /Pass a valid MathML tag name like/)
        })
    })

    describe('setText()', () => {
        it('sets textContent', () => {
            const mi = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi')
            const jjme = new JJME(mi)
            jjme.setText('x')
            assert.strictEqual(mi.textContent, 'x')
        })

        it('clears text with null', () => {
            const mi = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi')
            mi.textContent = 'old text'
            const jjme = new JJME(mi)
            jjme.setText(null)
            assert.strictEqual(mi.textContent, '')
        })

        it('clears text with undefined', () => {
            const mi = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi')
            mi.textContent = 'old text'
            const jjme = new JJME(mi)
            jjme.setText(undefined)
            assert.strictEqual(mi.textContent, '')
        })

        it('accepts numbers and converts to strings', () => {
            const mn = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mn')
            const jjme = new JJME(mn)
            jjme.setText(123)
            assert.strictEqual(mn.textContent, '123')
        })

        it('accepts booleans and converts to strings', () => {
            const mo = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mo')
            const jjme = new JJME(mo)
            jjme.setText(true)
            assert.strictEqual(mo.textContent, 'true')
        })
    })

    describe('getText()', () => {
        it('returns empty string when textContent is null', () => {
            const mrow = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mrow')
            const jjme = new JJME(mrow)
            assert.strictEqual(jjme.getText(), '')
        })

        it('returns textContent when present', () => {
            const mrow = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mrow')
            mrow.textContent = 'x+1'
            const jjme = new JJME(mrow)
            assert.strictEqual(jjme.getText(), 'x+1')
        })
    })

    describe('empty()', () => {
        it('removes all children', () => {
            const math = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math')
            const mi = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi')
            const mo = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mo')
            math.appendChild(mi)
            math.appendChild(mo)
            const jjme = new JJME(math)

            assert.strictEqual(math.childNodes.length, 2)
            jjme.empty()
            assert.strictEqual(math.childNodes.length, 0)
        })
    })

    describe('static tree()', () => {
        it('creates MathML element from tag name', () => {
            const el = JJME.tree('math')
            assert.ok(el instanceof JJME)
            assert.strictEqual(el.ref.tagName, 'math')
            assert.strictEqual(el.ref.namespaceURI, 'http://www.w3.org/1998/Math/MathML')
        })

        it('sets attributes', () => {
            const el = JJME.tree('math', { display: 'block' })
            assert.strictEqual(el.ref.getAttribute('display'), 'block')
        })

        it('handles null attributes', () => {
            const el = JJME.tree('mrow', null)
            assert.ok(el instanceof JJME)
        })

        it('handles undefined attributes', () => {
            const el = JJME.tree('mrow', undefined)
            assert.ok(el instanceof JJME)
        })

        it('appends string children (text nodes)', () => {
            const el = JJME.tree('mi', null, 'x')
            assert.strictEqual(el.ref.textContent, 'x')
        })

        it('appends native MathML element children', () => {
            const mi = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi')
            const el = JJME.tree('mrow', null, mi)
            assert.strictEqual(el.ref.childNodes.length, 1)
            assert.strictEqual(el.ref.firstChild, mi)
        })

        it('appends JJME children', () => {
            const child = JJME.tree('mi', null, 'x')
            const el = JJME.tree('mrow', null, child)
            assert.strictEqual(el.ref.childNodes.length, 1)
            assert.strictEqual(el.ref.firstChild, child.ref)
        })

        it('creates nested MathML structure (fraction)', () => {
            const frac = JJME.tree('mfrac', null, JJME.tree('mi', null, 'x'), JJME.tree('mi', null, 'y'))
            assert.strictEqual(frac.ref.childNodes.length, 2)
            assert.strictEqual(frac.ref.childNodes[0].textContent, 'x')
            assert.strictEqual(frac.ref.childNodes[1].textContent, 'y')
        })

        it('creates children in MathML namespace', () => {
            const child = JJME.tree('mi')
            assert.strictEqual(child.ref.namespaceURI, 'http://www.w3.org/1998/Math/MathML')
        })

        it('throws when attributes is not a plain object', () => {
            assert.throws(() => JJME.tree('math', 'not-an-object' as any), /Pass null\/undefined or an object like/)
        })
    })
})
