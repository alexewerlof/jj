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
            assert.throws(() => new JJSE(div as any), TypeError)
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
            assert.throws(() => JJSE.create(123 as any), TypeError)
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
})
