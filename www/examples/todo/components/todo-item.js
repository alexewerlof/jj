import { attr2prop, fetchCss, fetchHtml, JJHE, registerComponent, ShadowMaster } from '../../../../lib/bundle.js'

const sm = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./todo-item.html')))
    .addStyles(fetchCss(import.meta.resolve('./todo-item.css')))

export class TodoItem extends HTMLElement {
    static observedAttributes = ['item-id', 'text', 'done']

    static register() {
        return registerComponent('todo-item', TodoItem)
    }

    #itemId = ''
    #text = ''
    #done = false

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    get itemId() {
        return this.#itemId
    }

    set itemId(value) {
        this.#itemId = value ?? ''
        this.#renderMeta()
    }

    get text() {
        return this.#text
    }

    set text(value) {
        this.#text = value ?? ''
        this.#renderText()
    }

    get done() {
        return this.#done
    }

    set done(value) {
        this.#done = value === '' || value === true || value === 'true' || value === '1'
        this.#renderDone()
    }

    async connectedCallback() {
        this.jjRoot = JJHE.from(this).initShadow('open', await sm.getResolved())
        const check = this.jjRoot.shadow.find('#check')
        const remove = this.jjRoot.shadow.find('#remove')

        check.on('change', () => this.#onToggle())
        remove.on('click', () => this.#onRemove())

        this.#render()
    }

    #onToggle() {
        const check = this.jjRoot?.shadow.find('#check')
        const done = check ? check.ref.checked : false
        this.dispatchEvent(
            new CustomEvent('todo-toggle', {
                detail: {
                    id: this.itemId,
                    done,
                },
                bubbles: true,
                composed: true,
            }),
        )
    }

    #onRemove() {
        this.dispatchEvent(
            new CustomEvent('todo-remove', {
                detail: {
                    id: this.itemId,
                },
                bubbles: true,
                composed: true,
            }),
        )
    }

    #render() {
        this.#renderText()
        this.#renderDone()
        this.#renderMeta()
    }

    #renderText() {
        this.jjRoot?.shadow.find('#text').setText(this.text)
    }

    #renderDone() {
        const item = this.jjRoot?.shadow.find('#item')
        const check = this.jjRoot?.shadow.find('#check')
        if (item) {
            item.setClass({ 'is-done': this.done })
        }
        if (check) {
            check.ref.checked = this.done
        }
    }

    #renderMeta() {
        if (!this.itemId) {
            return
        }
        this.jjRoot?.shadow.find('#meta').setText(`Task · ${this.itemId.slice(0, 6)}`)
    }
}
