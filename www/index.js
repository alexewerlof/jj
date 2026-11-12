import { JJD } from '../lib/bundle.js'
import './components/simple-counter.js'

const jjDoc = JJD.from(document)
const jjCopyBtn = jjDoc.find('#copy-btn', true)
const jjCopyStatus = jjDoc.find('#copy-status', true)
const installCommand = jjDoc.find('.cmd', true).getText()
let copyFeedbackTimeout

jjCopyBtn.on('click', async () => {
    try {
        await navigator.clipboard.writeText(installCommand)
        jjCopyStatus.setText('Copied')
    } catch (err) {
        console.error('Failed to copy install command', err)
        jjCopyStatus.setText('Copy failed')
    }

    clearTimeout(copyFeedbackTimeout)
    copyFeedbackTimeout = setTimeout(() => jjCopyStatus.setText(''), 2000)
})

void import('./components/code-highlight.js').catch((err) => {
    console.error('Failed to load code highlighting', err)
})
