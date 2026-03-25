import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { MATHML_NS, SVG_NS } from '../src/index.js'

describe('namespace constants', () => {
    it('are valid absolute URL strings', () => {
        assert.doesNotThrow(() => new URL(MATHML_NS))
        assert.doesNotThrow(() => new URL(SVG_NS))
    })

    it('match expected namespace values', () => {
        assert.strictEqual(MATHML_NS, 'http://www.w3.org/1998/Math/MathML')
        assert.strictEqual(SVG_NS, 'http://www.w3.org/2000/svg')
    })

    it('can be used with document.createElementNS', () => {
        const math = document.createElementNS(MATHML_NS, 'math')
        const svg = document.createElementNS(SVG_NS, 'svg')

        assert.strictEqual(math.namespaceURI, MATHML_NS)
        assert.strictEqual(svg.namespaceURI, SVG_NS)
    })
})
