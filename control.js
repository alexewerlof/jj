import { isFn, isNum } from './util.js'

function parseRangeArguments(arr) {
    if (arr.length < 2) {
        throw new TypeError(`Expected at least 2 arguments but got ${arr}`)
    }
    if (!isNum(arr[0])) {
        throw new TypeError(`The first argument must be a number but got ${arr[0]}`)
    }
    if (isFn(arr[1])) {
        // range(end, fn, ...extraParams)
        const [ end, fn, ...extraParams ] = arr
        return { start: 0, end, step: 1, fn, extraParams }
    } else if (isFn(arr[2])) {
        // range(start, end, fn, ...extraParams)
        const [ start, end, fn, ...extraParams ] = arr
        return { start, end, step: 1, fn, extraParams }
    } else if (isFn(arr[3])) {
        // // range(start, end, step, fn, ...extraParams)
        const [ start, end, step, fn, ...extraParams ] = arr
        return { start, end, step, fn, extraParams }
    }
    throw new TypeError(`Which function do you want to run? Got ${arr}`)
}

export const control = {
    /**
     * @remark if inside the function you need to refer to the tag (exposed as `this`), just remember
     * to use a classic function instead of an arrow function
     */
    if(condition, fn, ...extraParams) {
        if (condition) {
            return this.run(fn, ...extraParams)
        }
        return this
    },

    forEach(arr, fn, ...extraParams) {
        arr.forEach(item => {
            this.run(fn, item, ...extraParams)
        })

        return this
    },

    times(n, fn, ...extraParams) {
        return this.range(1, n + 1, 1, fn, ...extraParams)
    },

    // range(start, end, step, fn, ...extraParams)
    // range(start, end, fn, ...extraParams) // step = 1
    // range(end, fn, ...extraParams) // start = 0, step = 1
    range() {
        const { start, end, step, fn, extraParams } = parseRangeArguments(Array.from(arguments))
        if (!isNum(start) || !isNum(end) || !isNum(step)) {
            throw new TypeError(`Expected numbers but got: start=${start}, end=${end}, step=${step}`)
        }
        if (step === 0) {
            throw new Error(`The step cannot be zero`)
        }
        if ((start < end && step < 0) || (start > end && step > 0)) {
            throw new Error(`This loop will never end: start=${start}, end=${end}, step=${step}`)
        }
        for (let i = start; i < end; i += step) {
            this.run(fn, i, ...extraParams)
        }
        return this
    },

    run(fn, ...extraParams) {
        fn.call(this, this, ...extraParams)
        return this
    },
}
