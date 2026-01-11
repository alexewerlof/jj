import { fetchCss, fetchHtml, WC } from '../../../lib/bundle.js'

export class ChatThread extends WC {
    static jj = {
        name: 'chat-thread',
        template: () => fetchHtml(import.meta.resolve('./chat-thread.html')),
        styles: fetchCss(import.meta.resolve('./chat-thread.css')),
    }
}
