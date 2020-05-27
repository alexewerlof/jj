import { frag, html, svg, ready, query, rnd, css, sel, vh, vw } from '../jj.js'
import { Motor } from './Motor.js'

const color1 = 'orange'
const color2 = 'white'
const color3 = '#f5f4f3'
const color4 = '#cb4141'

function roundSteps(val, steps) {
    return Math.ceil(val * steps) / steps
}

function start(secondHand, minuteHand, hourHand) {
    const motor = new Motor(() => {
        const now = new Date
        const sec = now.getSeconds() + now.getMilliseconds() / 1000
        const min = now.getMinutes() + sec / 60
        const hr = now.getHours() + min / 60
        secondHand.setAttr('transform', `rotate(${sec * 6} 50 50)`)
        minuteHand.setAttr('transform', `rotate(${roundSteps(min, 12) * 6} 50 50)`)
        hourHand.setAttr('transform', `rotate(${roundSteps(hr, 12) * 30} 50 50)`)
        document.title = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    })

    motor.start()
}

const clockSvg = clock()

ready(() => {
    frag().children(
        html('meta').name('Description').content('This is just a dummy meta'),
        html('meta').name('theme-color').content(color1),
    ).appendTo(document.head)

    const bodyClass = rnd('c')

    const bgStyle = {
        willChange: 'background-color',
        transition: 'background-color 300ms',
        backgroundColor: color1
    }
    const styles = css({ [sel().class(bodyClass)]: bgStyle }).appendToHead()

    setInterval(() => {
        const r = Math.trunc(Math.random() * 255)
        const g = Math.trunc(Math.random() * 255)
        const b = Math.trunc(Math.random() * 255)
        bgStyle.backgroundColor = `rgb(${r}, ${g}, ${b})`
        styles.update()
    }, 1000)

    html(document.body).classList.add(bodyClass)

    clockSvg.mount(query('#app'))
    start(
        clockSvg.query('#second-hand'),
        clockSvg.query('#minute-hand'),
        clockSvg.query('#hour-hand'),
    )
})

function clock() {
    return svg('svg')
        .setAttrs({
            viewBox: '0 0 100 100',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink'
        })
        .style({
            maxHeight: vh(100),
            maxWidth: vw(100),
        })
        .append(
            svg('circle')
                .setAttrs({
                    cx: 50,
                    cy: 50,
                    r: 45,
                    stroke: color1,
                    strokeWidth: 1,
                    fill: color3
                }),
            svg('g')
                .comment('The 1 indicators')
                .range(0, 60, 1, (gTag, i) => {
                    if (i % 5 === 0) {
                        return
                    }
                    gTag.append(
                        svg('line').setAttrs({
                            x1: 50,
                            y1: 10,
                            x2: 50,
                            y2: 6,
                            transform: `rotate(${i * 6} 50 50)`
                        }).style({
                            stroke: color1,
                            strokeWidth: 1,
                        })
                    )
                }),
            svg('g')
                .comment('The 5 indicators')
                .range(0, 60, 5, (gTag, i) => {
                    gTag.append(
                        svg('line').setAttrs({
                            x1: 50,
                            y1: 15,
                            x2: 50,
                            y2: 6,
                            transform: `rotate(${i * 6} 50 50)`
                        }).style({
                            stroke: color1,
                            strokeWidth: 2,
                        })
                    )
                }),
            svg('g')
                .comment('Hour')
                .append(
                    svg('line').id('hour-hand').setAttrs({
                        x1: 50,
                        y1: 60,
                        x2: 50,
                        y2: 20,
                    }).style({
                        willChange: 'transform',
                        stroke: color1,
                        strokeWidth: 5,
                    })
                ),
            svg('g')
                .comment('Minute')
                .append(
                    svg('line').id('minute-hand').setAttrs({
                        x1: 50,
                        y1: 60,
                        x2: 50,
                        y2: 10,
                    }).style({
                        willChange: 'transform',
                        stroke: color1,
                        strokeWidth: 3.5,
                    })
                ),
            svg('g')
                .comment('Second')
                .append(
                    svg('line').id('second-hand').setAttrs({
                        x1: 50,
                        y1: 70,
                        x2: 50,
                        y2: 10,
                    }).style({
                        willChange: 'transform',
                        stroke: color4,
                        strokeWidth: 1,
                    }),
                    svg('circle').setAttrs({
                        cx: 50,
                        cy: 50,
                        r: 3,
                        fill: color4
                    })
                ),
        )
}