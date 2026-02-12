import { fetchCss, fetchHtml, JJHE, ShadowMaster } from '../../../../lib/bundle.js'

// Pre-compute styles for the shadow DOM
const sm = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./kanban-card.html')))
    .addStyles(fetchCss(import.meta.resolve('./kanban-card.css')))

export class KanbanCard extends HTMLElement {
    /** @type {JJHE} */
    #root
    #data = { id: '', text: '', priority: 'low' }

    async connectedCallback() {
        if (this.#root) return

        // Initialize Shadow DOM efficiently
        this.#root = JJHE.from(this).initShadow('open', await sm.getResolved())

        // Render initial data
        this.#render()

        // Setup event listeners
        this.#root.shadow.find('.delete-btn').on('click', (e) => {
            e.stopPropagation()
            this.dispatchEvent(
                new CustomEvent('card-delete', {
                    bubbles: true,
                    composed: true,
                    detail: { id: this.#data.id },
                }),
            )
        })
    }

    /**
     * @param {{ id: string, text: string, priority: 'low'|'medium'|'high' }} data
     */
    setData(data) {
        this.#data = { ...this.#data, ...data }
        this.setAttribute('id', data.id) // For DnD
        if (this.#root) {
            this.#render()
        }
        return this
    }

    getData() {
        return this.#data
    }

    #render() {
        const { id, text, priority } = this.#data
        this.#root.shadow.find('.text').setText(text)
        this.#root.shadow.find('.id-label').setText(id.slice(0, 4)) // Show short ID

        const tag = this.#root.shadow.find('.tag')
        tag.setText(priority)

        // Reset classes and add the correct priority class
        tag.rmClass('low', 'medium', 'high').addClass(priority)
    }

    static register() {
        customElements.define('kanban-card', KanbanCard)
    }
}
