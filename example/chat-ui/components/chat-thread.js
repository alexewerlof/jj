import { ensureComponent, WC } from '../../../lib/bundle.js'

export class ChatThread extends WC {
    static {
        this.setTemplateFile(import.meta.resolve('./chat-thread.html'))
        this.addStyleFile(import.meta.resolve('./chat-thread.css'))
    }
}

await ensureComponent('chat-thread', ChatThread)
