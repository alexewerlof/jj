import { fetchStyle, fetchTemplate, JJHE, defineComponent } from '../../../../lib/bundle.js'

const templatePromise = fetchTemplate(import.meta.resolve('./kanban-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./kanban-card.css'))

export class KanbanCard extends HTMLElement {
    /** @type {JJHE} */
    #jjHost
    #data = { id: '', text: '', priority: 'low' }

    async connectedCallback() {
        if (this.#jjHost) return

        this.#jjHost = JJHE.from(this).setShadow('open')
        this.#jjHost.initShadow(await templatePromise, await stylePromise)

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
        const { id, text, priority } = this.#data
        const jjShadow = this.#jjHost.getShadow()
        jjShadow.find('.text').setText(text)
        jjShadow.find('.id-label').setText(id.slice(0, 4)) // Show short ID

        const tag = jjShadow.find('.tag')
        tag.setText(priority)

        // Reset classes and add the correct priority class
        tag.rmClass('low', 'medium', 'high').addClass(priority)
    }

    static defined = defineComponent('kanban-card', KanbanCard)
}
