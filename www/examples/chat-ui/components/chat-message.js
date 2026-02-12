import { attr2prop, fetchCss, fetchHtml, JJHE, registerComponent, ShadowMaster } from '../../../../lib/bundle.js'

const VALID_ROLES = ['user', 'system', 'assistant']

const sm = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./chat-message.html')))
    .addStyles(fetchCss(import.meta.resolve('./chat-message.css')))

export class ChatMessage extends HTMLElement {
    static observedAttributes = ['role', 'content']

    static register() {
        return registerComponent('chat-message', ChatMessage)
    }

    #jjThis
    #role = VALID_ROLES[0]
    #content = ''

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
        this.#jjThis?.shadow.find('#role').setText(this.role)
    }

    get content() {
        return this.#content
    }

    set content(value) {
        this.#content = value ?? ''
        this.#renderContent()
    }

    #renderContent() {
        this.#jjThis?.shadow.find('#content').setText(this.content)
    }

    async connectedCallback() {
        this.#jjThis = JJHE.from(this).initShadow('open', await sm.getResolved())
        this.#render()
    }

    #render() {
        this.#renderRole()
        this.#renderContent()
    }
}
