import { isObj, isFn } from './util.js'

const DOMContentLoaded = 'DOMContentLoaded'

export function ready(fn) {
    async function runFn() {
        try {
            await fn()
        } catch (err) {
            if (isObj(console) && isFn(console.error)) {
                console.error(err)
            } else {
                throw err
            }
        }
    }

    const { readyState } = document
    if (['complete', 'loaded', 'interactive'].includes(readyState)) {
        runFn()
    } else {
        const onReady = () => {
            window.removeEventListener(DOMContentLoaded, onReady)
            runFn()
        }
        window.addEventListener(DOMContentLoaded, onReady)
    }
}