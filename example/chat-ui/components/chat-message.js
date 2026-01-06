import { WC, ensureComponent, keb2cam, StyleFile, TemplateFile, WHE } from '../../../lib/bundle.js'

const VALID_ROLES = ['user', 'system', 'assistant']

export class ChatMessage extends WC {
    static template = new TemplateFile(import.meta.resolve('./chat-message.html'))
    static styles = [new StyleFile(import.meta.resolve('./chat-message.css'))]

    #role = VALID_ROLES[0]
    #content = ''
    #shadow

    get role() {
        return this.#role
    }

    set role(value) {
        if (!VALID_ROLES.includes(value)) {
            throw new Error(`Invalid role: ${value}`)
        }
        this.#role = value
        this.#render()
    }

    get content() {
        return this.#content
    }

    set content(value) {
        this.#content = value
        this.#render()
    }

    async connectedCallback() {
        await super.connectedCallback()
        this.#shadow = WHE.from(this).getShadow()
        this.#render()
        console.debug('ChatMessage connectedCallback', this)
    }

    static get observedAttributes() {
        return ['role', 'content']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Called when observed attributes change.
        if (oldValue !== newValue) {
            this[keb2cam(name)] = newValue
            this.#render()
        }
    }

    #render() {
        console.log('rendering')
        if (!this.#shadow) return
        // Safe to update the shadow DOM here
        this.#shadow.byId('role').setText(this.role)
        this.#shadow.byId('content').setHtml(this.contentHtml)
    }

    get contentHtml() {
        return `<p>${this.content}</p>`
    }
}

await ensureComponent('chat-message', ChatMessage)
