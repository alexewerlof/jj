import { fetchStyle, JJHE, defineComponent } from '../../../../lib/bundle.js'

const template = JJHE.tree('section', { class: 'list' }, JJHE.tree('slot'))
const stylePromise = fetchStyle(import.meta.resolve('./todo-list.css'))

export class TodoList extends HTMLElement {
    static defined = defineComponent('todo-list', TodoList)

    #jjHost
    #isInitialized = false

    constructor() {
        super()
        this.#jjHost = JJHE.from(this).setShadow('open')
    }

    async connectedCallback() {
        if (this.#isInitialized) {
            return
        }

        this.#jjHost.initShadow(template, await stylePromise)
        this.#isInitialized = true
    }
}
