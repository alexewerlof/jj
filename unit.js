import { isStr, alias } from './util.js'

class Dim {
    constructor(value, unit) {
        if (isStr(value)) {
            this.parse(value)
        } else {
            this.value = value
            this.unit = unit
        }
    }

    clone() {
        return new Dim(this.value, this.unit)
    }

    parse(str) {
        const parts = str.match(/([-+]?[0-9.]+)([%\w]*)/)
        if (parts) {
            const [, value, unit] = parts
            this.value = value
            this.unit = unit
        }
        throw new SyntaxError(`Could not parse ${str} as a CSS Dimention`)
    }

    toString() {
        return `${this.value}${this.unit}`
    }

    [Symbol.toPrimitive](hint) {
        if (hint === 'string') {
            return this.toString()
        }
        return this.value
    }
}

alias(Dim, {
    toString: 'toJSON'
})

export function isDim(val) {
    return val instanceof Dim
}

export function perc(num) {
    return new Dim(num, '%')
}

export function em(num) {
    return new Dim(num, 'em')
}

export function rem(num) {
    return new Dim(num, 'rem')
}

export function px(num) {
    return new Dim(num, 'px')
}

export function vh(num) {
    return new Dim(num, 'vh')
}

export function vw(num) {
    return new Dim(num, 'vw')
}

export function col(r, g, b, a) {
    if (g === undefined && b === undefined && a === undefined) {
        if (isStr(r, 1)) {
            return `#${r}`
        }
    }
    throw new Error('TODO: Use case not implemented yet')
}
