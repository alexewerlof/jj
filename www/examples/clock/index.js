import { JJD, JJDF, JJSE } from '../../../lib/bundle.js'

const jjDoc = JJD.from(document)

const jjClock = jjDoc.find('#clock')
const jjSecondHand = jjDoc.find('#second-hand')
const jjMinuteHand = jjDoc.find('#minute-hand')
const jjHourHand = jjDoc.find('#hour-hand')

function createMinuteIndicators() {
    const jjFrag = JJDF.create()

    for (let i = 0; i < 60; i++) {
        const jjLine = JJSE.create('line')
        jjLine.addClass('minute-indicator')
        const fifth = i % 5 === 0

        if (fifth) {
            jjLine.addClass('minute-indicator--major')
        }

        jjLine.setAttrs({
            x1: 50,
            y1: 5,
            x2: 50,
            y2: fifth ? 14 : 7.8,
            transform: `rotate(${i * 6} 50 50)`,
        })

        jjFrag.addChild(jjLine)
    }

    return jjFrag
}

function updateClock() {
    const now = new Date()
    const seconds = now.getSeconds()
    const minutes = now.getMinutes()
    const hours = now.getHours()

    jjSecondHand.setAttr('transform', `rotate(${seconds * 6} 50 50)`)
    jjMinuteHand.setAttr('transform', `rotate(${minutes * 6 + seconds * 0.1} 50 50)`)
    jjHourHand.setAttr('transform', `rotate(${hours * 30 + minutes * 0.5} 50 50)`)

    requestAnimationFrame(updateClock)
}

jjDoc.find('#minute-indicators').addChild(createMinuteIndicators())
updateClock()
jjClock.show()
