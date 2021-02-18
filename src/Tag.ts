import { mapKeyVal, alias, isArr, arrFrom, isObj, isStr } from './util.js'
import { control } from './control.js'
import { events } from './events.js'
import { toTag } from './jj.js'
import { doc } from './doc.js'

const STYLE = 'style'
const HIDDEN = 'hidden'
const DISABLED = 'disabled'
const MOUSE = 'mouse'

export class Tag {
    // See: https://developer.mozilla.org/en-US/docs/Web/API/Node
    static validNodeTypes = [1, 11]
    public el: Element

    constructor(x: Tag | Element) {
        // TODO if x is a Tag, we're essentially creating two tag objects pointing to the same native element!
        this.el = x instanceof Tag ? x.el : x
        if (!isObj(this.el) || !Tag.validNodeTypes.includes(this.el.nodeType)) {
            throw new TypeError(`Invalid parameter to Node constructor: ${x}`)
        }
    }

    mount(rootTagOrEl: Tag | Element) {
        const root = toTag(rootTagOrEl)
        return root.setChild(this)
    }

    appendTo(targetElement: Tag | Element) {
        toTag(targetElement).addChildren(this)
        return this
    }

    appendToHead() {
        return this.appendTo(document.head)
    }

    appendToBody() {
        return this.appendTo(document.body)
    }

    preTo(targetElement) {
        toTag(targetElement).preChildren(this)
        return this
    }

    norm() {
        this.el.normalize()
        return this
    }

    addComment(...strArr: string[]) {
        this.addChildren(doc.com(...strArr))
        return this.norm()
    }

