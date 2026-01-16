import { fetchCss, fetchHtml, JJCC } from '../../../../lib/bundle.js'

export class ChatThread extends JJCC {
    static jj = {
        name: 'chat-thread',
        template: fetchHtml(import.meta.resolve('./chat-thread.html')),
        styles: fetchCss(import.meta.resolve('./chat-thread.css')),
    }
}
