// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
export class EventEmitter {
    constructor() {
        this.elem = document.createElement('div')
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    addEventListener(type, listener, useCapture) {
        return this.elem.addEventListener(type, listener, useCapture)
    }

    dispatchEvent(event, target) {
        return this.elem.dispatchEvent(event, target)
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
    removeEventListener(type, listener, optionsOrUseCapture) {
        return this.elem.removeEventListener(type, listener, optionsOrUseCapture)
    }
}