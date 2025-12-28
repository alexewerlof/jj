import { unwrapAll, wrap, wrapAll } from './util.js'
import { Welem } from './Welem.js'

export class Wfrag {
    _frag!: DocumentFragment

    constructor(ref?: DocumentFragment) {
        this.frag = ref instanceof DocumentFragment ? ref : document.createDocumentFragment()
    }

    get frag(): DocumentFragment {
        return this._frag
    }

    set frag(value: DocumentFragment) {
        if (!(value instanceof DocumentFragment)) {
            throw new TypeError(`Expected a DocumentFragment. Got ${value} (${typeof value})`)
        }
        this._frag = value
    }

    byId(id: string): Welem | Wfrag | Text {
        const el = this.frag.getElementById(id)
        if (!el) throw new TypeError(`Element with id ${id} not found`)
        return Welem.from(el)
    }

    byClass(className: string): (Welem | Wfrag | Text)[] {
        return wrapAll((this.frag as any).getElementsByClassName(className))
    }

    query(selector: string): Welem | Wfrag | Text {
        return wrap(this.frag.querySelector(selector))
    }

    queryAll(selector: string): (Welem | Wfrag | Text)[] {
        return wrapAll(this.frag.querySelectorAll(selector))
    }

    empty(): this {
        this.frag.replaceChildren()
        return this
    }

    append(...children: unknown[]): this {
        this.frag.append(...unwrapAll(children))
        return this
    }

    mapAppend<T>(array: T[], mapFn: (item: T) => unknown): this {
        return this.append(...array.map(mapFn))
    }

    prepend(...children: unknown[]): this {
        this.frag.prepend(...unwrapAll(children))
        return this
    }

    mapPrepend<T>(array: T[], mapFn: (item: T) => unknown): this {
        return this.prepend(...array.map(mapFn))
    }
}
