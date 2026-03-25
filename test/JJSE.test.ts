import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJSE } from '../src/index.js'

describe('JJSE', () => {
    describe('constructor', () => {
        it('wraps an SVGElement', () => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            const jjse = new JJSE(svg)
            assert.strictEqual(jjse.ref, svg)
        })

        it('throws if not SVGElement', () => {
            const div = document.createElement('div')
            assert.throws(
                () => new JJSE(div as any),
                /Wrap an existing SVG element with JJSE\.from\(el\) or create one with JJSE\.create/,
            )
        })
    })

    describe('static from()', () => {
        it('creates JJSE from SVGElement', () => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            const jjse = JJSE.from(svg)
            assert.ok(jjse instanceof JJSE)
        })
    })

    describe('static create()', () => {
        it('creates SVG element from tag name', () => {
            const jjse = JJSE.create('circle')
            assert.ok(jjse.ref instanceof SVGElement)
            assert.strictEqual(jjse.ref.tagName, 'circle')
        })

        it('throws TypeError for non-string tagName', () => {
            assert.throws(() => JJSE.create(123 as any), /Pass a valid SVG tag name like/)
        })
    })

    describe('setText()', () => {
        it('sets textContent', () => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            const jjse = new JJSE(svg)
            jjse.setText('test text')
            assert.strictEqual(svg.textContent, 'test text')
        })

        it('clears text with null', () => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            svg.textContent = 'old text'
            const jjse = new JJSE(svg)
            jjse.setText(null)
            assert.strictEqual(svg.textContent, '')
        })

        it('clears text with undefined', () => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            svg.textContent = 'old text'
            const jjse = new JJSE(svg)
            jjse.setText(undefined)
            assert.strictEqual(svg.textContent, '')
        })

        it('accepts numbers and converts to strings', () => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            const jjse = new JJSE(svg)
            jjse.setText(123)
            assert.strictEqual(svg.textContent, '123')
        })

        it('accepts booleans and converts to strings', () => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            const jjse = new JJSE(svg)
            jjse.setText(true)
            assert.strictEqual(svg.textContent, 'true')
        })
    })

    describe('empty()', () => {
        it('removes all children', () => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            svg.appendChild(circle)
            const jjse = new JJSE(svg)

            assert.strictEqual(svg.childNodes.length, 1)
            jjse.empty()
            assert.strictEqual(svg.childNodes.length, 0)
        })
    })

    describe('static tree()', () => {
        it('creates SVG element from tag name', () => {
            const el = JJSE.tree('svg')
            assert.ok(el instanceof JJSE)
            assert.strictEqual(el.ref.tagName, 'svg')
            assert.strictEqual(el.ref.namespaceURI, 'http://www.w3.org/2000/svg')
        })

        it('sets attributes', () => {
            const el = JJSE.tree('svg', { viewBox: '0 0 24 24', width: '24' })
            assert.strictEqual(el.ref.getAttribute('viewBox'), '0 0 24 24')
            assert.strictEqual(el.ref.getAttribute('width'), '24')
        })

        it('handles null attributes', () => {
            const el = JJSE.tree('g', null)
            assert.ok(el instanceof JJSE)
        })

        it('handles undefined attributes', () => {
            const el = JJSE.tree('g', undefined)
            assert.ok(el instanceof JJSE)
        })

        it('appends string children', () => {
            const el = JJSE.tree('text', null, 'label')
            assert.strictEqual(el.ref.textContent, 'label')
        })

        it('appends native SVG element children', () => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            const el = JJSE.tree('g', null, circle)
            assert.strictEqual(el.ref.childNodes.length, 1)
            assert.strictEqual(el.ref.firstChild, circle)
        })

        it('appends JJSE children', () => {
            const child = JJSE.tree('circle')
            const el = JJSE.tree('g', null, child)
            assert.strictEqual(el.ref.childNodes.length, 1)
            assert.strictEqual(el.ref.firstChild, child.ref)
        })

        it('creates nested SVG structure', () => {
            const el = JJSE.tree(
                'svg',
                { viewBox: '0 0 10 10' },
                JJSE.tree('rect', { x: '0', y: '0', width: '10', height: '10' }),
                JJSE.tree('circle', { cx: '5', cy: '5', r: '5' }),
            )
            assert.strictEqual(el.ref.childNodes.length, 2)
        })

        it('creates children in SVG namespace', () => {
            const child = JJSE.tree('circle')
            assert.strictEqual(child.ref.namespaceURI, 'http://www.w3.org/2000/svg')
        })

        it('throws when attributes is not a plain object', () => {
            assert.throws(() => JJSE.tree('svg', 'not-an-object' as any), /Pass null\/undefined or an object like/)
        })
    })
})
