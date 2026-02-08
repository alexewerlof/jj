import { RSVPEngine } from './RSVPEngine.js'
import { doc, sleep, fetchText } from '../../../lib/bundle.js'

const inputTextArea = doc.find('#input-text')
const leftSpan = doc.find('#left-side')
const pivotSpan = doc.find('#pivot-char')
const rightSpan = doc.find('#right-side')
const renderProgress = doc.find('#render-progress')

inputTextArea.run(async function () {
    const defaultText = await fetchText('./default.txt')
    this.setText(defaultText.replaceAll('\n', ' '))
})

inputTextArea.on('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault()
        startRendering(new AbortController())
    }
})

async function startRendering(abortController) {
    const engine = new RSVPEngine(300) // 300 WPM
    const queue = engine.processText(inputTextArea.getValue())
    renderProgress.setAttr({
        min: 0,
        max: queue.length,
        value: 0,
    })

    console.log(queue)
    for (let i = 0; i < queue.length; i++) {
        renderProgress.setValue(i + 1)
        const item = queue[i]
        const { leftPart, pivotChar, rightPart, delay } = item
        leftSpan.setText(leftPart)
        pivotSpan.setText(pivotChar)
        rightSpan.setText(rightPart)
        if (abortController.signal.aborted) {
            break
        }
        await sleep(delay)
    }
}
