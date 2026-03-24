import { fetchStyle, h, JJHE, registerComponent } from '../../../../lib/bundle.js'

const template = h('section', { class: 'list' }, h('slot'))
const stylePromise = fetchStyle(import.meta.resolve('./todo-list.css'))

export class TodoList extends HTMLElement {
    static register() {
        return registerComponent('todo-list', TodoList)
    }

    async connectedCallback() {
        JJHE.from(this).initShadow('open', template, await stylePromise)
    }
}
