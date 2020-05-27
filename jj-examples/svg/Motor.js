export class Motor {
    constructor(fn) {
        this.reqAFId = 0
        this.fn = fn
        this._tick = this._tick.bind(this)
    }

    start() {
        this._schedule()
    }

    get running() {
        return !!this.reqAFId
    }

    _tick() {
        if (this.running) {
            this.fn()
            this._schedule()
        }
    }

    _schedule() {
        this.reqAFId = requestAnimationFrame(this._tick)
    }

    stop() {
        if (this.running) {
            cancelAnimationFrame(this.reqAFId)
            this.reqAFId = 0
        }
    }
}