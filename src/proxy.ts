import { doc } from "./doc"
import { toTag } from "./jj"
import { isStr } from "./util"

const HTTP_WWW_W3_ORG = 'http://www.w3.org/'
const SVG_NS = HTTP_WWW_W3_ORG + '2000/svg'
const MATH_NS = HTTP_WWW_W3_ORG + '1998/mathml'

function htmlTag(tagName = 'html') {
    return toTag(isStr(tagName) ? doc.el(tagName) : tagName)
}

export function svgTag(tagName = 'svg') {
    return toTag(isStr(tagName) ? doc.el(tagName, SVG_NS) : tagName)
}

export function mathMlTag(tagName = 'math') {
    return toTag(isStr(tagName) ? doc.el(tagName, MATH_NS) : tagName)
}

const sugarProxy = {
    get(target, tagName) {
        const tag = target(tagName)
        return function proxiedTag(...children) {
            return tag.append(...children)
        }
    }
}

export const html = new Proxy(htmlTag, sugarProxy)
export const svg = new Proxy(svgTag, sugarProxy)
export const mathMl = new Proxy(mathMlTag, sugarProxy)

