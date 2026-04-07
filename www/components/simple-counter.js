import { fetchTemplate, fetchStyle, JJHE, defineComponent } from '../../lib/bundle.js'

const templatePromise = fetchTemplate(import.meta.resolve('./simple-counter.html'))
const stylePromise = fetchStyle(import.meta.resolve('./simple-counter.css'))

export class SimpleCounter extends HTMLElement {
    static defined = defineComponent('simple-counter', SimpleCounter)

    #host
    #root = null
    #countSpan
    #incButton
    #decButton
    // State
    #count = 0

    #onIncrement = () => this.#update(1)
    #onDecrement = () => this.#update(-1)

    constructor() {
        super()
        this.#host = JJHE.from(this).setShadow('open')
    }

    async connectedCallback() {
        if (!this.#root) {
            this.#root = this.#host.initShadow(await templatePromise, await stylePromise).getShadow(true)

            // Access elements inside Shadow DOM via this.#root
            this.#countSpan = this.#root.find('#count', true)
            this.#incButton = this.#root.find('#inc', true)
            this.#decButton = this.#root.find('#dec', true)
        }

        this.#incButton.on('click', this.#onIncrement)
        this.#decButton.on('click', this.#onDecrement)
    }

    disconnectedCallback() {
        this.#incButton?.off('click', this.#onIncrement)
        this.#decButton?.off('click', this.#onDecrement)
    }

    #update(delta) {
        this.#count += delta
        this.#countSpan.setText(String(this.#count))
    }
}
