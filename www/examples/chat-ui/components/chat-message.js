import { attr2prop, fetchStyle, fetchTemplate, JJHE, defineComponent } from '../../../../lib/bundle.js'

const VALID_ROLES = ['user', 'system', 'assistant']

const templatePromise = fetchTemplate(import.meta.resolve('./chat-message.html'))
const stylePromise = fetchStyle(import.meta.resolve('./chat-message.css'))

export class ChatMessage extends HTMLElement {
    static observedAttributes = ['role', 'content']
    static defined = defineComponent('chat-message', ChatMessage)

    #jjHost
    #jjShadow
    #isInitialized = false
    #role = VALID_ROLES[0]
    #content = ''

    constructor() {
        super()
        this.#jjHost = JJHE.from(this).setShadow('open')
        this.#jjShadow = this.#jjHost.getShadow(true)
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
        if (!this.#isInitialized) return
        this.#jjShadow.find('#role', true).setText(this.role)
    }

    get content() {
        return this.#content
    }

    set content(value) {
        this.#content = value ?? ''
        this.#renderContent()
    }

    #renderContent() {
        if (!this.#isInitialized) return
        this.#jjShadow.find('#content', true).setText(this.content)
    }

    async connectedCallback() {
        if (!this.#isInitialized) {
            this.#jjShadow.init(await templatePromise, await stylePromise)
            this.#isInitialized = true
        }
        this.#render()
    }

    #render() {
        this.#renderRole()
        this.#renderContent()
    }
}
