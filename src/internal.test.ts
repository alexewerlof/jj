import '../test/attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { pas2keb, keb2cam, fileExt } from './internal.js'

describe('pas2keb()', () => {
    it('throws for non-string input', () => {
        assert.throws(() => pas2keb(123 as any), TypeError, 'Should throw for a number')
        assert.throws(() => pas2keb(true as any), TypeError, 'Should throw for a boolean')
        assert.throws(() => pas2keb(null as any), TypeError, 'Should throw for null')
        assert.throws(() => pas2keb(undefined as any), TypeError, 'Should throw for undefined')
    })

    it('converts PascalCase or camelCase to kebab-case', () => {
        assert.strictEqual(pas2keb('PascalCase'), 'pascal-case')
        assert.strictEqual(pas2keb('camelCase'), 'camel-case')
        assert.strictEqual(pas2keb('Hello'), 'hello')
    })

    it('handles consecutive uppercase letters', () => {
        assert.strictEqual(pas2keb('MyHTMLElement'), 'my-html-element')
        assert.strictEqual(pas2keb('isURL'), 'is-url')
        assert.strictEqual(pas2keb('isURLShortener'), 'is-url-shortener')
    })

    it('handles edge cases', () => {
        assert.strictEqual(pas2keb(''), '', 'Should handle empty string')
        assert.strictEqual(pas2keb('A'), 'a')
        assert.strictEqual(pas2keb('I'), 'i')
    })

    it('converts snake_case to kebab-case', () => {
        assert.strictEqual(pas2keb('snake_case'), 'snake-case')
        assert.strictEqual(pas2keb('Snake_Case'), 'snake-case')
    })
})

describe('keb2cam()', () => {
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

describe('fileExt()', () => {
    it('throws for input that is not a string or URL', () => {
        assert.throws(() => fileExt(123 as any), TypeError, 'Should throw for a number')
        assert.throws(() => fileExt(true as any), TypeError, 'Should throw for a boolean')
        assert.throws(() => fileExt(null as any), TypeError, 'Should throw for null')
        assert.throws(() => fileExt(undefined as any), TypeError, 'Should throw for undefined')
        assert.throws(() => fileExt(new URL('file.txt') as any), TypeError, 'Should throw for an object')
    })

    it('returns the extension of a file path', () => {
        assert.strictEqual(fileExt('file.txt'), 'txt')
        assert.strictEqual(fileExt('./file.txt'), 'txt')
        assert.strictEqual(fileExt('./path/to/file.txt'), 'txt')
        assert.strictEqual(fileExt('/path/to/file.txt'), 'txt')
        assert.strictEqual(fileExt('https://www.alexewerlof.com/path/to/file.js'), 'js')
        assert.strictEqual(fileExt('/.well-known/file.css'), 'css')
    })

    it('always returns lowercase', () => {
        assert.strictEqual(fileExt('FILE.TXT'), 'txt')
        assert.strictEqual(fileExt('./FILE.TxT'), 'txt')
        assert.strictEqual(fileExt('./path/to/FILE.Txt'), 'txt')
        assert.strictEqual(fileExt('/path/to/FILE.tXT'), 'txt')
    })

    it('returns an empty string for non-file paths', () => {
        assert.strictEqual(fileExt('/path/to/directory'), '')
        assert.strictEqual(fileExt('https://www.alexewerlof.com/path/to/directory'), '')
    })

    it('returns empty strings if there is no extension', () => {
        assert.strictEqual(fileExt(''), '')
        assert.strictEqual(fileExt('.'), '')
        assert.strictEqual(fileExt('..'), '')
        assert.strictEqual(fileExt('file'), '')
        assert.strictEqual(fileExt('./dir'), '')
        assert.strictEqual(fileExt('/path/to/file.'), '')
    })

    it('handles edge cases for dotfiles and paths', () => {
        assert.strictEqual(fileExt('.env'), 'env')
        assert.strictEqual(fileExt('.gitignore'), 'gitignore')
        assert.strictEqual(fileExt('hidden/.file'), 'file')

        assert.strictEqual(fileExt('folder.v1/file'), '')
        assert.strictEqual(fileExt('/some.path/file'), '')

        assert.strictEqual(fileExt('script.js?v=1'), 'js?v=1')
    })
})
