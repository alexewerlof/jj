import { isArrIdx, isInt } from 'jty'
import { JJD, JJET } from '../../lib/bundle.js'
import { RenderMarkdown } from '../components/render-markdown.js'

const doc = JJD.from(document)
const content = doc.find('#content', true)

const steps = [
    'Intro',
    'Wrappers',
    'DOM Creation',
    'DOM Manipulation',
    'Handling Events',
    'State Management',
    'Components',
    'Templates',
    'Styles',
    'Next Steps',
]
let currentStep = parseInt(new URLSearchParams(window.location.search).get('step') ?? '0', 10)

function clampStep(num) {
    if (!isInt(num, steps)) {
        throw new RangeError(`Expected step to be an index of steps array, got ${num} (${typeof num})`)
    }
    if (num < 0) {
        return 0
    } else if (num >= steps.length) {
        return steps.length - 1
    } else {
        return num
    }
}

async function loadStep(step) {
    if (!isArrIdx(step, steps)) {
        throw new RangeError(`Expected step to be an index of steps array, got ${step} (${typeof step})`)
    }
    const fileName = steps[step].toLowerCase().replace(/\s+/g, '-') + '.md'
    const url = new URL(fileName, window.location.href)
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }
    content.ref.content = await response.text()
}

async function changeStep(delta) {
    try {
        const newStep = clampStep(currentStep + delta)
        if (newStep !== currentStep) {
            currentStep = newStep
            window.history.pushState(null, '', setStepNumInUrl(window.location.href, newStep))
            await loadStep(currentStep)
        }
    } catch (cause) {
        throw new Error(`Error changing step`, { cause })
    }
}

doc.find('#prev-btn', true).on('click', async () => {
    changeStep(-1)
})
doc.find('#next-btn', true).on('click', async () => {
    changeStep(1)
})

function getStepNumFromUrl(urlStr) {
    const u = new URL(urlStr)
    const stepStr = u.searchParams.get('step')
    return stepStr !== null ? parseInt(stepStr, 10) : 0
}

function setStepNumInUrl(urlStr, step) {
    const u = new URL(urlStr)
    u.searchParams.set('step', step)
    return u.toString()
}

JJET.from(window).on('popstate', async () => {
    try {
        const step = getStepNumFromUrl(window.location.href)
        await loadStep(step)
    } catch (cause) {
        throw new Error(`Error loading step from URL`, { cause })
    }
})

async function main() {
    await RenderMarkdown.defined
    await loadStep(currentStep)
}

main().catch((err) => {
    console.error(err)
    content.ref.content = `Error loading step: ${err.message}`
})
