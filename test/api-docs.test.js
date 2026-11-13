import assert from 'node:assert/strict'
import test from 'node:test'
import {
    collectAnchors,
    commentPartsToMarkdown,
    formatSignature,
    formatType,
    getCategoryMap,
    getSearchText,
} from '../scripts/render-api-docs.js'

const reflectionFixture = {
    children: [
        {
            id: 1,
            name: 'Widget',
            kind: 128,
            children: [
                {
                    id: 2,
                    name: 'build',
                    kind: 2048,
                    signatures: [
                        {
                            id: 3,
                            name: 'build',
                            typeParameters: [{ name: 'T', type: { type: 'intrinsic', name: 'string' } }],
                            parameters: [
                                {
                                    name: 'name',
                                    flags: { isOptional: true },
                                    type: { type: 'reference', target: 1, name: 'Widget' },
                                },
                                {
                                    name: 'values',
                                    flags: { isRest: true },
                                    type: { type: 'array', elementType: { type: 'intrinsic', name: 'number' } },
                                },
                            ],
                            type: {
                                type: 'union',
                                types: [
                                    { type: 'intrinsic', name: 'string' },
                                    { type: 'reference', target: 1, name: 'Widget' },
                                ],
                            },
                        },
                    ],
                },
            ],
        },
        { id: 4, name: 'makeWidget', kind: 64 },
    ],
    categories: [{ title: 'Components', children: [1] }],
}

test('creates stable symbol and overload anchors from reflection names', () => {
    const anchors = collectAnchors(reflectionFixture)

    assert.equal(anchors.get(1), 'api-widget')
    assert.equal(anchors.get(2), 'api-widget-build')
    assert.equal(anchors.get(3), 'api-widget-build-overload-1')
    assert.equal(collectAnchors(reflectionFixture).get(1), 'api-widget')
})

test('formats nested TypeDoc expressions and generic signatures', () => {
    const anchors = collectAnchors(reflectionFixture)
    const signature = reflectionFixture.children[0].children[0].signatures[0]

    assert.equal(formatType(signature.type, anchors), 'string | Widget')
    assert.equal(
        formatSignature(signature, anchors),
        'build<T extends string>(name?: Widget, ...values: number[]): string | Widget',
    )
})

test('preserves TypeDoc inline links as Markdown links', () => {
    const anchors = collectAnchors(reflectionFixture)
    const markdown = commentPartsToMarkdown(
        [
            { kind: 'text', text: 'Use ' },
            { kind: 'inline-tag', tag: '@link', text: 'Widget', target: 1 },
            { kind: 'text', text: '.' },
        ],
        anchors,
    )

    assert.equal(markdown, 'Use [Widget](#api-widget).')
})

test('groups categorized reflections and retains uncategorized exports', () => {
    const categories = getCategoryMap(reflectionFixture)

    assert.deepEqual(
        categories.map(({ title, reflections }) => [title, reflections.map(({ name }) => name)]),
        [
            ['Components', ['Widget']],
            ['Other', ['makeWidget']],
        ],
    )
})

test('includes member names and signature types in symbol search data', () => {
    const widget = reflectionFixture.children[0]
    const searchText = getSearchText(widget)

    assert.match(searchText, /build/)
    assert.match(searchText, /name/)
    assert.match(searchText, /number\[\]/)
})
