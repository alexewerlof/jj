import { attr2prop, fetchStyle, fetchTemplate, JJHE, defineComponent } from '../../../../lib/bundle.js'

const VALID_ROLES = ['user', 'system', 'assistant']

const templatePromise = fetchTemplate(import.meta.resolve('./chat-message.html'))
const stylePromise = fetchStyle(import.meta.resolve('./chat-message.css'))

export class ChatMessage extends HTMLElement {
    static observedAttributes = ['role', 'content']
    static defined = defineComponent('chat-message', ChatMessage)

    #root
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
        this.#root?.shadow.find('#role').setText(this.role)
    }

    get content() {
        return this.#content
    }

    set content(value) {
        this.#content = value ?? ''
        this.#renderContent()
    }

    #renderContent() {
        this.#root?.shadow.find('#content').setText(this.content)
    }

    async connectedCallback() {
        this.#root = JJHE.from(this).setShadow('open', await templatePromise, await stylePromise)
        this.#render()
    }

    #render() {
        this.#renderRole()
        this.#renderContent()
    }
}
