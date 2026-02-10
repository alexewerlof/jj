import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { fileExt } from '../src/index.js'

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
        // Note: This implementation differs from Node.js path.extname for dotfiles (which returns '')
        assert.strictEqual(fileExt('.env'), 'env')
        assert.strictEqual(fileExt('.gitignore'), 'gitignore')

        // Directories with dots should not be confused for extensions
        assert.strictEqual(fileExt('folder.v1/file'), '')

        // Current behavior includes query parameters
        assert.strictEqual(fileExt('script.js?v=1'), 'js?v=1')
    })
})
