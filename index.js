export { rnd, qut, runOnce, ent, doc } from './util.js'
export * from './unit.js'
export * from './Selector.js'
export * from './Tag.js'
export * from './Router.js'
import { win } from './win.js'
import { startObserving, stopObserving } from './observer.js'

const DOMContentLoaded = 'DOMContentLoaded'

export function ready(fn) {
    const { document: { readyState } } = window
    if (readyState === 'complete' || readyState === 'loaded' || readyState === 'interactive') {
        fn()
    } else {
        const onReady = () => {
            win.off(DOMContentLoaded, onReady)
            fn()
        }
        win.on(DOMContentLoaded, onReady)
    }
}

win.on('unload', () => stopObserving())

ready(() => startObserving())