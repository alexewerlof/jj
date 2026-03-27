import { fetchStyle, JJHE, defineComponent } from '../../../../lib/bundle.js'

const template = JJHE.tree('section', { class: 'list' }, JJHE.tree('slot'))
const stylePromise = fetchStyle(import.meta.resolve('./todo-list.css'))

export class TodoList extends HTMLElement {
    static defined = defineComponent('todo-list', TodoList)

    async connectedCallback() {
        JJHE.from(this).setShadow('open', template, await stylePromise)
    }
}
