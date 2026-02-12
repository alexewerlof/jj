function buildEndpoint(baseUrl, path) {
    return baseUrl.endsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`
}

/**
 * Fetch available models from the LLM API.
 * @param {string} url Base API URL
 * @param {string} apiKey API key
 * @returns {Promise<Array<{id: string}>>} Models list
 */
export async function fetchModels(url, apiKey) {
    const endpoint = buildEndpoint(url, 'v1/models')
    const response = await fetch(endpoint, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []
}

/**
 * Stream chat completions from the LLM API.
 * @param {string} url Base API URL
 * @param {string} apiKey API key
 * @param {string} model Model id
 * @param {Array<{role: string, content: string}>} messages Chat history
 * @param {AbortSignal} signal Abort signal
 * @returns {AsyncGenerator<string>} Streamed tokens
 */
export async function* streamChatMessage(url, apiKey, model, messages, signal) {
    const endpoint = buildEndpoint(url, 'v1/chat/completions')
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            stream: true,
        }),
        signal,
    })

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((line) => line.trim() !== '')

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') return

                try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content
                    if (content) {
                        yield content
                    }
                } catch (e) {
                    // Skip invalid JSON chunks
                }
            }
        }
    }
}

async function sendChatMessage(url, apiKey, model, messages) {
    const endpoint = buildEndpoint(url, 'v1/chat/completions')
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
        }),
    })

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
}

/**
 * Run a simple echo test against the model.
 * @param {string} url Base API URL
 * @param {string} apiKey API key
 * @param {string} model Model id
 * @returns {Promise<{success: boolean, word?: string, response?: string, error?: string}>}
 */
export async function runEchoTest(url, apiKey, model) {
    const testWords = ['sunshine', 'rainbow', 'elephant', 'butterfly', 'mountain']
    const randomWord = testWords[Math.floor(Math.random() * testWords.length)]

    const messages = [
        {
            role: 'user',
            content: `Please repeat this exact word: ${randomWord}`,
        },
    ]

    try {
        const response = await sendChatMessage(url, apiKey, model, messages)
        const responseLower = response.toLowerCase()
        const wordLower = randomWord.toLowerCase()

        if (responseLower.includes(wordLower)) {
            return { success: true, word: randomWord, response }
        }
        return {
            success: false,
            error: `Expected response to contain "${randomWord}" but got: ${response}`,
        }
    } catch (error) {
        return { success: false, error: error.message }
    }
}
