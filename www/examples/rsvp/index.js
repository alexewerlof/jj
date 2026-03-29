import { RSVPEngine } from './RSVPEngine.js'
import { JJD, sleep } from '../../../lib/bundle.js'

const doc = JJD.from(document)

const inputTextArea = doc.find('#input-text')
const leftSpan = doc.find('#left-side')
const pivotSpan = doc.find('#pivot-char')
const rightSpan = doc.find('#right-side')
const renderProgress = doc.find('#render-progress')

async function fetchText(filePath) {
    try {
        const response = await fetch(filePath)
        if (!response.ok) {
            return `Error loading ${filePath}: ${response.status} ${response.statusText}`
        }
        return await response.text()
    } catch (cause) {
        throw new Error(`Fetch ${filePath} failed`, { cause })
    }
}

const defaultText = await fetchText('./default.txt')
inputTextArea.setText(defaultText.replaceAll('\n', ' '))

inputTextArea.on('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault()
        startRendering(new AbortController())
    }
})

async function startRendering(abortController) {
    const engine = new RSVPEngine(300) // 300 WPM
    const queue = engine.processText(inputTextArea.getValue())
    renderProgress.setAttrs({
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
