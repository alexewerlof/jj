import { defineComponent, fetchTemplate, JJHE } from '../../lib/bundle.js'

const templatePromise = fetchTemplate(import.meta.resolve('./tutorial-steps.html'))

export class TutorialSteps extends HTMLElement {
    static defined = defineComponent('tutorial-steps', TutorialSteps)

    #host
    #jjPrevBtn = null
    #jjNextBtn = null
    #steps = []
    #step = 0
    #isInitialized = false

    constructor() {
        super()
        this.#host = JJHE.from(this).setStyle('display', 'block')
    }

    async connectedCallback() {
        if (!this.#isInitialized) {
            this.#host.setTemplate(await templatePromise)
            this.#jjPrevBtn = this.#host.find('button#tutorial-step-prev', true).on('click', () => this.prev())
            this.#jjNextBtn = this.#host.find('button#tutorial-step-next', true).on('click', () => this.next())
            this.#isInitialized = true
        }
        this.#render()
    }

    get steps() {
        return [...this.#steps]
    }

    set steps(value) {
        if (!Array.isArray(value) || value.length === 0) {
            throw new TypeError(
                `Expected steps to be a non-empty array. Got ${JSON.stringify(value)} (${typeof value})`,
            )
        }
        if (value.some((step) => typeof step !== 'string' || step.length === 0)) {
            throw new TypeError(`Expected every step to be a non-empty string. Got ${JSON.stringify(value)}`)
        }
        this.#steps = [...value]
        const maxStep = this.#steps.length - 1
        if (this.#step > maxStep) {
            this.#step = maxStep
        }
        this.#render()
    }

    get step() {
        return this.#step
    }

    set step(value) {
        if (!Number.isInteger(value)) {
            throw new TypeError(`Expected step to be an integer, got ${value} (${typeof value})`)
        }
        if (this.#steps.length === 0) {
            throw new Error('Steps are not initialized. Set tutorialSteps.steps before changing step.')
        }

        const maxStep = this.#steps.length - 1
        const nextStep = Math.min(Math.max(value, 0), maxStep)
        const changed = nextStep !== this.#step

        this.#step = nextStep
        this.#render()

        if (changed) {
            this.#host.triggerCustomEvent('change', { step: this.#step, title: this.title })
        }
    }

    get title() {
        return this.#steps[this.#step] ?? ''
    }

    prev() {
        this.step = this.#step - 1
    }

    next() {
        this.step = this.#step + 1
    }

    #render() {
        if (!this.#isInitialized) {
            return
        }

        this.#host.find('h2#tutorial-step-title', true).setText(this.title || 'Tutorial')
        const maxStep = Math.max(this.#steps.length - 1, 0)
        this.#host.find('progress#tutorial-step-progress', true).setAttrs({ max: maxStep, value: this.#step })

        this.#jjPrevBtn.swAttr('disabled', this.#step <= 0)
        this.#jjNextBtn.swAttr('disabled', this.#step >= maxStep)
    }
}
