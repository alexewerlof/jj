import '../../test/attach-jsdom.js'
import { describe, it } from 'node:test'
import { _test } from './table-of-contents.js'
import assert from 'node:assert'

const { parseObj, parseKeyVal, createNav } = _test

function linesToHTML(...lines) {
    return lines.map((l) => l.trim()).join('')
}

describe(parseKeyVal.name, () => {
    it('creates a list item with a link for string values', () => {
        const key = 'Section 1'
        const val = 'section-1.md'
        assert.deepStrictEqual(parseKeyVal(key, val).ref.outerHTML, '<li><a href="section-1.md">Section 1</a></li>')
    })

    it('creates a list item with nested ordered list for object values', () => {
        const key = 'Section 1'
        const val = {
            'Title 1.1': 'Section-1-1.md',
        }
        assert.deepStrictEqual(
            parseKeyVal(key, val, 2).ref.outerHTML,
            linesToHTML(
                '<li>Section 1',
                '    <ol class="level-3">',
                '        <li><a href="Section-1-1.md">Title 1.1</a></li>',
                '    </ol>',
                '</li>',
            ),
        )
    })

    it('throws TypeError for invalid key or value', () => {
        assert.throws(() => parseKeyVal(123, 'section.md'), TypeError)
        assert.throws(() => parseKeyVal('Title', null), TypeError)
        assert.throws(() => parseKeyVal('Title', []), TypeError)
    })
})

describe(parseObj.name, () => {
    it('creates a single list item', () => {
        const content = { 'Section 1': 'section-1.md' }
        assert.deepStrictEqual(
            parseObj(content).ref.outerHTML,
            linesToHTML(
                '<ol class="level-1">',
                '    <li>',
                '        <a href="section-1.md">Section 1</a>',
                '    </li>',
                '</ol>',
            ),
        )
    })

    it('creates nested ordered lists for children', () => {
        const content = {
            'Section 1': {
                'Title 1.1': 'Section-1-1.md',
            },
            'Section 2': {
                'Title 2.1': 'Section-2-1.md',
                'Title 2.2': {
                    'Title 2.2.1': 'Section-2-2.md',
                },
            },
        }
        assert.deepStrictEqual(
            parseObj(content).ref.outerHTML,
            linesToHTML(
                '<ol class="level-1">',
                '    <li>Section 1',
                '        <ol class="level-2">',
                '            <li><a href="Section-1-1.md">Title 1.1</a></li>',
                '        </ol>',
                '    </li>',
                '    <li>Section 2',
                '        <ol class="level-2">',
                '            <li><a href="Section-2-1.md">Title 2.1</a></li>',
                '            <li>Title 2.2',
                '                <ol class="level-3">',
                '                    <li><a href="Section-2-2.md">Title 2.2.1</a></li>',
                '                </ol>',
                '            </li>',
                '        </ol>',
                '    </li>',
                '</ol>',
            ),
        )
    })

    it('throws TypeError for invalid content', () => {
        assert.throws(() => parseObj('invalid'), TypeError)
    })
})

describe(createNav.name, () => {
    it('handles the real scenario', (t) => {
        const toc = [
            {
                Foundations: {
                    Index: 'index.md',
                    'Getting Started': 'getting-started.md',
                    'Design Philosophy': 'design-philosophy.md',
                    'DOM Fundamentals': {
                        'DOM Fundamentals': 'dom-fundamentals.md',
                        'State and Events': 'state-and-events.md',
                    },
                },
            },
            {
                'Advanced Topics': {
                    'Custom Components': 'custom-components.md',
                    'Wrapper Mental Model': 'wrapper-mental-model.md',
                    'Common Errors': 'common-errors.md',
                },
            },
        ]

        t.assert.snapshot(createNav(toc).ref.outerHTML)
    })
})
