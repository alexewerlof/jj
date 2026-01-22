import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJET } from './JJET.js'

class MockEventTarget extends EventTarget {}

describe('JJET', () => {
    it('wraps an EventTarget', () => {
        const et = new MockEventTarget()
        const jjet = new JJET(et)
        assert.strictEqual(jjet.ref, et)
    })

    it('throws if not EventTarget', () => {
        assert.throws(() => new JJET({} as any), TypeError)
    })

    it('adds and removes event listeners', () => {
        const et = new MockEventTarget()
        const jjet = new JJET(et)
        let callCount = 0
        const handler = () => callCount++

        jjet.on('test', handler)
        et.dispatchEvent(new Event('test'))
        assert.strictEqual(callCount, 1)

        jjet.off('test', handler)
        et.dispatchEvent(new Event('test'))
        assert.strictEqual(callCount, 1)
    })
})
