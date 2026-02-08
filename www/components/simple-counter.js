import { fetchCss, fetchHtml, JJHE, registerComponent, ShadowMaster } from '../../lib/bundle.js'

const sm = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./simple-counter.html')))
    .addStyles(fetchCss(import.meta.resolve('./simple-counter.css')))

export class SimpleCounter extends HTMLElement {
    static register() {
        registerComponent('simple-counter', SimpleCounter)
    }

    // State
    #count = 0

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    async connectedCallback() {
        this.jjRoot = JJHE.from(this).initShadow('open', await sm.getResolved())

        // Access elements inside Shadow DOM via this.jjRoot
        this.countSpan = this.jjRoot.shadow.find('#count')
        this.incBtn = this.jjRoot.shadow.find('#inc').on('click', () => this.#update(1))
        this.decBtn = this.jjRoot.shadow.find('#dec').on('click', () => this.#update(-1))
    }

    #update(delta) {
        this.#count += delta
        this.jjRoot.shadow.find('#count').setText(this.#count)
    }
}
