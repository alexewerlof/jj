import { StyleFile, TemplateFile, ComponentFiles, ensureComponent } from '../../../lib/bundle.js'

const files = new ComponentFiles(
    new TemplateFile(import.meta.resolve('./chat-thread.html')),
    new StyleFile(import.meta.resolve('./chat-thread.css')),
)

export class ChatThread extends HTMLElement{
    #shadow = null

    constructor() {
        super()
    }

    async connectedCallback() {
        // Welem.from(this).setShadow('open', ...await ChatMessage.#files.getTemplateAndSheet())
        this.#shadow = await files.initShadow(this, 'open')
    }
}

await ensureComponent('chat-thread', ChatThread)