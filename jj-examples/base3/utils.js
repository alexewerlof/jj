const runicSymbols = ['ᛜ', 'ᛁ', 'ᚷ']

export function toRunic(s) { 
    return s
        .split('')
        .map(ch => runicSymbols[ch] || `"${ch}"?`)
        .join('')
}

export function range(stop, start = 0, step = 1) {
    const ret = []
    for (let i = start; i < stop; i += step) {
        ret.push(i)
    }
    return ret
}