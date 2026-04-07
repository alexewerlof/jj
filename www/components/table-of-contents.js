import { inRangeInt, isArr, isPOJO, isStr } from 'jty'
import { attr2prop, defineComponent, JJHE } from '../../lib/bundle.js'

const h = JJHE.tree

function parseKeyVal(title, val, level = 1) {
    if (!isStr(title)) {
        throw new TypeError(`Expected title to be a string, got ${title} (${typeof title})`)
    }
    if (!inRangeInt(level, 1, 6)) {
        throw new RangeError(`Expected level for "${title}" to be between 1 and 6, got ${level} (${typeof level})`)
    }
    if (isStr(val)) {
        return h('li').addChild(h('a', { href: val }, title))
    }
    if (!isPOJO(val)) {
        throw new TypeError(
            `Expected content of ${title} to be either a string or an object, got ${val} (${typeof val})`,
        )
    }
    return h('li', null, title).addChild(
        h('ol', { class: `level-${level + 1}` }).addChildMap(Object.entries(val), ([key, childVal]) =>
            parseKeyVal(key, childVal, level + 1),
        ),
    )
}

function parseObj(obj, level = 1) {
    if (!isPOJO(obj)) {
        throw new TypeError(`Expected an object, got ${obj} (${typeof obj})`)
    }
    return h('ol', { class: `level-${level}` }).addChildMap(Object.entries(obj), ([key, val]) =>
        parseKeyVal(key, val, level),
    )
}

function createNav(tocTree) {
    if (!isArr(tocTree)) {
        throw new TypeError(`Expected an array for tocTree, got ${tocTree} (${typeof tocTree})`)
    }

    return h('nav').addChildMap(tocTree, (branch) => parseObj(branch, 1))
}

export class TableOfContents extends HTMLElement {
    static defined = defineComponent('table-of-contents', TableOfContents)

    static observedAttributes = ['toc-tree']

    #root
    #tocTree = []

    get tocTree() {
        return this.#tocTree
    }

    set tocTree(value) {
        this.#tocTree = value
        this.#renderToc()
    }

    constructor() {
        super()
        this.#root = JJHE.from(this)
    }

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    connectedCallback() {
        this.#renderToc()
    }

    #renderToc() {
        try {
            this.#root.setChild(createNav(this.#tocTree))
        } catch (cause) {
            this.#root.setChild(String(cause))
            throw new Error(`Failed to render table of contents`, { cause })
        }
    }
}

export const _test = { createNav, parseKeyVal, parseObj }
