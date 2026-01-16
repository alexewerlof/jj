import { fetchCss, fetchHtml, JJCC } from '../../../../lib/bundle.js'

const VALID_ROLES = ['user', 'system', 'assistant']

// Test comment
export class ChatMessage extends JJCC {
    /* longer comment
    in multiple lines*/
    static jj = {
        name: 'chat-message',
        template: fetchHtml(import.meta.resolve('./chat-message.html')),
        styles: fetchCss(import.meta.resolve('./chat-message.css')),
    }

    static observedAttributes = ['role', 'content']

    #role = VALID_ROLES[0]
    #content = ''

    get role() {
        return this.#role
    }

    set role(value) {
        if (!VALID_ROLES.includes(value)) {
            throw new Error(`Invalid role: ${value}`)
        }
        this.#role = value
        this.#renderRole()
    }

    #renderRole() {
        this.jjRoot?.shadow.byId('role').setText(this.role)
    }

    get content() {
        return this.#content
    }

    set content(value) {
        this.#content = value
        this.#renderContent()
    }

    #renderContent() {
        this.jjRoot?.shadow.byId('content').setHTML(this.contentHtml)
    }

    async connectedCallback() {
        await super.connectedCallback()
        this.#render()
        console.debug('ChatMessage connectedCallback', this)
    }

    #render() {
        this.#renderRole()
        this.#renderContent()
    }

    get contentHtml() {
        return `<p>${this.content}</p>`
    }
}
