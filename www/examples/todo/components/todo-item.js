import { attr2prop, fetchStyle, fetchTemplate, JJHE, defineComponent } from '../../../../lib/bundle.js'

const templatePromise = fetchTemplate(import.meta.resolve('./todo-item.html'))
const stylePromise = fetchStyle(import.meta.resolve('./todo-item.css'))

export class TodoItem extends HTMLElement {
    static observedAttributes = ['item-id', 'text', 'done']
    static defined = defineComponent('todo-item', TodoItem)

    #jjHost
    #jjShadow
    #itemId = ''
    #text = ''
    #done = false
    #isInitialized = false

    constructor() {
        super()
        this.#jjHost = JJHE.from(this).setShadow('open')
        this.#jjShadow = this.#jjHost.getShadow(true)
    }

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
        if (!this.#isInitialized) {
            this.#jjShadow.init(await templatePromise, await stylePromise)
            this.#isInitialized = true
            const jjCheck = this.#jjShadow.find('#check')
            const jjRemove = this.#jjShadow.find('#remove')

            jjCheck.on('change', () => this.#onToggle())
            jjRemove.on('click', () => this.#onRemove())
        }

        this.#render()
    }

    #onToggle() {
        const jjCheck = this.#jjShadow.find('#check')
        const done = jjCheck ? jjCheck.ref.checked : false
        this.dispatchEvent(
            new CustomEvent('todo-toggle', { detail: { id: this.itemId, done }, bubbles: true, composed: true }),
        )
    }

    #onRemove() {
        this.dispatchEvent(
            new CustomEvent('todo-remove', { detail: { id: this.itemId }, bubbles: true, composed: true }),
        )
    }

    #render() {
        this.#renderText()
        this.#renderDone()
        this.#renderMeta()
    }

    #renderText() {
        this.#jjShadow.find('#text').setText(this.text)
    }

    #renderDone() {
        const jjItem = this.#jjShadow.find('#item')
        const jjCheck = this.#jjShadow.find('#check')
        if (jjItem) {
            jjItem.setClasses({ 'is-done': this.done })
        }
        if (jjCheck) {
            jjCheck.ref.checked = this.done
        }
    }

    #renderMeta() {
        if (!this.itemId) {
            return
        }
        this.#jjShadow.find('#meta').setText(`Task · ${this.itemId.slice(0, 6)}`)
    }
}
