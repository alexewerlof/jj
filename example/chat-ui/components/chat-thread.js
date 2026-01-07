import { ensureComponent, WC } from '../../../lib/bundle.js'

export class ChatThread extends WC {
    static {
        this.setTemplate(import.meta.resolve('./chat-thread.html'))
        this.addStyle(import.meta.resolve('./chat-thread.css'))
    }
}

await ensureComponent('chat-thread', ChatThread)
