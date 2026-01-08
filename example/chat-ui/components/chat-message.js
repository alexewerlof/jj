import { WC, ensureComponent, WHE } from '../../../lib/bundle.js'

const VALID_ROLES = ['user', 'system', 'assistant']

export class ChatMessage extends WC {
    static {
        this.setTemplateFile(import.meta.resolve('./chat-message.html'))
        this.addStyleFile(import.meta.resolve('./chat-message.css'))
    }
    static observedAttributes = ['role', 'content']

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
        this.#renderRole()
    }
    
    #renderRole() {
        this.#shadow?.byId('role').setText(this.role)
    }

    get content() {
        return this.#content
    }

    set content(value) {
        this.#content = value
        this.#renderContent()
    }
    
    #renderContent() {
        this.#shadow?.byId('content').setHtml(this.contentHtml)
    }

    async connectedCallback() {
        await super.connectedCallback()
        this.#shadow = WHE.from(this).getShadow()
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

await ensureComponent('chat-message', ChatMessage)
