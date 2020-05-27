import { tagName, children, event } from "../../sym.js";

const root = {
    h1: 'This is cool, right?',
    div: [
        'this is awesome',
        {
            [tagName]: 'input',
            className: 'some-input',
            value: 'Alex',
            id: 'name-input',
            change() {
                console.log('yes')
            }
        },
        {
            [tagName]: 'button',
            [children]: 'Hello!',
            click(evt) {
                const name = evt.target.previousElementSibling.value
                alert(`Hello ${name}!`)
            }
        },
    ],
    hr: null,
    p: 'Yes this is a paragraph for you ${name}'
}

function normalizeKeyVal(tagNameValue, otherProps) {
    if (otherProps === undefined || otherProps === null) {
        return { [tagName]: tagNameValue }
    }
    if (typeof otherProps === 'string' || Array.isArray(otherProps)) {
        otherProps = { [children]: otherProps }
    }
    return {
        [tagName]: tagNameValue,
        ...otherProps
    }
}

function normalizeKeyValObj(obj) {
    const ret = []
    for (let tagName in obj) {
        ret.push(normalizeKeyVal(tagName, obj[tagName]))
    }
    return ret
}

function toArr(a) {
    return Array.isArray(a) ? a : [a]
}

function frag(arr) {
    const ret = document.createDocumentFragment()
    const children = arr.map(obj => objToEl(obj))
    ret.append(...children)
    return ret
}

function objToEl(obj) {
    if (typeof obj === 'string') {
        return document.createTextNode(obj)
    }
    if (Array.isArray(obj)) {
        return frag(obj)
    }
    const tagNameValue = obj[tagName]
    if (tagNameValue === undefined) {
        throw new TypeError('The tagName is missing')
    }
    const el = document.createElement(tagNameValue)
    for (let prop of Reflect.ownKeys(obj)) {
        switch (prop) {
            case tagName:
                // Skip this one since we should have taken care of it by now
                continue
            case event:
                const eventValue = obj[event]
                for (let eventName of Object.getOwnPropertyNames(eventValue)) {
                    const handler = eventValue[eventName]
                    el.addEventListener(eventName, handler)
                }
                break
            case children:
                el.appendChild(frag(toArr(obj[children])))
                break
            default:
                const propVal = obj[prop]
                if (typeof propVal === 'function') {
                    el.addEventListener(prop, propVal)
                } else {
                    el[prop] = propVal
                }
        }
    }
    
    return el
}

document.body.appendChild(objToEl(normalizeKeyValObj(root)))