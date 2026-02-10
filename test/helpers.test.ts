import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { h, createLinkPre, addLinkPre, JJHE } from '../src/index.js'

describe('helpers', () => {
    describe('h()', () => {
        it('creates element from tag name', () => {
            const el = h('div')
            assert.ok(el instanceof JJHE)
            assert.strictEqual(el.ref.tagName, 'DIV')
        })

        it('sets attributes', () => {
            const el = h('div', { id: 'test', class: 'foo' })
            assert.strictEqual(el.ref.id, 'test')
            assert.strictEqual(el.ref.className, 'foo')
        })

        it('handles null attributes', () => {
            const el = h('div', null, 'text')
            assert.ok(el instanceof JJHE)
            assert.strictEqual(el.ref.textContent, 'text')
        })

        it('appends string children', () => {
            const el = h('div', null, 'hello', ' world')
            assert.strictEqual(el.ref.textContent, 'hello world')
        })

        it('appends element children', () => {
            const child = document.createElement('span')
            const el = h('div', null, child)
            assert.strictEqual(el.ref.childNodes.length, 1)
            assert.strictEqual(el.ref.firstChild, child)
        })

        it('appends JJHE children', () => {
            const child = h('span')
            const el = h('div', null, child)
            assert.strictEqual(el.ref.childNodes.length, 1)
            assert.strictEqual(el.ref.firstChild, child.ref)
        })

        it('creates nested structure', () => {
            const el = h('ul', null, h('li', null, 'Item 1'), h('li', null, 'Item 2'))
            assert.strictEqual(el.ref.childNodes.length, 2)
            assert.strictEqual(el.ref.childNodes[0].textContent, 'Item 1')
            assert.strictEqual(el.ref.childNodes[1].textContent, 'Item 2')
        })
    })

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
                message: /Expected 'href' to be a string or URL/,
            })
        })

        it('throws RangeError for invalid rel', () => {
            assert.throws(() => createLinkPre('/page.html', 'invalid' as any, 'fetch'), {
                name: 'RangeError',
                message: /Expected 'rel'/,
            })
        })

        it('throws RangeError for invalid as', () => {
            assert.throws(() => createLinkPre('/page.html', 'prefetch', 'invalid' as any), {
                name: 'RangeError',
                message: /Expected 'as'/,
            })
        })

        it('throws Error when cannot guess as attribute', () => {
            assert.throws(() => createLinkPre('/file.unknown', 'prefetch'), {
                name: 'Error',
                message: /failed to guess/,
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
