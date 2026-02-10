import { fetchCss, h, JJHE, registerComponent, ShadowMaster } from '../../../../lib/bundle.js'

const sm = ShadowMaster.create()
    .setTemplate(h('section', { class: 'list' }, h('slot')))
    .addStyles(fetchCss(import.meta.resolve('./todo-list.css')))

export class TodoList extends HTMLElement {
    static register() {
        return registerComponent('todo-list', TodoList)
    }

    async connectedCallback() {
        JJHE.from(this).initShadow('open', await sm.getResolved())
    }
}
