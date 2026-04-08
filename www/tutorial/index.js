import { isInt } from 'jty'
import { JJD, JJET } from '../../lib/bundle.js'
import { RenderMarkdown } from '../components/render-markdown.js'

const steps = [
    'Intro',
    'Wrappers',
    'DOM Creation',
    'DOM Manipulation',
    'Events',
    'State Management',
    'Components',
    'Templates',
    'Styles',
    'Next Steps',
]

class State extends JJET {
    #step = undefined
    #steps = undefined
    constructor(steps) {
        super(new EventTarget())
        if (!Array.isArray(steps) || steps.length === 0) {
            throw new TypeError(
                `Expected steps to be a non-empty array, got ${JSON.stringify(steps)} (${typeof steps})`,
            )
        }
        this.#steps = steps
    }

    get step() {
        if (this.#step === undefined) {
            throw new Error('Step is not initialized')
        }
        return this.#step
    }

    set step(num) {
        if (!isInt(num, this.#steps)) {
            throw new RangeError(`Expected step to be an index of steps array, got ${num} (${typeof num})`)
        }
        if (num < 0) {
            num = 0
        } else if (num >= this.#steps.length) {
            num = this.#steps.length - 1
        }
        if (num !== this.#step) {
            this.#step = num
            this.triggerCustomEvent('change', { step: num })
        }
    }

    get title() {
        return this.#steps[this.#step]
    }
}

async function fetchFile(url) {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }
    return await response.text()
}

function getStepNumFromUrl(urlStr) {
    const u = new URL(urlStr)
    const stepStr = u.searchParams.get('step')
    if (stepStr === null) {
        return 0
    }
    const step = Number.parseInt(stepStr, 10)
    return Number.isNaN(step) ? 0 : step
}

function setStepNumInUrl(urlStr, step) {
    const u = new URL(urlStr)
    u.searchParams.set('step', step)
    return u.toString()
}

async function main() {
    await RenderMarkdown.defined

    const win = JJET.from(window)
    const doc = JJD.from(document)
    const content = doc.find('#content', true)
    const prevBtn = doc.find('#prev-btn', true).on('click', () => state.step--)
    const nextBtn = doc.find('#next-btn', true).on('click', () => state.step++)
    const progress = doc.find('#progress', true).setAttr('max', steps.length - 1)

    const state = new State(steps).on('change', async (event) => {
        try {
            const step = event.detail.step
            progress.setAttr('value', step)
            if (step <= 0) {
                prevBtn.setAttr('disabled', '')
            } else if (step >= steps.length - 1) {
                nextBtn.setAttr('disabled', '')
            } else {
                prevBtn.rmAttr('disabled')
                nextBtn.rmAttr('disabled')
            }
            window.history.pushState(null, '', setStepNumInUrl(window.location.href, step))
            const fileName = state.title.toLowerCase().replace(/\s+/g, '-') + '.md'
            content.ref.content = await fetchFile(fileName)
        } catch (cause) {
            throw new Error(`Error changing step`, { cause })
        }
    })

    win.on('popstate', async () => {
        try {
            state.step = getStepNumFromUrl(window.location.href)
        } catch (cause) {
            throw new Error(`Error loading step from URL`, { cause })
        }
    }).on('error', (event) => {
        console.error('Error event:', event)
        const error = event.error || new Error(event.message)
        content.ref.content = `Error: ${error.message}`
    })

    state.step = getStepNumFromUrl(window.location)
}

main().catch((err) => {
    console.error(err)
})
