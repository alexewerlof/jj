import { fetchTemplate, fetchStyle, defineComponent, JJHE } from '../../lib/bundle.js'

const templatePromise = fetchTemplate(import.meta.resolve('./simple-counter.html'))
const stylePromise = fetchStyle(import.meta.resolve('./simple-counter.css'))

export class SimpleCounter extends HTMLElement {
    static defined = defineComponent('simple-counter', SimpleCounter)
    static observedAttributes = ['count']

    #jjHost
    #jjShadow = null
    #isInitialized = false
    // State
    #count = 0

    get count() {
        return this.#count
    }

    set count(value) {
        const oldCount = this.#count
        if (typeof value === 'string') {
            value = parseInt(value, 10)
        }
        if (typeof value !== 'number' || isNaN(value)) {
            throw new TypeError('Count must be a number or numeric string')
        }
        if (value !== oldCount) {
            this.#count = value
            console.log(`Count changed from ${oldCount} to ${value}`)
            this.render()
            this.#jjHost.triggerCustomEvent('count-changed', { detail: { oldCount, newCount: value } })
        }
    }

    #update(delta) {
        if (typeof delta !== 'number' || isNaN(delta)) {
            throw new TypeError('Delta must be a number')
        }
        this.count += delta
        this.render()
    }

    constructor() {
        super()
        this.#jjHost = JJHE.from(this).setShadow('open')
        this.#jjShadow = this.#jjHost.getShadow(true)
    }

    async connectedCallback() {
        if (!this.#isInitialized) {
            this.#jjShadow.init(await templatePromise, await stylePromise)
            // Attach event listeners to buttons
            this.#jjShadow.find('#inc', true).on('click', () => this.#update(1))
            this.#jjShadow.find('#dec', true).on('click', () => this.#update(-1))
            this.#isInitialized = true
        }
        this.render()
    }

    render() {
        if (!this.#isInitialized) return
        // Access elements inside Shadow DOM via this.#jjShadow
        this.#jjShadow.find('#count', true).setText(String(this.#count))
    }
}
