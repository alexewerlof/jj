import { WDF, WSE } from '../../lib/bundle.js'

const clock = WSE.byId('clock')
const secondHand = WSE.byId('second-hand')
const minuteHand = WSE.byId('minute-hand')
const hourHand = WSE.byId('hour-hand')

function createMinuteIndicators() {
    const frag = WDF.new()

    for (let i = 0; i < 60; i++) {
      const line = WSE.fromTag('line')
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
        transform: `rotate(${i * 6} 50 50)`
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

WSE.byId('minute-indicators').append(createMinuteIndicators())
updateClock()
clock.show()