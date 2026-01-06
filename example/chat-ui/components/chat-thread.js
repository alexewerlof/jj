import { StyleFile, TemplateFile, ensureComponent } from '../../../lib/bundle.js'

export class ChatThread extends HTMLElement {
    static template = new TemplateFile(import.meta.resolve('./chat-thread.html'))
    static styles = [
        new StyleFile(import.meta.resolve('./chat-thread.css')),
    ]
}

await ensureComponent('chat-thread', ChatThread)
