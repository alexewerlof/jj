import '../test/attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { keb2cam } from './internal.js'

describe('keb2cam()', () => {
    it('throws for non-string input', () => {
        assert.throws(() => keb2cam(123 as any), TypeError, 'Should throw for a number')
        assert.throws(() => keb2cam(true as any), TypeError, 'Should throw for a boolean')
        assert.throws(() => keb2cam(null as any), TypeError, 'Should throw for null')
        assert.throws(() => keb2cam(undefined as any), TypeError, 'Should throw for undefined')
    })

    it('converts kebab-case to camelCase', () => {
        assert.strictEqual(keb2cam('kebab-case'), 'kebabCase')
        assert.strictEqual(keb2cam('a-b-c'), 'aBC')
        assert.strictEqual(keb2cam('background-color'), 'backgroundColor')
    })

    it('handles edge cases correctly', () => {
        assert.strictEqual(keb2cam(''), '', 'Should handle empty string')
        assert.strictEqual(keb2cam('single'), 'single', 'Should handle a single word')
        assert.strictEqual(keb2cam('-foo-bar'), 'fooBar', 'Should handle leading hyphen')
        assert.strictEqual(keb2cam('baz-quux-'), 'bazQuux', 'Should handle trailing hyphen')
        assert.strictEqual(keb2cam('car--tux'), 'carTux', 'Should handle multiple hyphens')
    })

    it('does not convert other cases', () => {
        assert.strictEqual(keb2cam('camelCase'), 'camelCase', 'Should not change camelCase')
        assert.strictEqual(keb2cam('snake_case'), 'snake_case', 'Should not convert snake_case')
    })
})
