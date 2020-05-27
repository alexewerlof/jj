import { html, ready, frag, sel, css, runOnce, px, em } from '../jj.js'

const config = {
    color: {
        bg: '#eee',
        off: '#ddd',
        on: '#555',
    }
}

/*
   0
   --
6 |  | 1
   --  2
5 |  | 3
   --
   4
*/

const digits = [
    // 0
    [ 1, 1, 0, 1, 1, 1, 1 ],
    // 1
    [ 0, 1, 0, 1, 0, 0, 0 ],
    // 2
    [ 1, 1, 1, 0, 1, 1, 0],
    // 3
    [ 1, 1, 1, 1, 1, 0, 0],
    // 4
    [ 0, 1, 1, 1, 0, 0, 1],
    // 5
    [ 1, 0, 1, 1, 1, 0, 1],
    // 6
    [ 1, 0, 1, 1, 1, 1, 1],
    // 7
    [ 1, 1, 0, 1, 0, 0, 0],
    // 8
    [ 1, 1, 1, 1, 1, 1, 1],
    // 9
    [ 1, 1, 1, 1, 1, 0, 1],
]

const appStyleTag = css()

class SevSeg {
    constructor(vm) {
        runOnce(SevSeg.styles, appStyleTag)
        this.root = html.div()
            .class(SevSeg.cl.parent)
            .children(
                this.up = html.div().class(
                    SevSeg.cl.square,
                    SevSeg.cl.upperSquare,
                ),
                this.lo = html.div().class(
                    SevSeg.cl.square,
                    SevSeg.cl.lowerSquare,
                ),
            )
        this.update(vm)
    }

    static styles(st) {
        SevSeg.cl = {
            parent: sel(SevSeg.name),
            square: sel(SevSeg.name).E('sq'),
            upperSquare: sel(SevSeg.name).E('sq').M('up'),
            lowerSquare: sel(SevSeg.name).E('sq').M('lo'),
        }
        st.append({
            [sel().class(SevSeg.cl.parent)]: {
                display: 'inline-block',
                marginLeft: em(0.5)
            },
            [sel().class(SevSeg.cl.square)]: {
                borderWidth: px(4),
                borderStyle: 'solid',
                width: em(1),
                height: em(1),
                minHeight: em(1)
            },
            [sel().class(SevSeg.cl.upperSquare)]: {
                borderBottomWidth: px(2),
            },
            [sel().class(SevSeg.cl.lowerSquare)]: {
                borderTopWidth: px(2),
            }
        })
    }

    update(vm) {
        if (!Number.isFinite(vm) || vm < 0 || vm > 9) {
            throw new Error(`Bad vm: ${vm}`)
        }
        const [ upTop, upRight, upBottom, loRight, loBottom, loLeft, upLeft ] = digits[vm]
            .map(isOn => isOn ? config.color.on : config.color.off)
        this.up.style({
            borderTopColor: upTop,
            borderRightColor: upRight,
            borderLeftColor: upLeft,
            borderBottomColor: upBottom,
        })
        this.lo.style({
            borderTopColor: upBottom,
            borderRightColor: loRight,
            borderLeftColor: loLeft,
            borderBottomColor: loBottom,
        })
    }
}

function dots() {
    return html.div('.')
        .style({
            height: em(2),
            display: 'inline-block',
            marginLeft: em(0.5),
        })
}

class Clock {
    constructor(vm) {
        const state = toState(vm)
        this.root = frag().children(
            this.h1 = new SevSeg(state.h1),
            this.h2 = new SevSeg(state.h2),
            new dots(),
            this.m1 = new SevSeg(state.m1),
            this.m2 = new SevSeg(state.m2),
            new dots(),
            this.s1 = new SevSeg(state.s1),
            this.s2 = new SevSeg(state.s2),
        )
    }

    update(vm) {
        const state = toState(vm)
        this.h1.update(state.h1)
        this.h2.update(state.h2)
        this.m1.update(state.m1)
        this.m2.update(state.m2)
        this.s1.update(state.s1)
        this.s2.update(state.s2)
    }
}

const leftDigit = n => Math.floor(n / 10)
const rightDigit = n => n % 10
const toState = now => {
    return {
        h1: leftDigit(now.getHours()),
        h2: rightDigit(now.getHours()),
        m1: leftDigit(now.getMinutes()),
        m2: rightDigit(now.getMinutes()),
        s1: leftDigit(now.getSeconds()),
        s2: rightDigit(now.getSeconds()),
    }
}

ready(() => {
    appStyleTag.append({
        [sel().el('body')]: {
            backgroundColor: config.color.bg,
        }
    }).appendToHead()

    const clock1 = new Clock(new Date)
    const clock2 = new Clock(new Date)
    html(document.body).append(clock1, html.br(), clock2)

    setInterval(() => {
        clock1.update(new Date)
        clock2.update(new Date)
    }, 500)
})