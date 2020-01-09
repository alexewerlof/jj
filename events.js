export const events = {
    on(eventName, handler) {
        this.el.addEventListener(eventName, handler)
        return this
    },

    once(eventName, handler) {
        this.el.addEventListener(eventName, handler, { once: true })
        return this
    },

    off(eventName, handler) {
        this.el.removeEventListener(eventName, handler)
        return this
    }
}