    preComment(...strArr: string[]) {
        this.preChildren(doc.com(...strArr))
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

    clone(deep: boolean) {
        return new Tag(this.el.cloneNode(deep))
    }

    get parent() {
        return toTag(this.el.parentElement)
    }

    get ns() {
        return this.el.namespaceURI
    }

    get classList() {
        return this.el.classList
    }

    get childNodes(): ChildNode[] {
        return arrFrom(this.el.childNodes)
    }

    style(styles) {
        if (isObj(styles)) {
            mapKeyVal(styles, (k, v) => this.el.style[k] = v)
        } else {
            this.rmProps('style')
        }
        return this
    }

    //#region class
    setClasses(...classNames) {
        this.el.className = classNames.join(' ')
    }

    getClass() {
        return this.el.className
    }

    getClasses() {
        return arrFrom(this.el.className)
    }

    hasClasses(...classNames) {
        return classNames.every(className => this.classList.contains(className))
    }

    addClasses(...classNames) {
        this.classList.add(...classNames)
        return this
    }

    rmClasses(...classNames) {
        this.classList.remove(...classNames)
        return this
    }

    mvClass(oldClassName, newClassName) {
        this.classList.replace(oldClassName, newClassName)
        return this
    }

    mvClasses(classNamesDic) {
        mapKeyVal(classNamesDic, (oldClassName, newClassName) => this.mvClass(oldClassName, newClassName))
        return this
    }

    togClass(className, force) {
        this.classList.toggle(className, force)
        return this
    }
    
    togClassObj(classNameDic) {
        mapKeyVal(classNameDic, (className, force) => this.togClass(className, force))
        return this
    }

    togClasses(...classNames) {
        classNames.forEach(className => this.togClass(className))
        return this
    }
    //#endregion class

    //#region attr
    setAttr(attrName, attrValue) {
        if (attrName.toLowerCase() === STYLE) {
            return this.style(attrValue)
        }
        if (attrValue === undefined) {
            attrValue = ''
        }
        this.el.setAttribute(attrName, attrValue)
        return this
    }

    setAttrs(attrsDic) {
        if (!isObj(attrsDic)) {
            throw new TypeError(`Expected an object but got ${attrsDic}`)
        }
        mapKeyVal(attrsDic, (attrName, attrValue) => this.setAttr(attrName, attrValue))
        return this
    }

    getAttr(attrName) {
        return this.el.getAttribute(attrName)
    }

    getAttrs(...attrNames) {
        return Object.fromEntries(
            attrNames.map(attrName => [attrName, this.getAttr(attrName)])
        )
    }

    hasAttrs(...attrNames) {
        return attrNames.every(attrName => this.this.el.hasAttribute(attrName))
    }

    rmAttrs(...attrNames) {
        attrNames.forEach((attrName) => {
            this.el.removeAttribute(attrName)
        })
        return this
    }

    togAttr(attrName, force) {
        this.el.toggleAttribute(attrName, force)
        return this
    }
    //#endregion attr

    //#region prop
    setProp(propName, propValue) {
        if (propName.toLowerCase() === STYLE) {
            return this.style(propValue)
        }
        this.el[propName] = propValue
        return this
    }

    setPropsObj(propsDic) {
        mapKeyVal(propsDic, (propName, propValue) => this.setProp(propName, propValue))
        return this
    }

    getProp(propName) {
        return this.el[propName]
    }

    getPropsObj(...propNames) {
        return Object.fromEntries(
            propNames.map(propName => [propName, this.getProp(propName)])
        )
    }

    hasProps(...propNames) {
        return propNames.every(propName => propName in this.el)
    }

    rmProps(...propNames) {
        propNames.forEach((propName) => {
            try {
                delete this.el[propName]
            }
            catch (e) {
                this.el[propName] = undefined
            }
        })
        return this
    }

    togProp(propName, force = false) {
        if (arguments.length === 2) {
            this.setProp(propName, !!force)
        } else {
            this.setProp(propName, !!this.getProp(propName))
        }
        return this
    }
    //#endregion prop
    
    //#region data
    setData(name, value) {
        this.el.dataset[name] = value
        return this
    }

    setDataObj(dataDic) {
        mapKeyVal(dataDic, (name, value) => this.setData(name, value))
        return this
    }

    getData(name) {
        return this.el.dataset[name]
    }

    getDataObj(...names) {
        return Object.fromEntries(names.map(name => [name, this.getData(name)]))
    }

    hasData(name) {
        return name in this.el.dataset
    }

    rmData(name) {
        return delete this.el.dataset[name]
    }
    //#endregion data

    //#region visibility
    tog(show) {
        if (arguments.length === 1) {
            return this.togProp(HIDDEN, !show)
        }
        return this.togProp(HIDDEN)
    }

    hide() {
        return this.setProp(HIDDEN, false)
    }
    
    show() {
        return this.setProp(HIDDEN, true)
    }    
    //#endregion visibility

    //#region disabled
    disable(isDisabled = true) {
        return isDisabled ? this.setProp(DISABLED, DISABLED) : this.rmProps(DISABLED)
    }
    
    enable(isEnabled = true) {
        return this.disable(!!isEnabled)
    }    
    //#endregion disabled

    //#region input elements
    focus() {
        this.el.focus()
        return this
    }

    getVal() {
        if (this.el instanceof HTMLSelectElement) {
            return this.hasProps('multiple') ? Array.from(this.el.selectedOptions) : this.el.value
        }
        if (this.el instanceof HTMLTextAreaElement) {
            return this.getProp('value')
        }
        if (this.el instanceof HTMLInputElement) {
            let type = this.hasProp('type')
            if (!type) {
                type = 'text'
            } else {
                type = type.toLowerCase()
            }
            switch(this.getProp('type')) {
                case 'radio':
                case 'checkbox':
                    return this.hasProp('checked')
                default:
                    // text, number, search, password, tel, url, week, month, time, date, datetime-local, email, color
                    if (this.hasProp('value')) {
                        return this.getProp('value')
                    }
                    // Currently type=hidden, button, reset, submit, file, image, range, etc. are not supported
                    throw new TypeError(`Unsupported value type ${this.el}`)
            }
        }
        throw new TypeError(`This is not an input element ${this.el}`)
    }
    //#endregion input elements


    //#region query
    closest(selector) {
        return this.el.closest(selector) || undefined
    }

    matches(selector) {
        return this.el.matches(selector)
    }
    //#endregion query
    
    //#reguin animation
    animFrame(fn, ...extraParams) {
        // TODO we should throw if a loop is already running (or merge loops)
        const runFn = () => {
            if (this.isAttached()) {
                this.run(fn, ...extraParams)
            }
            scheduleCall()
        }

        const scheduleCall = () => {
            this.animFrameRequestId = window.requestAnimationFrame(runFn)
        }

        scheduleCall()
        return this
    }

    clearAnimFrame() {
        window.requestAnimationFrame(this.animFrameRequestId)
        return this
    }
    //#endregion animation

    aria(noun, value) {
        return this.setAttr(`aria-${noun}`, value)
    }

    wrap(wrapper) {
        wrapper = toTag(wrapper)
        return wrapper.append(this)
    }

    swap(otherTag) {
        this.el.replaceWith(otherTag.el)
        return otherTag
    }

    isAttached() {
        return document.documentElement.contains(this.el)
    }

    queryId(id) {
        const result = this.el.querySelector('#' + id)
        if (result) {
            return toTag(result)
        }
    }

    toString() {
        return this.el.outerHTML
    }
}

Object.assign(Tag.prototype, control, events)

const attrShorthands = [
    'alt',
    'aria-role',
    'checked',
    'content',
    'height',
    HIDDEN,
    'href',
    'htmlFor',
    'id',
    'is',
    'label',
    'lang',
    'name',
    'placeholder',
    'readonly',
    'rel',
    'required',
    'role',
    'selected',
    'src',
    'title',
    'type',
    'value',
    'width',
]

attrShorthands.forEach(attrName => {
    Tag.prototype[attrName] = function (attrValue) {
        return this.setAttr(attrName, attrValue)
    }
})

const eventShorthands = [
    'attached',
    'blur',
    'change',
    'click',
    'contextmenu',
    'dblclick',
    'detached',
    'error',
    'focus',
    'focusout',
    'hover',
    'keydown',
    'keydpress',
    'keydup',
    'load',
    MOUSE + 'down',
    MOUSE + 'enter',
    MOUSE + 'leave',
    MOUSE + 'move',
    MOUSE + 'out',
    MOUSE + 'over',
    MOUSE + 'up',
    'resize',
    'scroll',
    'select',
    'submit',
    'unload',
]

eventShorthands.forEach(eventName => {
    Tag.prototype[eventName] = function (...handlers) {
        this.on(eventName, ...handlers)
        return this
    }
})

alias(Tag, {
    addClasses: ['addClass', 'class', 'classes'],
    class: 'className',
    hasClasses: 'hasClass',
    rmClasses: 'rmClass',
    setClasses: 'setClass',
    togClass: 'toggleClass',
    
    hasAttrs: 'hasAttr',
    rmAttrs: 'rmAttr',
    setAttr: 'attr',
    setAttrs: 'attrs',
    togAttr: 'toggleAttr',
    
    hasProps: 'hasProp',
    rmProps: 'rmProp',
    setProp: 'prop',
    setProps: 'props',

    tog: 'toggle',
    swap: ['swapWith', 'replaceWith', 'replace'],
    
    value: 'val',
    htmlFor: 'for',
})

function isTagObj(x: unknown) {
    return isObj(x) && isStr(x.name)
}





