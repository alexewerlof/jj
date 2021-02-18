import { doc } from "./doc"
import { toTag } from "./jj"

export function queryId(elementId) {
    return toTag(doc.byId(elementId))
}

export function query(selector, root = document.body) {
    return toTag(root).query(selector)
}

export function queryAll(selector, root = document.body) {
    return toTag(root).queryAll(selector)
}