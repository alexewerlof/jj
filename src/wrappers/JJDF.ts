import { isInstance, isStr } from 'jty'
import { typeErr } from '../internal.js'
import { JJNx } from './JJNx.js'
import { JJHE } from './JJHE.js'

/**
 * Wraps a DocumentFragment (which is a descendant of Node).
 *
 * @remarks
 * DocumentFragments are lightweight versions of Document that store a segment of a document structure
 * comprised of nodes just like a standard document. The key difference is that because the document fragment
 * isn't part of the active document tree structure, changes made to the fragment don't affect the document,
 * cause reflow, or incur any performance impact that can occur when changes are made.
 *
 * @category Wrappers
 * @example
 * ```ts
 * const frag = JJDF.create()
 * frag.addChild(
 *   h('div', null, 'Item 1'),
 *   h('div', null, 'Item 2'),
 * )
 * doc.body.addChild(frag)
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment | DocumentFragment}
 */
export class JJDF<T extends DocumentFragment = DocumentFragment> extends JJNx<T> {
    /**
     * Creates a JJDF instance from a DocumentFragment reference.
     *
     * @remarks
     * Use {@link JJDF.create} to create a new empty DocumentFragment.
     * For other Node types, use {@link JJN.from} or the specific wrapper type.
     *
     * @example
     * ```ts
     * const frag = JJDF.from(myFrag)
     * ```
     *
     * @param ref - The DocumentFragment instance.
     * @returns A new JJDF instance.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment | DocumentFragment}
     */
    static from(ref: DocumentFragment): JJDF {
        return new JJDF(ref)
    }

    /**
     * Creates a new empty JJDF instance (wraps a new DocumentFragment).
     *
     * @remarks
     * To wrap an existing DocumentFragment, use {@link JJDF.from}.
     * To create templates from HTML or other sources, use {@link JJDF.addTemplate}.
     *
     * @example
     * ```ts
     * const frag = JJDF.create()
     * ```
     *
     * @returns A new JJDF instance.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment | document.createDocumentFragment}
     */
    static create(): JJDF<DocumentFragment> {
        return new JJDF(document.createDocumentFragment())
    }

    /**
     * Create a JJDF by cloning various template sources.
     *
     * @param template - The template source, which can be a string, HTMLTemplateElement, DocumentFragment, HTMLElement, or JJDF.
     * @returns A JJDF<DocumentFragment> representing the template content.
     * @throws {TypeError} If the template type is unsupported.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createRange | Document.createRange}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement | HTMLTemplateElement}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment | DocumentFragment}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement | HTMLElement}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode | Node.cloneNode}
     */
    addTemplate(
        template:
            | string
            | HTMLTemplateElement
            | DocumentFragment
            | HTMLElement
            | JJHE<HTMLTemplateElement>
            | JJHE<HTMLElement>
            | JJDF,
    ): this {
        if (isStr(template)) {
            // Using Range for faster parsing than innerHTML
            return this.addChild(document.createRange().createContextualFragment(template))
        }
        if (isInstance(template, DocumentFragment) || isInstance(template, HTMLElement)) {
            return this.addChild(
                isInstance(template, HTMLTemplateElement)
                    ? (template.content.cloneNode(true) as DocumentFragment)
                    : (template.cloneNode(true) as DocumentFragment),
            )
        }
        if (isInstance(template, JJDF) || isInstance(template, JJHE)) {
            return this.addTemplate(template.ref)
        }
        throw typeErr(
            'template',
            'a string, DocumentFragment, HTMLElement, JJDF, or JJHE',
            template,
            'Pass an HTML string, a DOM template/fragment/element, or a JJ wrapper.',
        )
    }

    /**
     * Creates an instance of JJDF.
     *
     * @param ref - The DocumentFragment instance to wrap.
     * @throws {TypeError} If `ref` is not a DocumentFragment.
     */
    constructor(ref: T) {
        if (!isInstance(ref, DocumentFragment)) {
            throw typeErr('ref', 'a DocumentFragment', ref, 'Use JJDF.from(documentFragment) to create an instance.')
        }
        super(ref)
    }
}
