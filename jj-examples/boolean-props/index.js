import { ready, html, css, sel } from '../jj.js'

css({
    [sel().el('input').attr('required')]: {
        color: 'red',
        [sel('&').pEl('before')]: {
            content: '"*"'
        }
    }
}).appendToHead()

const inputElement = html('input').type('text').setAttrs({
    readonly: true,
    required: true
}).val('Progammatically created')

ready(() => {
    inputElement.appendToBody()
    console.log(inputElement.el.readOnly)
})