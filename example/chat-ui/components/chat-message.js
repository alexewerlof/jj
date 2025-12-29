import { ComponentFiles, ensureComponent, keb2cam, StyleFile, TemplateFile } from '../../../lib/bundle.js'

const shadowMaster = new ComponentFiles(
    new TemplateFile(import.meta.resolve('./chat-message.html')),
    new StyleFile(import.meta.resolve('./chat-message.css')),
)

const VALID_ROLES = ['user', 'system', 'assistant']

export class ChatMessage extends HTMLElement {
    #role = VALID_ROLES[0]
    #content = ''
    #shadow = null

    constructor(r) {
        super()
    }

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
        // Welem.from(this).setShadow('open', ...await ChatMessage.#files.getTemplateAndSheet())
        this.#shadow = await shadowMaster.initShadow(this, 'open')
        this.#render()
        console.debug('ChatMessage connectedCallback', this)
    }

    disconnectedCallback() {
        // Called when removed from the DOM. Good for cleanup.
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
