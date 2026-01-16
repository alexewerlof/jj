export class RSVPEngine {
    constructor(wpm = 300) {
        this.wpm = wpm
    }

    /**
     * Calculates the Optimal Recognition Point (ORP).
     * This is the index of the letter that should be highlighted and centered.
     */
    getPivotIndex(word) {
        // For 1 letter, it's index 0.
        // For 2-5 letters, it sits around the middle-left.
        // For long words, it's roughly 30-35% into the word.
        if (word.length === 1) return 0

        // 0.35 is the magic number for "slightly left of center"
        const pivot = Math.ceil((word.length - 1) * 0.35)

        // Cap the pivot so it doesn't look weird on massive strings
        return Math.min(pivot, 4)
    }

    /**
     * Calculates how long a word should stay on screen.
     */
    calculateDelay(word, hasPunctuation) {
        // Base delay
        let delay = 60000 / this.wpm

        // 1. Length Penalty: Add time for long words
        // (e.g., proportional extra time per char over 6 chars)
        if (word.length > 6) {
            delay += (word.length - 6) * (delay / 20)
        }

        // 2. Punctuation Multiplier: The rhythm maker
        // We check the raw token before stripping punctuation for this.
        if (hasPunctuation) {
            const lastChar = hasPunctuation.slice(-1)
            if (',-:;'.includes(lastChar)) {
                delay *= 2 // Short pause
            } else if ('.?!'.includes(lastChar)) {
                delay *= 3 // Long pause (sentence break)
            }
        }

        return Math.round(delay)
    }

    /**
     * Main processor: Converts raw text into a render-ready array.
     */
    processText(text) {
        // Basic splitting. For production, consider a better tokenizer
        // to handle "Dr." or "$100" correctly.
        const rawTokens = text.trim().split(/\s+/)
        return rawTokens.map((token) => {
            // 1. Clean the word for display (removing trailing punctuation for the center view)
            // We keep 'original' to check for punctuation logic later if needed.
            const cleanWord = token.replace(/[^\p{L}\p{N}]/gu, '')

            // Fallback: if the token was just a symbol (like "&"), use it as is.
            const displayWord = cleanWord || token

            // 2. Calculate Pivot
            const pivotIndex = this.getPivotIndex(displayWord)

            // 3. Slice the word into the three visual parts
            const leftPart = displayWord.slice(0, pivotIndex)
            const pivotChar = displayWord[pivotIndex]
            const rightPart = displayWord.slice(pivotIndex + 1)

            return {
                original: token, // Useful for debugging or context
                leftPart: leftPart, // The text to the left of the focal point
                pivotChar: pivotChar, // The red/highlighted character
                rightPart: rightPart, // The text to the right
                delay: this.calculateDelay(displayWord, token), // Duration in ms
            }
        })
    }
}
