import { sel, css, px } from '../jj.js'

const config = {
    bg: '#715331',
    fg: '#fff2c9',
    separators: '#bc946e',
}

export const appStyles = css(
    sel().el('body').css({
        backgroundColor: config.bg,
        color: config.fg,
    }),
    sel().el('code').css({
        backgroundColor: config.fg,
        color: config.bg,
    }),
    sel().el('table').css({
        borderRadius: px(3),
        border: [px(1), 'solid', config.fg],
    }),
    sel().el('td').css({
        border: [px(1), 'solid', config.separators],
    })
)