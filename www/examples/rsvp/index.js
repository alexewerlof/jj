import { RSVPEngine } from './RSVPEngine.js'
import { JJD } from '../../../lib/bundle.js'

const jjDoc = JJD.from(document)

const jjInputTextArea = jjDoc.find('#input-text', true)
const jjLeftSpan = jjDoc.find('#left-side', true)
const jjPivotSpan = jjDoc.find('#pivot-char', true)
const jjRightSpan = jjDoc.find('#right-side', true)
const jjRenderProgress = jjDoc.find('#render-progress', true)
const jjStartButton = jjDoc.find('#start-button', true).on('click', () => {
    startRendering()
    jjStartButton.setAttr('hidden', '')
    jjStopButton.rmAttr('hidden').ref.focus()
})

const jjStopButton = jjDoc.find('#stop-button', true).on('click', () => {
    if (currentAbortController) {
        currentAbortController.abort()
        currentAbortController = null
    }
    jjStopButton.setAttr('hidden', '')
    jjStartButton.rmAttr('hidden').ref.focus()
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
jjInputTextArea.setText(defaultText.replaceAll('\n', ' '))

jjInputTextArea.on('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault()
        jjStopButton.click() // Stop any ongoing rendering
        jjStartButton.click() // Start new rendering
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
        const queue = engine.processText(jjInputTextArea.getValue())
        jjRenderProgress.setAttrs({
            min: 0,
            max: queue.length,
            value: 0,
        })

        console.log(queue)
        for (let i = 0; i < queue.length; i++) {
            if (controller.signal.aborted) {
                break
            }
            jjRenderProgress.setValue(i + 1)
            const item = queue[i]
            const { leftPart, pivotChar, rightPart, delay } = item
            jjLeftSpan.setText(leftPart)
            jjPivotSpan.setText(pivotChar)
            jjRightSpan.setText(rightPart)
            await sleep(delay)
        }
    } catch (error) {
        console.error('Error during rendering:', error)
    }
}
