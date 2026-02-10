import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJET } from '../src/index.js'

describe('JJET', () => {
    it('wraps an EventTarget', () => {
        const et = new EventTarget()
        const jjet = new JJET(et)
        assert.strictEqual(jjet.ref, et)
    })

    it('throws if not EventTarget', () => {
        assert.throws(() => new JJET({} as any), TypeError)
    })

    it('adds and removes event listeners', () => {
        const et = new EventTarget()
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

    it('triggers an event', () => {
        const et = new EventTarget()
        const jjet = new JJET(et)
        let callCount = 0
        const handler = () => callCount++
        jjet.on('test', handler)

        const event = new Event('test', { cancelable: true })
        const result1 = jjet.trigger(event)
        assert.strictEqual(callCount, 1)
        assert.strictEqual(result1, jjet)

        jjet.on('test2', (e: Event) => e.preventDefault())
        const event2 = new Event('test2', { cancelable: true })
        const result2 = jjet.trigger(event2)
        assert.strictEqual(result2, jjet)
        assert.strictEqual(event2.defaultPrevented, true)
    })

    it('binds handler to JJET instance', () => {
        const et = new EventTarget()
        const jjet = new JJET(et)
        let capturedThis: any

        jjet.on('test', function (this: JJET) {
            capturedThis = this
        })

        et.dispatchEvent(new Event('test'))
        assert.strictEqual(capturedThis, jjet, 'this should be the JJET instance')
        assert.notStrictEqual(capturedThis, et, 'this should not be the native EventTarget')
    })

    it('allows access to ref via this.ref', () => {
        const et = new EventTarget()
        const jjet = new JJET(et)
        let capturedRef: any

        jjet.on('test', function (this: JJET) {
            capturedRef = this.ref
        })

        et.dispatchEvent(new Event('test'))
        assert.strictEqual(capturedRef, et, 'this.ref should be the native EventTarget')
    })

    it('binds EventListenerObject handleEvent to JJET instance', () => {
        const et = new EventTarget()
        const jjet = new JJET(et)
        let capturedThis: any

        const listenerObj = {
            handleEvent: function (this: JJET) {
                capturedThis = this
            },
        }

        jjet.on('test', listenerObj)
        et.dispatchEvent(new Event('test'))
        assert.strictEqual(capturedThis, jjet, 'this in handleEvent should be the JJET instance')
    })

    it('reuses bound handler for same handler reference', () => {
        const et = new EventTarget()
        const jjet = new JJET(et)
        let callCount = 0

        const handler = function (this: JJET) {
            callCount++
        }

        // Add the same handler twice
        // The WeakMap will return the same bound handler both times
        // addEventListener will only register it once (standard DOM behavior)
        jjet.on('test', handler)
        jjet.on('test', handler)

        et.dispatchEvent(new Event('test'))
        // Since addEventListener with the same handler is only added once, it should only be called once
        assert.strictEqual(callCount, 1, 'handler should be called once (DOM deduplicates listeners)')

        // Remove it once
        jjet.off('test', handler)
        callCount = 0
        et.dispatchEvent(new Event('test'))
        // After removing, it should not be called
        assert.strictEqual(callCount, 0, 'handler should not be called after off()')
    })

    it('properly removes bound handlers with off()', () => {
        const et = new EventTarget()
        const jjet = new JJET(et)
        let callCount = 0

        const handler = function (this: JJET) {
            callCount++
        }

        jjet.on('test', handler)
        et.dispatchEvent(new Event('test'))
        assert.strictEqual(callCount, 1)

        jjet.off('test', handler)
        et.dispatchEvent(new Event('test'))
        assert.strictEqual(callCount, 1, 'handler should not be called after off()')
    })
})
