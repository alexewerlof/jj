import '../test/attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { keb2cam, toStr } from './internal.js'

describe(keb2cam.name, () => {
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

describe(toStr.name, () => {
    it('returns strings unchanged', () => {
        assert.strictEqual(toStr('hello'), 'hello')
    })

    it('serializes plain objects and arrays with JSON.stringify', () => {
        assert.strictEqual(toStr({ a: 1, b: 'x' }), '{"a":1,"b":"x"}')
        assert.strictEqual(toStr([1, 2, 3]), '[1,2,3]')
    })

    it('handles null explicitly', () => {
        assert.strictEqual(toStr(null), 'null')
    })

    it('falls back to String(x) when JSON.stringify throws', () => {
        const circular: Record<string, unknown> = {}
        circular.self = circular
        assert.strictEqual(toStr(circular), '[object Object]')
    })

    it('uses function.toString() for functions', () => {
        const fn = () => 'ok'
        assert.strictEqual(toStr(fn), fn.toString())
    })

    it('stringifies primitive default branch values', () => {
        assert.strictEqual(toStr(123), '123')
        assert.strictEqual(toStr(false), 'false')
        assert.strictEqual(toStr(10n), '10')
        assert.strictEqual(toStr(Symbol('x')), 'Symbol(x)')
        assert.strictEqual(toStr(undefined), 'undefined')
    })
})
