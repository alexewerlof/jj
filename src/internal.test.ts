import '../test/attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { hasProp, isInstance, isNum, isObj, isStr, keb2cam, toStr } from './internal.js'

describe(isStr.name, () => {
    it('returns true for strings', () => {
        assert.strictEqual(isStr('Hello'), true)
        assert.strictEqual(isStr(''), true)
    })

    it('returns false for non-string values', () => {
        assert.strictEqual(isStr(null), false)
        assert.strictEqual(isStr(123), false)
    })
})

describe(isNum.name, () => {
    it('returns true for numbers except NaN', () => {
        assert.strictEqual(isNum(17), true)
        assert.strictEqual(isNum(Math.PI), true)
        assert.strictEqual(isNum(NaN), false)
    })

    it('returns false for non-number values', () => {
        assert.strictEqual(isNum('13'), false)
        assert.strictEqual(isNum(17n), false)
    })
})

describe(isObj.name, () => {
    it('returns true for object literals', () => {
        assert.strictEqual(isObj({}), true)
    })

    it('returns false for non-plain objects', () => {
        class C {}

        assert.strictEqual(isObj(Object.create(null)), false)
        assert.strictEqual(isObj([]), false)
        assert.strictEqual(isObj(new Map()), false)
        assert.strictEqual(isObj(new C()), false)
    })
})

describe(isInstance.name, () => {
    it('returns true for matching instances', async () => {
        class A {}

        const a = new A()
        const resolved = Promise.resolve()
        const rejected = Promise.reject(new Error('boom'))

        assert.strictEqual(isInstance({}, Object), true)
        assert.strictEqual(isInstance(a, A), true)
        assert.strictEqual(isInstance(a, Object), true)
        assert.strictEqual(isInstance(/hello/i, RegExp), true)
        assert.strictEqual(isInstance(resolved, Promise), true)
        assert.strictEqual(isInstance(rejected, Promise), true)

        await Promise.allSettled([resolved, rejected])
    })

    it('returns false for non-matching instances', () => {
        assert.strictEqual(isInstance('plain str', String), false)
        assert.strictEqual(isInstance(22, Number), false)
    })

    it('throws when classConstructor is not a function', () => {
        // @ts-expect-error verifying runtime validation
        assert.throws(() => isInstance({}, null), TypeError)
        // @ts-expect-error verifying runtime validation
        assert.throws(() => isInstance({}, 'lamborghini'), TypeError)
    })
})

describe(hasProp.name, () => {
    it('returns true when property exists', () => {
        const target = Object.create({ inherited: 'value' })
        target.own = 'value'

        assert.strictEqual(hasProp(target, 'own'), true)
        assert.strictEqual(hasProp(target, 'inherited'), true)
        assert.strictEqual(hasProp([], 'length'), true)
    })

    it('returns false when property is missing or target is not an object', () => {
        assert.strictEqual(hasProp({ foo: 'bar' }, 'baz'), false)
        assert.strictEqual(hasProp('Hello', 'length'), false)
        assert.strictEqual(hasProp(null, 'yes'), false)
    })
})

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
