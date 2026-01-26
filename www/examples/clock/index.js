import doc, { JJDF, JJSE } from '../../../lib/bundle.js'

const clock = doc.byId('clock')
const secondHand = doc.byId('second-hand')
const minuteHand = doc.byId('minute-hand')
const hourHand = doc.byId('hour-hand')

function createMinuteIndicators() {
    const frag = JJDF.create()

    for (let i = 0; i < 60; i++) {
        const line = JJSE.fromTag('line')
        line.addClass('minute-indicator')
        const fifth = i % 5 === 0

        if (fifth) {
            line.addClass('minute-indicator--major')
        }

        line.setAttrs({
            x1: 50,
            y1: 5,
            x2: 50,
            y2: fifth ? 14 : 7.8,
            transform: `rotate(${i * 6} 50 50)`,
        })

        frag.append(line)
    }

    return frag
}

function updateClock() {
    const now = new Date()
    const seconds = now.getSeconds()
    const minutes = now.getMinutes()
    const hours = now.getHours()

    secondHand.setAttr('transform', `rotate(${seconds * 6} 50 50)`)
    minuteHand.setAttr('transform', `rotate(${minutes * 6 + seconds * 0.1} 50 50)`)
    hourHand.setAttr('transform', `rotate(${hours * 30 + minutes * 0.5} 50 50)`)

    requestAnimationFrame(updateClock)
}

doc.byId('minute-indicators').append(createMinuteIndicators())
updateClock()
clock.show()
