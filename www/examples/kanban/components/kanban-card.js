import { fetchStyle, fetchTemplate, JJHE, defineComponent } from '../../../../lib/bundle.js'

const templatePromise = fetchTemplate(import.meta.resolve('./kanban-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./kanban-card.css'))

export class KanbanCard extends HTMLElement {
    /** @type {JJHE} */
    #jjHost
    #jjShadow
    #isInitialized = false
    #data = { id: '', text: '', priority: 'low' }

    constructor() {
        super()
        this.#jjHost = JJHE.from(this).setShadow('open')
        this.#jjShadow = this.#jjHost.getShadow(true)
    }

    async connectedCallback() {
        if (this.#isInitialized) return

        this.#jjShadow.init(await templatePromise, await stylePromise)
        this.#isInitialized = true

        // Render initial data
        this.#render()

        // Setup event listeners
        this.#jjHost
            .getShadow()
            .find('.delete-btn')
            .on('click', (e) => {
                e.stopPropagation()
                this.#jjHost.triggerCustomEvent('card-delete', { id: this.#data.id })
            })
    }

    /**
     * @param {{ id: string, text: string, priority: 'low'|'medium'|'high' }} data
     */
    setData(data) {
        this.#data = { ...this.#data, ...data }
        this.setAttribute('id', data.id) // For DnD
        if (this.#jjHost) {
            this.#render()
        }
        return this
    }

    getData() {
        return this.#data
    }

    #render() {
        if (!this.#isInitialized) return
        const { id, text, priority } = this.#data
        this.#jjShadow.find('.text').setText(text)
        this.#jjShadow.find('.id-label').setText(id.slice(0, 4)) // Show short ID

        const tag = this.#jjShadow.find('.tag')
        tag.setText(priority)

        // Reset classes and add the correct priority class
        tag.rmClass('low', 'medium', 'high').addClass(priority)
    }

    static defined = defineComponent('kanban-card', KanbanCard)
}
