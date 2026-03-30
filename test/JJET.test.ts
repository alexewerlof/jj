import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJET, customEvent } from '../src/index.js'

describe('JJET', () => {
    describe('customEvent()', () => {
        it('creates a CustomEvent with detail', () => {
            const event = customEvent('todo-toggle', { id: '123', done: true })

            assert.ok(event instanceof CustomEvent)
            assert.strictEqual(event.type, 'todo-toggle')
            assert.deepStrictEqual(event.detail, { id: '123', done: true })
            assert.strictEqual(event.bubbles, true)
            assert.strictEqual(event.composed, true)
        })

        it('respects explicit option overrides', () => {
            const event = customEvent('panel-ready', undefined, {
                bubbles: false,
                composed: false,
                cancelable: true,
            })

            assert.strictEqual(event.bubbles, false)
            assert.strictEqual(event.composed, false)
            assert.strictEqual(event.cancelable, true)
            assert.strictEqual(event.detail, null)
        })

        it('throws TypeError for non-string event names', () => {
            assert.throws(() => customEvent(123 as any), {
                name: 'TypeError',
                message: /Pass an event name like/,
            })
        })
    })

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

    it('triggers a custom event from a name and detail payload', () => {
        const et = new EventTarget()
        const jjet = new JJET(et)
        let received: CustomEvent<{ id: string; done: boolean }> | undefined

        jjet.on('todo-toggle', (event: Event) => {
            received = event as CustomEvent<{ id: string; done: boolean }>
        })

        const result = jjet.triggerCustomEvent('todo-toggle', { id: '123', done: true })

        assert.strictEqual(result, jjet)
        assert.ok(received instanceof CustomEvent)
        assert.deepStrictEqual(received.detail, { id: '123', done: true })
        assert.strictEqual(received.bubbles, true)
        assert.strictEqual(received.composed, true)
    })

    it('passes custom event option overrides through triggerCustomEvent()', () => {
        const et = new EventTarget()
        const jjet = new JJET(et)
        let received: CustomEvent<string> | undefined

        jjet.on('panel-ready', (event: Event) => {
            received = event as CustomEvent<string>
            received.preventDefault()
        })

        jjet.triggerCustomEvent('panel-ready', 'ready', {
            bubbles: false,
            composed: false,
            cancelable: true,
        })

        assert.ok(received instanceof CustomEvent)
        assert.strictEqual(received.detail, 'ready')
        assert.strictEqual(received.bubbles, false)
        assert.strictEqual(received.composed, false)
        assert.strictEqual(received.cancelable, true)
        assert.strictEqual(received.defaultPrevented, true)
    })

    it('removes event listeners with off()', () => {
        const et = new EventTarget()
        const jjet = new JJET(et)
        let callCount = 0
        const handler = () => callCount++

        jjet.on('test', handler)
        et.dispatchEvent(new Event('test'))
        assert.strictEqual(callCount, 1)

        jjet.off('test', handler)
        et.dispatchEvent(new Event('test'))
        assert.strictEqual(callCount, 1, 'handler should not be called after off()')
    })

    it('runs synchronously and returns this for chaining', () => {
        const et = new EventTarget()
        const jjet = new JJET(et)
        const calls: string[] = []

        const result = jjet.run(function (ref) {
            calls.push('run')
            assert.strictEqual(this, jjet)
            assert.strictEqual(ref, jjet)
            return 'ignored' as unknown as void
        })

        calls.push('after')

        assert.deepStrictEqual(calls, ['run', 'after'])
        assert.strictEqual(result, jjet)
    })

    it('wraps errors thrown inside run()', () => {
        const et = new EventTarget()
        const jjet = new JJET(et)
        const cause = new Error('boom')

        assert.throws(
            () => {
                jjet.run(() => {
                    throw cause
                })
            },
            (error: unknown) => {
                assert(error instanceof Error)
                assert.strictEqual(error.message, 'Failed to run the function')
                assert.strictEqual(error.cause, cause)
                return true
            },
        )
    })
})
