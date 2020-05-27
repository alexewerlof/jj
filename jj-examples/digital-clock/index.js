import { rnd, ready, html, css, sel } from '../jj.js'

const CLOCK_CLASS = rnd('clock-face')

function leftpad2(n) {
    return n < 10 ? `0${n}` : String(n)
}

function leftpad3(n) {
    if (n < 10) {
        return `00${n}`
    }
    return n < 100 ? `0${n}` : String(n)
}

html('link').href('https://fonts.googleapis.com/css?family=VT323&display=swap').rel('stylesheet').appendToHead()

const appStyles = css(
    sel().el('body').css({
        backgroundColor: '#80A0B7',
    }),
    sel().class(CLOCK_CLASS).css({
        fontFamily: "'VT323', monospace",
        backgroundColor: '#80A0B7',
        color: '#3C404F',
        fontSize: '50px',
        padding: '0.4em',
        borderRadius: '0.2em',
        border: '0.1em solid #3C404F',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '12ex',
        textAlign: 'center',
    })
)

ready(() => {
    appStyles.appendToHead()
    html('pre').class(CLOCK_CLASS).children(
        html('span').text('H').animFrame(t => {
            t.clear().text(leftpad2((new Date).getHours()))
        }),
        ':',
        html('span').text('M').animFrame(t => {
            t.clear().text(leftpad2((new Date).getMinutes()))
        }),
        ':',
        html('span').text('S').animFrame(t => {
            t.clear().text(leftpad2((new Date).getSeconds()))
        }),
        '.',
        html('span').css(appStyles, {
            fontSize: '0.8em'
        }).text('MS').animFrame(t => {
            t.clear().text(leftpad3((new Date).getMilliseconds()))
        }),
    ).appendToBody()
})