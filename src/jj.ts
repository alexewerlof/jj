import { Component, isComponent } from "./Component"
import { doc } from "./doc"
import { jaTag } from "./sym"
import { Tag } from "./Tag"
import { isArr } from "./util"

export function toTag(x: Element | Tag | Component): Tag {
    if (x instanceof Element) {
        return x[jaTag] || new Tag(x)
    }
    if (x instanceof Tag) {
        return x
    }
    if (isComponent(x)) {
        return toTag(x.root)
    }
    if (isTagObj(x)) {
        return objToTag(x)
    }
    throw new Error(`Invalid Tag or Element instance: ${x}`)
}

function objToTag(x) {
    const { name, ns } = x
    const el = doc.el(name, ns)
    const ret = new Tag(el)
    mapKeyVal(x, (method, param) => {
        if (method !== 'name' && method !== 'ns' && isFn(ret[method])) {
            if (isArr(param)) {
                ret[method](...param)
            } else {
                ret[method](param)
            }
        }
    })
    return ret
}

function toNativeFrag(...xArr) {
    const ret = doc.fr()
    xArr.forEach(x => x !== undefined && ret.appendChild(toNative(x)))
    return ret
}

function toNativeEl(x) {
    if (arguments.length === 0 || x === undefined) {
        throw new TypeError(`Cannot convert ${x} to native DOM`)
    }
    if (x instanceof Element || x instanceof Text || x instanceof DocumentFragment || x instanceof Comment) {
        return x
    }
    if (x instanceof Tag || x instanceof Frag) {
        return x.el
    }
    if (isComponent(x)) {
        return toNativeEl(x.root)
    }
    if (isTagObj(x)) {
        return objToTag(x).el
    }
    // Whatever else will convert to a text node
    return doc.txt(x)
}

function toNative(x) {
    if (isArr(x)) {
        return toNativeFrag(...x)
    }
    return toNativeEl(x)
}