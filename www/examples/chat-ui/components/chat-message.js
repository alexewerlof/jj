import { attr2prop, fetchCss, fetchHtml, JJHE, registerComponent, ShadowMaster } from '../../../../lib/bundle.js'

const VALID_ROLES = ['user', 'system', 'assistant']

const sm = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./chat-message.html')))
    .addStyles(fetchCss(import.meta.resolve('./chat-message.css')))

// Test comment
export class ChatMessage extends HTMLElement {
    static observedAttributes = ['role', 'content']

    static register() {
        registerComponent('chat-message', ChatMessage)
    }

    #role = VALID_ROLES[0]
    #content = ''

    constructor() {
        super()
        this.#role = VALID_ROLES[0]
        this.#content = ''
    }

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

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
        this.jjRoot = JJHE.from(this).initShadow('open', await sm.getResolved())
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
