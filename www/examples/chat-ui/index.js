import { ChatMessage } from './components/chat-message.js'
import { fetchModels, runEchoTest, streamChatMessage } from './api.js'
import { doc, JJHE } from '../../../lib/bundle.js'

// Register components
await ChatMessage.register()

// State
const STORAGE_KEYS = {
    API_URL: 'chatApiUrl',
    API_KEY: 'chatApiKey',
}

let state = {
    status: 'disconnected', // disconnected | connecting | connected | testing | ready
    apiUrl: '',
    apiKey: '',
    model: '',
    models: [],
    messages: [], // {role: 'user' | 'assistant', content: string}
    isGenerating: false,
    abortController: null,
}

// DOM elements
const connectionPanel = doc.find('#connection-panel')
const modelPanel = doc.find('#model-panel')
const statusEl = doc.find('#status')
const apiUrlInput = doc.find('#api-url')
const apiKeyInput = doc.find('#api-key')
const connectBtn = doc.find('#connect-btn')
const modelSelect = doc.find('#model-select')
const testBtn = doc.find('#test-btn')
const chatThread = doc.find('#chat-thread')
const promptInput = doc.find('#prompt-input')
const sendBtn = doc.find('#send-btn')

// Load saved API config
function loadSavedConfig() {
    const savedUrl = localStorage.getItem(STORAGE_KEYS.API_URL)
    const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY)
    if (savedUrl) {
        apiUrlInput.setValue(savedUrl)
        state.apiUrl = savedUrl
    }
    if (savedKey) {
        apiKeyInput.setValue(savedKey)
        state.apiKey = savedKey
    }
}

// Save API config
function saveConfig() {
    localStorage.setItem(STORAGE_KEYS.API_URL, state.apiUrl)
    localStorage.setItem(STORAGE_KEYS.API_KEY, state.apiKey)
}

// Show status message
function showStatus(message, type = 'info') {
    statusEl.setText(message)
    statusEl.rmClass('hidden', 'error', 'success', 'info')
    statusEl.addClass(type)
}

function hideStatus() {
    statusEl.addClass('hidden')
}

// Render chat messages
function renderMessages() {
    chatThread.empty()
    state.messages.forEach((msg) => {
        const messageEl = JJHE.create('chat-message').setAttr('role', msg.role).setAttr('content', msg.content)
        chatThread.addChild(messageEl)
    })

    // Scroll to bottom
    setTimeout(() => {
        const threadRef = chatThread.ref
        threadRef.scrollTop = threadRef.scrollHeight
    }, 0)
}

// Handle connect button
connectBtn.on('click', async () => {
    const url = apiUrlInput.getValue().trim()
    const key = apiKeyInput.getValue().trim()

    if (!url || !key) {
        showStatus('Please enter both API URL and API Key', 'error')
        return
    }

    state.apiUrl = url
    state.apiKey = key
    state.status = 'connecting'

    connectBtn.setAttr('disabled', '')
    apiUrlInput.setAttr('disabled', '')
    apiKeyInput.setAttr('disabled', '')
    showStatus('Connecting to API...', 'info')

    try {
        // Fetch available models
        const models = await fetchModels(url, key)

        if (models.length === 0) {
            throw new Error('No models available')
        }

        state.models = models
        state.status = 'connected'

        // Save config
        saveConfig()

        // Populate model dropdown
        modelSelect.empty()
        models.forEach((model) => {
            const option = JJHE.create('option').setAttr('value', model.id).setText(model.id)
            modelSelect.addChild(option)
        })

        // Select first model by default
        if (models.length > 0) {
            state.model = models[0].id
            modelSelect.setValue(models[0].id)
        }

        // Show model panel
        modelPanel.addClass('visible')
        showStatus(`Connected! Found ${models.length} model(s). Select a model and test connection.`, 'success')
    } catch (error) {
        state.status = 'disconnected'
        showStatus(`Connection failed: ${error.message}`, 'error')
        connectBtn.rmAttr('disabled')
        apiUrlInput.rmAttr('disabled')
        apiKeyInput.rmAttr('disabled')
    }
})

// Handle model selection change
modelSelect.on('change', () => {
    state.model = modelSelect.getValue()
})

// Handle test connection button
testBtn.on('click', async () => {
    if (!state.model) {
        showStatus('Please select a model first', 'error')
        return
    }

    state.status = 'testing'
    testBtn.setAttr('disabled', '')
    modelSelect.setAttr('disabled', '')
    showStatus('Running echo test...', 'info')

    try {
        const result = await runEchoTest(state.apiUrl, state.apiKey, state.model)

        if (result.success) {
            state.status = 'ready'
            showStatus(`Echo test passed! Model "${state.model}" is working correctly.`, 'success')

            // Enable chat interface
            promptInput.rmAttr('disabled')
            sendBtn.rmAttr('disabled')
            promptInput.ref.focus()

            // Hide connection and model panels after brief delay
            setTimeout(() => {
                connectionPanel.ref.style.display = 'none'
                modelPanel.ref.style.display = 'none'
                hideStatus()
            }, 2000)
        } else {
            state.status = 'connected'
            showStatus(`Echo test failed: ${result.error}`, 'error')
            testBtn.rmAttr('disabled')
            modelSelect.rmAttr('disabled')
        }
    } catch (error) {
        state.status = 'connected'
        showStatus(`Test failed: ${error.message}`, 'error')
        testBtn.rmAttr('disabled')
        modelSelect.rmAttr('disabled')
    }
})

// Handle send message
async function sendMessage() {
    const content = promptInput.getValue().trim()
    if (!content || state.status !== 'ready' || state.isGenerating) {
        return
    }

    // Add user message
    state.messages.push({ role: 'user', content })
    renderMessages()
    promptInput.setValue('')

    // Create placeholder for assistant message
    const assistantMessageIndex = state.messages.length
    state.messages.push({ role: 'assistant', content: '...' })
    renderMessages()

    // Set up streaming state
    state.isGenerating = true
    state.abortController = new AbortController()
    sendBtn.setText('Stop')
    promptInput.setAttr('disabled', '')

    try {
        // Stream response from API
        const stream = streamChatMessage(
            state.apiUrl,
            state.apiKey,
            state.model,
            state.messages.slice(0, assistantMessageIndex + 1),
            state.abortController.signal,
        )

        let isFirstToken = true
        for await (const token of stream) {
            if (isFirstToken) {
                state.messages[assistantMessageIndex].content = token
                isFirstToken = false
            } else {
                state.messages[assistantMessageIndex].content += token
            }
            renderMessages()
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            // User cancelled - keep partial message
            showStatus('Generation stopped', 'info')
        } else {
            showStatus(`Error: ${error.message}`, 'error')
            // Remove failed assistant message
            state.messages.pop()
            renderMessages()
        }
        setTimeout(hideStatus, 3000)
    } finally {
        state.isGenerating = false
        state.abortController = null
        sendBtn.setText('Send')
        promptInput.rmAttr('disabled')
        promptInput.ref.focus()
    }
}

// Handle send/stop button click
sendBtn.on('click', () => {
    if (state.isGenerating) {
        // Stop generation
        state.abortController?.abort()
    } else {
        // Send message
        sendMessage()
    }
})

// Handle Enter key (Shift+Enter for newline)
promptInput.on('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
    }
})

// Initialize
loadSavedConfig()
