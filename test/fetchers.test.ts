import './attach-jsdom.js'
import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { fetchText, fetchHtml, fetchCss, fetchTemplate, fetchStyle, JJDF } from '../src/index.js'

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

    describe('fetchText()', () => {
        it('fetches text with default mime header', async () => {
            const calls = installFetchMock(() => {
                return {
                    ok: true,
                    text: 'hello',
                }
            })

            const result = await fetchText('/data.txt')
            assert.strictEqual(result, 'hello')
            const acceptHeader = (calls[0]?.init?.headers as Record<string, string> | undefined)?.Accept ?? null
            assert.strictEqual(acceptHeader, 'text/*')
        })

        it('throws TypeError for non-string mime', async () => {
            await assert.rejects(async () => await fetchText('/data.txt', 42 as any), {
                name: 'TypeError',
            })
        })

        it('throws on non-ok response', async () => {
            installFetchMock(() => {
                return {
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                    text: '',
                }
            })

            await assert.rejects(async () => await fetchText('/missing.txt'), {
                name: 'Error',
                message: /GET \/missing\.txt failed: 404 Not Found/,
            })
        })
    })

    describe('fetchHtml()', () => {
        it('uses text/html accept header', async () => {
            const calls = installFetchMock(() => {
                return {
                    ok: true,
                    text: '<p>ok</p>',
                }
            })

            const html = await fetchHtml('/fragment.html')
            assert.strictEqual(html, '<p>ok</p>')
            const acceptHeader = (calls[0]?.init?.headers as Record<string, string> | undefined)?.Accept ?? null
            assert.strictEqual(acceptHeader, 'text/html')
        })
    })

    describe('fetchCss()', () => {
        it('uses text/css accept header', async () => {
            const calls = installFetchMock(() => {
                return {
                    ok: true,
                    text: ':host { display: block; }',
                }
            })

            const css = await fetchCss('/style.css')
            assert.strictEqual(css, ':host { display: block; }')
            const acceptHeader = (calls[0]?.init?.headers as Record<string, string> | undefined)?.Accept ?? null
            assert.strictEqual(acceptHeader, 'text/css')
        })
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
