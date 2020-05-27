import { html } from '../jj.js';

export function render(placeHolder, n) {
    return placeHolder.setChildren(
        html('article').style({ color: 'red' }).text('This content is coming from page2.js').child(
            html('hr'),
            html('span').text(`n = ${n}`)
        )
    )
}