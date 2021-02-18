import { doc } from "./doc"
import { toTag } from "./jj"
import { Tag } from "./Tag"
import { isObj } from "./util"

export class JJBase<T = Element> {
    // See: https://developer.mozilla.org/en-US/docs/Web/API/Node
    static validNodeTypes = [1, 11]

    constructor(public el: T) {
        if (!isObj(el) || !JJBase.validNodeTypes.includes(el.nodeType)) {
            throw new TypeError(`Invalid parameter to Node constructor: ${el}`)
        }
    }

    mount(rootTagOrEl: Tag | Element) {
        const root = toTag(rootTagOrEl)
        return root.setChild(this)
    }

    appendTo(targetElement) {
        toTag(targetElement).addChild(this)
        return this
    }

    appendToHead() {
        return this.appendTo(document.head)
    }

    appendToBody() {
        return this.appendTo(document.body)
    }

    preTo(targetElement) {
        toTag(targetElement).prepend(this)
        return this
    }

    addComment(str) {
        this.append(doc.com(str))
        return this.norm()
    }

    preComment(str) {
        this.prepend(doc.com(str))
        return this.norm()
    }

    //#region child
    addChildren(...children) {
        if (children.length) {
            this.el.append(toNativeFrag(...children))
        }
        return this
    }

    preChildren(...children) {
        if (children.length) {
            this.el.prepend(toNativeFrag(...children))
        }
        return this
    }

    // TODO: Clean data and events
    // https://github.com/jquery/jquery/blob/438b1a3e8a52d3e4efd8aba45498477038849c97/src/manipulation.js#L355
    // https://github.com/jquery/jquery/blob/438b1a3e8a52d3e4efd8aba45498477038849c97/src/manipulation.js#L265
    rmChild(...children) {
        if (children.length) {
            children.map(child => toNativeEl(child)).forEach(nativeChild => this.el.removeChild(nativeChild))
        } else {
            while(this.el.firstChild){
                this.el.removeChild(this.el.firstChild);
            }
        }
        return this
    }
    
    setChild(...children) {
        return this.empty().addChildren(...children)
    }

    mapChildren(arr: any[], mapFn: (value: any, index: number, array: any[]) => unknown) {
        const children = arr.map(mapFn)
        return this.empty().setChild(children)
    }

    getChildren() {
        return arrFrom(this.el.childNodes).map(childNode => toTag(childNode))
    }

    hasChildren(...children) {
        if (children.length === 0) {
            return this.el.hasChildren
        }
        return children.every(child => this.el.contains(toNativeEl(child)))
    }
    //#endregion child
    
    //#region text
    addText(...strings: string[]) {
        strings.flat().forEach(str => this.append(doc.txt(str)))
        return this.norm()
    }

    preText(...strings: string[]) {
        strings.flat().forEach(str => this.prepend(doc.txt(str)))
        return this.norm()
    }
        
    rmText() {
        this.childNodes.filter(c => c instanceof Text).forEach(c => c.remove())
        return this
    }
        
    setText(...strings) {
        return this.rmText().addText(...strings)
    }
        
    json(obj) {
        return this.setText(JSON.stringify(obj, null, 2))
    }
    
    getText() {
        return this.childNodes.map(c => c instanceof Text ? c.wholeText : '').join('')
    }
        
    hasText() {
        return this.childNodes.some(c => c instanceof Text)
    }

    normText() {
        this.el.normalize()
        return this
    }
    //#endregion text
    
    //#region query
    queryId(id: string) {
        const result = this.el.getElementById(id)
        if (result) {
            return toTag(result)
        }
    }

    query(selector) {
        const result = this.el.querySelector(selector)
        if (result) {
            return toTag(result)
        }
    }

    queryAll(selector) {
        const result = arrFrom(this.el.querySelectorAll(selector))
        if (result) {
            return result.map(r => toTag(r))
        }
    }
    //#endregion query
}

alias(Node, {
    addComment: 'comment',
    preTo: 'prependTo',
    addChildren: ['append', 'children', 'child', 'addChild'],
    preChildren: ['prepend', 'prependChildren', 'prependChild'],
    addText: 'text',
    normText: 'norm',
    rmChildren: ['empty', 'clear', 'rmChild'],
    toString: 'stringify',
})
