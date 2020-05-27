import { sel, css, px, perc, em } from '../jj.js'

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`
const inherit = 'inherit'
const none = 'none'

export const appStyles = css({
    body: {
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        backgroundColor: '#f5f5f5',
        color: '#4d4d4d',
        textAlign: 'center',
    },
    h1: {
        color: rgba(175, 47, 47, 0.15),
        fontSize: px(100),
    },
    button: {
        color: inherit,
        margin: px(3),
        padding: [px(3), px(7)],
        textDecoration: none,
        border: [px(1), 'solid', rgba(175, 47, 47, 0.2)],
        borderRadius: px(3),
        backgroundColor: 'transparent'
    },
    [sel().B('Todo')] :{
        fontSize: px(24),
        backgroundColor: '#fff',
        margin: [px(40), 0],
        position: 'relative',
        boxShadow: [
            0, px(2), px(4), 0, rgba(0, 0, 0, 0.2),
            ',',
            0, px(25), px(50), 0, rgba(0, 0, 0, 0.1),
        ],
        [sel('&')._.el('li')]: {
            textAlign: 'left',
            listStyleType: none,
        },
        [sel('&').E('new')]: {
            fontSize: inherit,
            padding: [px(16), px(16), px(16), px(60)],
            border: none,
            background: rgba(0, 0, 0, 0.003),
            boxShadow: ['inset', 0, px(-2), px(1), rgba(0,0,0,0.03)],
            position: 'relative',
            margin: 0,
            width: perc(100),
            fontFamily: inherit,
            fontWeight: inherit,
            lineHeight: em(1.4),
        },
        [sel('&')._.el('button').class('selected')]: {
            borderBottomWidth: px(3),
        }
    },
    [sel().class('done')]: {
        color: '#d9d9d9',
        textDecoration: 'line-through',
    }
})
