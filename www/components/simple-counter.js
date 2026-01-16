import { JJCC, fetchCss, fetchHtml } from "../../lib/bundle.js"

export class SimpleCounter extends JJCC {
    static jj = {
        name: 'simple-counter',
        template: fetchHtml(import.meta.resolve('./simple-counter.html')),
        styles: fetchCss(import.meta.resolve('./simple-counter.css')),
    }

    // State
    #count = 0

    async connectedCallback() {
        await super.connectedCallback()

        // Access elements inside Shadow DOM via this.jjRoot
        this.countSpan = this.jjRoot.shadow.byId('count')
        this.incBtn = this.jjRoot.shadow.byId('inc').onClick(() => this.#update(1))
        this.decBtn = this.jjRoot.shadow.byId('dec').onClick(() => this.#update(-1))
    }

    #update(delta) {
        this.#count += delta
        this.jjRoot.shadow.byId('count').setText(this.#count)
    }
}
