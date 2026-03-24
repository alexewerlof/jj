import { attr2prop, fetchStyle, fetchHtml, JJHE, defineComponent } from '../../lib/bundle.js'

const templatePromise = fetchHtml(import.meta.resolve('./simple-counter.html'))
const stylePromise = fetchStyle(import.meta.resolve('./simple-counter.css'))

export class SimpleCounter extends HTMLElement {
    static defined = defineComponent('simple-counter', SimpleCounter)

    #root
    #countSpan
    // State
    #count = 0

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    async connectedCallback() {
        if (this.#root) {
            return
        }

        this.#root = JJHE.from(this).initShadow('open', await templatePromise, await stylePromise).shadow

        // Access elements inside Shadow DOM via this.#root
        this.#countSpan = this.#root.find('#count', true)
        this.#root.find('#inc', true).on('click', () => this.#update(1))
        this.#root.find('#dec', true).on('click', () => this.#update(-1))
    }

    #update(delta) {
        this.#count += delta
        this.#countSpan.setText(this.#count)
    }
}
