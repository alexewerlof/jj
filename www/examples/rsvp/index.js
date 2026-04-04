import { RSVPEngine } from './RSVPEngine.js'
import { JJD } from '../../../lib/bundle.js'

const doc = JJD.from(document)

const inputTextArea = doc.find('#input-text', true)
const leftSpan = doc.find('#left-side', true)
const pivotSpan = doc.find('#pivot-char', true)
const rightSpan = doc.find('#right-side', true)
const renderProgress = doc.find('#render-progress', true)
const startButton = doc.find('#start-button', true).on('click', () => {
    startRendering()
    startButton.setAttr('hidden', '')
    stopButton.rmAttr('hidden').ref.focus()
})

const stopButton = doc.find('#stop-button', true).on('click', () => {
    if (currentAbortController) {
        currentAbortController.abort()
        currentAbortController = null
    }
    stopButton.setAttr('hidden', '')
    startButton.rmAttr('hidden').ref.focus()
})

let currentAbortController = null

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
        stopButton.click() // Stop any ongoing rendering
        startButton.click() // Start new rendering
    }
})

function sleep(ms = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function startRendering() {
    try {
        currentAbortController?.abort()
        const controller = new AbortController()
        currentAbortController = controller
        const engine = new RSVPEngine(300) // 300 WPM
        const queue = engine.processText(inputTextArea.getValue())
        renderProgress.setAttrs({
            min: 0,
            max: queue.length,
            value: 0,
        })

        console.log(queue)
        for (let i = 0; i < queue.length; i++) {
            if (controller.signal.aborted) {
                break
            }
            renderProgress.setValue(i + 1)
            const item = queue[i]
            const { leftPart, pivotChar, rightPart, delay } = item
            leftSpan.setText(leftPart)
            pivotSpan.setText(pivotChar)
            rightSpan.setText(rightPart)
            await sleep(delay)
        }
    } catch (error) {
        console.error('Error during rendering:', error)
    }
}
