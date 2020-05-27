import { tagName, children, event } from "../../sym.js";

const root = [
    {
        [tagName]: 'h1',
        [children]: 'This is cool, right?'
    },
    {
        [tagName]: 'div',
        [children]: [
            'this is awesome',
            {
                [tagName]: 'input',
                value: 'Alex',
                id: 'name-input'
            },
            {
                [tagName]: 'button',
                [children]: 'Hello!',
                [event]: {
                    click() {
                        const name = document.getElementById('name-input').value
                        alert(`Hello ${name}!`)
                    }
                }
            },
        ],
    }
]

function fnEvents(obj) {
    const ret = { [event]: {} }
    for (let propName in obj) {
        const propVal = obj[propName]
        if (typeof propVal === 'function') {
            ret[event][propName] = propVal
        } else {
            ret[propName] = propVal
        }
    }
    return ret
}

function keykeykey(tagNameValue, otherProps) {
    return {
        [tagName]: tagNameValue,
        ...otherProps
    }
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
                el[prop] = obj[prop]
        }
    }
    
    return el
}

document.body.appendChild(objToEl(root))