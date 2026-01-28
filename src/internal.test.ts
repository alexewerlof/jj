import { describe, it } from 'node:test'
import assert from 'node:assert'
import { errMsg, typeErr } from './internal.js'

describe('internal utilities', () => {
    describe('errMsg()', () => {
        it('creates standardized error message with variable name', () => {
            const msg = errMsg('myVar', 'a string', 123)
            assert.strictEqual(msg, "Expected 'myVar' to be a string. Got 123 (number)")
        })

        it('handles null values', () => {
            const msg = errMsg('value', 'defined', null)
            assert.strictEqual(msg, "Expected 'value' to be defined. Got null (object)")
        })

        it('handles undefined values', () => {
            const msg = errMsg('prop', 'a string', undefined)
            assert.strictEqual(msg, "Expected 'prop' to be a string. Got undefined (undefined)")
        })

        it('handles object values', () => {
            const msg = errMsg('data', 'a string', { foo: 'bar' })
            assert.strictEqual(msg, "Expected 'data' to be a string. Got [object Object] (object)")
        })

        it('handles array values', () => {
            const msg = errMsg('items', 'a string', [1, 2, 3])
            assert.strictEqual(msg, "Expected 'items' to be a string. Got 1,2,3 (object)")
        })
    })

    describe('typeErr()', () => {
        it('returns a TypeError with errMsg message', () => {
            const err = typeErr('name', 'a string', 42)
            assert.ok(err instanceof TypeError)
            assert.strictEqual(err.message, "Expected 'name' to be a string. Got 42 (number)")
        })

        it('can be thrown', () => {
            assert.throws(
                () => {
                    throw typeErr('id', 'a string', null)
                },
                (err: any) => {
                    return err instanceof TypeError && err.message === "Expected 'id' to be a string. Got null (object)"
                },
            )
        })
    })
})
