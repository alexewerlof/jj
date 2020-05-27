function rndInt(x) {
    return Math.floor(Math.random() * x)
}

function rndRange(x, y) {
    if (x > y) {
        throw new Error(`x (${x}) should be less than y (${y})`)
    }
    return rndInt(y - x) + x
}

function clamMin(x, min) {
    return x < min ? min : x
}

function clamMax(x, max) {
    return x >= max ? max : x
}

function clam(x, min, max) {
    return clamMax(clamMin(x, min), max)
}

export function jitter(ms, jitterPercentage = 0) {
    jitterPercentage = clam(jitterPercentage, 0, 101)
    const maxMs = ms * (100 + jitterPercentage) / 100
    const minMs = ms * (100 - jitterPercentage) / 100
    return rndRange(minMs, maxMs)
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}