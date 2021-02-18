import { isStr } from "./util"

export const doc = {
    byId(id: string): HTMLElement {
        return document.getElementById(id)
    },
    el(tagName: string, ns?: string) {
        return isStr(ns) ? document.createElementNS(ns, tagName) : document.createElement(tagName)
    },
    fr() {
        return document.createDocumentFragment()
    },
    txt(...strArr: string[]): Text {
        return document.createTextNode(String(strArr.flat().join('')))
    },
    com(...strArr: string[]): Comment {
        return document.createComment(String(strArr.flat().join('')))
    },
}