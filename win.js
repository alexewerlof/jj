import { events } from './events.js'

class Window {
    constructor(windowRef) {
        this.el = windowRef
    }
}

Object.assign(Window.prototype, events)

export const win = new Window(window)