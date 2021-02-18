import { html } from "./proxy";

export function h(tagName: string, attrs, children) {
    return html(tagName).setAttrs(attrs).append(children)
}