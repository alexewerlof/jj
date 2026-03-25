import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createLinkPre, addLinkPre, JJHE } from '../src/index.js'

describe('helpers', () => {
    describe('createLinkPre()', () => {
        it('creates prefetch link from string href', () => {
            const link = createLinkPre('https://example.com/page.html', 'prefetch', 'fetch')
            assert.ok(link instanceof JJHE)
            assert.strictEqual(link.ref.tagName, 'LINK')
            assert.strictEqual(link.ref.getAttribute('href'), 'https://example.com/page.html')
            assert.strictEqual(link.ref.getAttribute('rel'), 'prefetch')
            assert.strictEqual(link.ref.getAttribute('as'), 'fetch')
        })

        it('creates preload link from URL object', () => {
            const url = new URL('https://example.com/style.css')
            const link = createLinkPre(url, 'preload', 'style')
            assert.strictEqual(link.ref.getAttribute('href'), 'https://example.com/style.css')
            assert.strictEqual(link.ref.getAttribute('rel'), 'preload')
        })

        it('guesses as="fetch" for HTML files', () => {
            const link = createLinkPre('/page.html', 'prefetch')
            assert.strictEqual(link.ref.getAttribute('as'), 'fetch')
        })

        it('guesses as="style" for CSS files', () => {
            const link = createLinkPre('/style.css', 'prefetch')
            assert.strictEqual(link.ref.getAttribute('as'), 'style')
        })

        it('guesses as="script" for JS files', () => {
            const link = createLinkPre('/app.js', 'prefetch')
            assert.strictEqual(link.ref.getAttribute('as'), 'script')
        })

        it('throws TypeError for non-string/non-URL href', () => {
            assert.throws(() => createLinkPre(123 as any, 'prefetch'), {
                name: 'TypeError',
                message: /Pass a URL object or a path string like/,
            })
        })

        it('throws RangeError for invalid rel', () => {
            assert.throws(() => createLinkPre('/page.html', 'invalid' as any, 'fetch'), {
                name: 'RangeError',
                message: /Use "prefetch" for future navigation or "preload" for current-page resources/,
            })
        })

        it('throws RangeError for invalid as', () => {
            assert.throws(() => createLinkPre('/page.html', 'prefetch', 'invalid' as any), {
                name: 'RangeError',
                message: /Use a valid value or omit it to auto-detect from the URL/,
            })
        })

        it('throws Error when cannot guess as attribute', () => {
            assert.throws(() => createLinkPre('/file.unknown', 'prefetch'), {
                name: 'Error',
                message: /failed to guess/i,
            })
        })
    })

    describe('addLinkPre()', () => {
        it('creates and appends link to document head', () => {
            const initialCount = document.head.childNodes.length
            addLinkPre('/test.html', 'prefetch', 'fetch')
            assert.strictEqual(document.head.childNodes.length, initialCount + 1)
            const lastChild = document.head.lastChild as HTMLLinkElement
            assert.strictEqual(lastChild.tagName, 'LINK')
            assert.strictEqual(lastChild.getAttribute('href'), '/test.html')
        })
    })
})
