// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
export const attachedEvent = new Event('attached')
export const detachedEvent = new Event('detached')

export function mutationObservationCb(mutationsList, observer) {
    for (var mutation of mutationsList) {
        if (mutation.type == 'childList') {
            mutation.addedNodes.forEach(n => n.dispatchEvent(attachedEvent))
            mutation.removedNodes.forEach(n => n.dispatchEvent(detachedEvent))
        }
    }
};

var mo

export function startObserving(observationRoot = document.documentElement) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
    mo = new MutationObserver(mutationObservationCb)
    const config = { childList: true, subtree: true };
    mo.observe(observationRoot, config);    
}

export function stopObserving() {
    if (mo) {
        mo.disconnect()
    }
}