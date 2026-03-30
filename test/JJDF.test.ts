import './attach-jsdom.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JJDF, JJHE } from '../src/index.js'

describe('JJDF', () => {
    describe('constructor', () => {
        it('wraps a DocumentFragment', () => {
            const frag = document.createDocumentFragment()
            const jjdf = new JJDF(frag)
            assert.strictEqual(jjdf.ref, frag)
        })

        it('throws if not DocumentFragment', () => {
            assert.throws(() => new JJDF({} as any), TypeError)
        })
    })

    describe(JJDF.from.name, () => {
        it('creates JJDF from DocumentFragment', () => {
            const frag = document.createDocumentFragment()
            const jjdf = JJDF.from(frag)
            assert.ok(jjdf instanceof JJDF)
        })
    })

    describe(JJDF.create.name, () => {
        it('creates new DocumentFragment', () => {
            const jjdf = JJDF.create()
            assert.ok(jjdf instanceof JJDF)
            assert.ok(jjdf.ref instanceof DocumentFragment)
        })
    })

    describe(JJDF.prototype.find.name, () => {
        it('finds element by id in fragment', () => {
            const frag = document.createDocumentFragment()
            const div = document.createElement('div')
            div.id = 'test-id'
            frag.appendChild(div)

            const jjdf = new JJDF(frag)
            const result = jjdf.find('#test-id')
            assert.ok(result)
            assert.strictEqual((result.ref as HTMLElement).id, 'test-id')
        })

        it('returns null when not found', () => {
            const frag = document.createDocumentFragment()
            const jjdf = new JJDF(frag)
            const result = jjdf.find('#nonexistent')
            assert.strictEqual(result, null)
        })

        it('throws when required and not found', () => {
            const frag = document.createDocumentFragment()
            const jjdf = new JJDF(frag)
            assert.throws(() => jjdf.find('#nonexistent', true), ReferenceError)
        })
    })

    describe(JJDF.prototype.findAll.name, () => {
        it('finds all matching elements in a fragment', () => {
            const host = JJDF.create().addTemplate(`
                <ul>
                    <li class="item">a</li>
                    <li class="item">b</li>
                    <li>c</li>
                </ul>
            `)

            const result = host.findAll('.item')

            assert.strictEqual(result.length, 2)
            assert.deepStrictEqual(
                result.map((item) => item.ref.textContent),
                ['a', 'b'],
            )
        })

        it('returns an empty array when there are no matches', () => {
            const host = JJDF.create().addTemplate('<div id="only"></div>')

            const result = host.findAll('.missing')

            assert.deepStrictEqual(result, [])
        })
    })

    describe(JJDF.prototype.addChildren.name, () => {
        it('appends an array of children, ignores nullish values, and coerces others to text', () => {
            const host = JJDF.create()
            const first = JJHE.create('span').setAttr('id', 'first')
            first.ref.textContent = 'first'

            host.addChildren([first, ' tail', null as any, undefined as any, false as any])

            assert.strictEqual(host.find('#first')?.ref.textContent, 'first')
            assert.strictEqual(host.ref.textContent, 'first tailfalse')
            assert.strictEqual(host.ref.childNodes.length, 3)
        })

        it('coerces objects and symbols to text nodes', () => {
            const host = JJDF.create()

            host.addChildren([{ ok: true } as any, Symbol('tag') as any, 9 as any])

            assert.strictEqual(host.ref.textContent, '{"ok":true}Symbol(tag)9')
        })

        it('throws for non-array input', () => {
            const host = JJDF.create()

            assert.throws(() => host.addChildren('nope' as any), TypeError)
        })
    })

    describe(JJDF.prototype.preChildren.name, () => {
        it('prepends an array of children in order', () => {
            const host = JJDF.create().addChild('tail')
            const first = JJHE.create('span').setAttr('id', 'first')
            first.ref.textContent = 'first'

            host.preChildren([first, ' middle '])

            assert.strictEqual(host.ref.textContent, 'first middle tail')
            assert.strictEqual(host.ref.firstChild, host.find('#first')?.ref)
        })
    })

    describe(JJDF.prototype.addChildMap.name, () => {
        it('appends mapped children', () => {
            const host = JJDF.create()

            host.addChildMap(['a', 'b'], (item) => {
                const child = JJHE.create('li')
                child.ref.textContent = item as string
                return child
            })

            assert.deepStrictEqual(
                Array.from(host.ref.childNodes, (node) => node.textContent),
                ['a', 'b'],
            )
        })

        it('wraps failures and preserves the cause', () => {
            const host = JJDF.create()
            const cause = new Error('boom')

            assert.throws(
                () =>
                    host.addChildMap(['a'], () => {
                        throw cause
                    }),
                (error: unknown) => {
                    assert.ok(error instanceof Error)
                    assert.strictEqual(error.message, 'Failed to map array to children')
                    assert.strictEqual(error.cause, cause)
                    return true
                },
            )
        })
    })

    describe(JJDF.prototype.preChildMap.name, () => {
        it('prepends mapped children', () => {
            const host = JJDF.create().addChild('tail')

            host.preChildMap(['a', 'b'], (item) => {
                const child = JJHE.create('li')
                child.ref.textContent = item as string
                return child
            })

            assert.deepStrictEqual(
                Array.from(host.ref.childNodes, (node) => node.textContent),
                ['a', 'b', 'tail'],
            )
        })
    })

    describe(JJDF.prototype.setChildren.name, () => {
        it('replaces existing children and supports empty arrays', () => {
            const host = JJDF.create().addChild('old')
            const replacement = JJHE.create('p').setAttr('id', 'replacement')
            replacement.ref.textContent = 'replacement'

            host.setChildren([replacement, ' tail'])

            assert.strictEqual(host.ref.textContent, 'replacement tail')
            assert.strictEqual(host.find('#replacement')?.ref.textContent, 'replacement')

            host.setChildren([])

            assert.strictEqual(host.ref.childNodes.length, 0)
        })
    })

    describe(JJDF.prototype.setChildMap.name, () => {
        it('replaces existing children with mapped output', () => {
            const host = JJDF.create().addChild('old')

            host.setChildMap(['a', 'b'], (item) => {
                const child = JJHE.create('li')
                child.ref.textContent = item as string
                return child
            })

            assert.deepStrictEqual(
                Array.from(host.ref.childNodes, (node) => node.textContent),
                ['a', 'b'],
            )
        })

        it('wraps failures and preserves the cause', () => {
            const host = JJDF.create()
            const cause = new Error('boom')

            assert.throws(
                () =>
                    host.setChildMap(['a'], () => {
                        throw cause
                    }),
                (error: unknown) => {
                    assert.ok(error instanceof Error)
                    assert.strictEqual(error.message, 'Failed to map array to children')
                    assert.strictEqual(error.cause, cause)
                    return true
                },
            )
        })
    })

    describe(JJDF.prototype.addTemplate.name, () => {
        it('appends parsed nodes from an HTML string', () => {
            const host = JJDF.create()

            host.addTemplate('<span id="hello">hello</span>')

            assert.strictEqual(host.find('#hello')?.ref.textContent, 'hello')
        })

        it('clones HTMLTemplateElement content', () => {
            const host = JJDF.create()
            const template = document.createElement('template')
            template.innerHTML = '<em id="from-template">from-template</em>'

            host.addTemplate(template)

            assert.strictEqual(host.find('#from-template')?.ref.textContent, 'from-template')
        })

        it('accepts JJ wrappers via JJN recursion', () => {
            const host = JJDF.create()
            const source = JJHE.create('section').setAttr('id', 'wrapped-node')
            source.ref.textContent = 'wrapped-node'

            host.addTemplate(source)

            assert.strictEqual(host.find('#wrapped-node')?.ref.textContent, 'wrapped-node')
            assert.notStrictEqual(host.find('#wrapped-node')?.ref, source.ref)
        })

        it('accepts JJDF wrappers via JJN recursion', () => {
            const host = JJDF.create()
            const source = JJDF.create().addTemplate('<strong id="wrapped-fragment">wrapped-fragment</strong>')

            host.addTemplate(source)

            assert.strictEqual(host.find('#wrapped-fragment')?.ref.textContent, 'wrapped-fragment')
        })

        it('throws for Promise inputs', () => {
            const host = JJDF.create()

            assert.throws(() => host.addTemplate(Promise.resolve('<span>x</span>') as any), TypeError)
        })

        it('throws for unsupported inputs', () => {
            const host = JJDF.create()

            assert.throws(() => host.addTemplate(123 as any), TypeError)
        })
    })
})
