import { JJD, JJET } from '../../lib/bundle.js'
import { RenderMarkdown } from '../components/render-markdown.js'
import { TutorialSteps } from '../components/tutorial-steps.js'

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

function getStepNumFromUrl(urlStr) {
    const url = new URL(urlStr)
    const stepStr = url.searchParams.get('step')
    if (stepStr === null) {
        return 0
    }
    const step = Number.parseInt(stepStr, 10)
    return Number.isNaN(step) ? 0 : step
}

function setStepNumInUrl(urlStr, step) {
    const url = new URL(urlStr)
    url.searchParams.set('step', String(step))
    return url.toString()
}

async function fetchFile(url) {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }
    return await response.text()
}

async function main() {
    await Promise.all([RenderMarkdown.defined, TutorialSteps.defined])

    const jjWin = JJET.from(window)
    const jjDoc = JJD.from(document)
    const jjContent = jjDoc.find('#content', true)
    const jjTutorialSteps = jjDoc.find('#tutorial-steps', true)
    let isSyncingFromUrl = false

    const loadStepContent = async (title) => {
        const fileName = title.toLowerCase().replace(/\s+/g, '-') + '.md'
        jjContent.ref.content = await fetchFile(fileName)
    }

    jjTutorialSteps.ref.steps = steps
    jjDoc.find('#next-step', true).on('click', () => jjTutorialSteps.ref.next())

    const initialStep = getStepNumFromUrl(window.location.href)
    jjTutorialSteps.ref.step = initialStep
    await loadStepContent(jjTutorialSteps.ref.title)

    jjTutorialSteps.on('change', async (event) => {
        try {
            if (!isSyncingFromUrl) {
                window.history.pushState(null, '', setStepNumInUrl(window.location.href, event.detail.step))
            }
            await loadStepContent(event.detail.title)
        } catch (cause) {
            throw new Error(`Error changing step`, { cause })
        }
    })

    jjWin.on('popstate', () => {
        try {
            isSyncingFromUrl = true
            jjTutorialSteps.ref.step = getStepNumFromUrl(window.location.href)
        } catch (cause) {
            throw new Error(`Error loading step from URL`, { cause })
        } finally {
            isSyncingFromUrl = false
        }
    })

    jjWin.on('error', (event) => {
        console.error('Error event:', event)
        const error = event.error || new Error(event.message)
        jjContent.ref.content = `Error: ${error.message}`
    })
}

main().catch((err) => {
    console.error(err)
})
