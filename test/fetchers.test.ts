import './attach-jsdom.js'
import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { fetchTemplate, fetchStyle, JJDF } from '../src/index.js'

type MockFetchReply = {
    ok: boolean
    text: string
    status?: number
    statusText?: string
}

type MockFetchInput = {
    input: Parameters<typeof fetch>[0]
    init?: Parameters<typeof fetch>[1]
}

const installFetchMock = (resolver: (args: MockFetchInput) => MockFetchReply | Promise<MockFetchReply>) => {
    const calls: MockFetchInput[] = []

    globalThis.fetch = (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
        calls.push({ input, init })
        const reply = await resolver({ input, init })
        return {
            ok: reply.ok,
            status: reply.status ?? (reply.ok ? 200 : 500),
            statusText: reply.statusText ?? (reply.ok ? 'OK' : 'Error'),
            text: async () => reply.text,
        } as Response
    }) as typeof fetch

    return calls
}

describe('fetch', () => {
    const originalFetch = globalThis.fetch

    beforeEach(() => {
        installFetchMock(() => {
            throw new Error('Unexpected fetch call: install an explicit mock in this test.')
        })
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
    })

    describe('fetchTemplate()', () => {
        it('returns parsed template wrapped in JJDF', async () => {
            installFetchMock(() => {
                return {
                    ok: true,
                    text: '<section id="card">Hello</section>',
                }
            })

            const template = await fetchTemplate('/template.html')
            assert.ok(template instanceof JJDF)
            const section = template.ref.querySelector('#card')
            assert.ok(section)
            assert.strictEqual(section?.textContent, 'Hello')
        })
    })

    describe('fetchStyle()', () => {
        it('returns a CSSStyleSheet from fetched CSS text', async () => {
            installFetchMock(() => {
                return {
                    ok: true,
                    text: ':host { color: red; }',
                }
            })

            const sheet = await fetchStyle('/component.css')
            assert.ok(sheet instanceof CSSStyleSheet)
        })
    })
})
