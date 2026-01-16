import { RSVPEngine } from "./RSVPEngine.js";
import { byId, fetchText } from '../../../lib/bundle.js'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const inputTextArea = byId('input-text')
const leftSpan = byId('left-side')
const pivotSpan = byId('pivot-char')
const rightSpan = byId('right-side')
const renderProgress = byId('render-progress')

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
    const engine = new RSVPEngine(300); // 300 WPM
    const queue = engine.processText(inputTextArea.getValue());
    renderProgress.setAttrs({
        min: 0,
        max: queue.length,
        value: 0,
    })

    console.log(queue);
    for (let i = 0; i < queue.length; i++) {
        renderProgress.setValue(i + 1)
        const item = queue[i]
        const { leftPart, pivotChar, rightPart, delay } = item;
        leftSpan.setText(leftPart);
        pivotSpan.setText(pivotChar);
        rightSpan.setText(rightPart);
        if (abortController.signal.aborted) {
            break;
        }
        await sleep(delay);
    }
}