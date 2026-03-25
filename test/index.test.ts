import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import * as jj from '../src/index.js'

describe('index exports', () => {
    it('does not export the doc convenience wrapper', () => {
        assert.ok(!('doc' in jj))
        assert.strictEqual((jj as Record<string, unknown>).doc, undefined)
    })
})