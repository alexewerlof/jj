import { fetchCss, fetchHtml, JJHE, registerComponent, ShadowMaster } from '../../../../lib/bundle.js'

const sm = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./chat-thread.html')))
    .addStyles(fetchCss(import.meta.resolve('./chat-thread.css')))

export class ChatThread extends HTMLElement {
    static register() {
        registerComponent('chat-thread', ChatThread)
    }

    async connectedCallback() {
        JJHE.from(this).initShadow('open', await sm.getResolved())
    }
}
