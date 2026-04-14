import { ChatMessage } from './components/chat-message.js'
import { fetchModels, runEchoTest, streamChatMessage } from './api.js'
import { JJD, JJHE } from '../../../lib/bundle.js'

const jjDoc = JJD.from(document)

// Register components
await ChatMessage.defined

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
const jjConnectionPanel = jjDoc.find('#connection-panel')
const jjModelPanel = jjDoc.find('#model-panel')
const jjStatus = jjDoc.find('#status')
const jjApiUrlInput = jjDoc.find('#api-url')
const jjApiKeyInput = jjDoc.find('#api-key')
const jjConnectBtn = jjDoc.find('#connect-btn')
const jjModelSelect = jjDoc.find('#model-select')
const jjTestBtn = jjDoc.find('#test-btn')
const jjChatThread = jjDoc.find('#chat-thread')
const jjPromptInput = jjDoc.find('#prompt-input')
const jjSendBtn = jjDoc.find('#send-btn')

// Load saved API config
function loadSavedConfig() {
    const savedUrl = localStorage.getItem(STORAGE_KEYS.API_URL)
    const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY)
    if (savedUrl) {
        jjApiUrlInput.setValue(savedUrl)
        state.apiUrl = savedUrl
    }
    if (savedKey) {
        jjApiKeyInput.setValue(savedKey)
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
    jjStatus.setText(message)
    jjStatus.rmClass('hidden', 'error', 'success', 'info')
    jjStatus.addClass(type)
}

function hideStatus() {
    jjStatus.addClass('hidden')
}

// Render chat messages
function renderMessages() {
    jjChatThread.empty()
    state.messages.forEach((msg) => {
        const jjMessage = JJHE.create('chat-message').setAttr('role', msg.role).setAttr('content', msg.content)
        jjChatThread.addChild(jjMessage)
    })

    // Scroll to bottom
    setTimeout(() => {
        const threadRef = jjChatThread.ref
        threadRef.scrollTop = threadRef.scrollHeight
    }, 0)
}

// Handle connect button
jjConnectBtn.on('click', async () => {
    const url = jjApiUrlInput.getValue().trim()
    const key = jjApiKeyInput.getValue().trim()

    if (!url || !key) {
        showStatus('Please enter both API URL and API Key', 'error')
        return
    }

    state.apiUrl = url
    state.apiKey = key
    state.status = 'connecting'

    jjConnectBtn.setAttr('disabled', '')
    jjApiUrlInput.setAttr('disabled', '')
    jjApiKeyInput.setAttr('disabled', '')
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
        jjModelSelect.empty()
        models.forEach((model) => {
            const jjOption = JJHE.create('option').setAttr('value', model.id).setText(model.id)
            jjModelSelect.addChild(jjOption)
        })

        // Select first model by default
        if (models.length > 0) {
            state.model = models[0].id
            jjModelSelect.setValue(models[0].id)
        }

        // Show model panel
        jjModelPanel.addClass('visible')
        showStatus(`Connected! Found ${models.length} model(s). Select a model and test connection.`, 'success')
    } catch (error) {
        state.status = 'disconnected'
        showStatus(`Connection failed: ${error.message}`, 'error')
        jjConnectBtn.rmAttr('disabled')
        jjApiUrlInput.rmAttr('disabled')
        jjApiKeyInput.rmAttr('disabled')
    }
})

// Handle model selection change
jjModelSelect.on('change', () => {
    state.model = jjModelSelect.getValue()
})

// Handle test connection button
jjTestBtn.on('click', async () => {
    if (!state.model) {
        showStatus('Please select a model first', 'error')
        return
    }

    state.status = 'testing'
    jjTestBtn.setAttr('disabled', '')
    jjModelSelect.setAttr('disabled', '')
    showStatus('Running echo test...', 'info')

    try {
        const result = await runEchoTest(state.apiUrl, state.apiKey, state.model)

        if (result.success) {
            state.status = 'ready'
            showStatus(`Echo test passed! Model "${state.model}" is working correctly.`, 'success')

            // Enable chat interface
            jjPromptInput.rmAttr('disabled')
            jjSendBtn.rmAttr('disabled')
            jjPromptInput.ref.focus()

            // Hide connection and model panels after brief delay
            setTimeout(() => {
                jjConnectionPanel.setStyle('display', 'none')
                jjModelPanel.setStyle('display', 'none')
                hideStatus()
            }, 2000)
        } else {
            state.status = 'connected'
            showStatus(`Echo test failed: ${result.error}`, 'error')
            jjTestBtn.rmAttr('disabled')
            jjModelSelect.rmAttr('disabled')
        }
    } catch (error) {
        state.status = 'connected'
        showStatus(`Test failed: ${error.message}`, 'error')
        jjTestBtn.rmAttr('disabled')
        jjModelSelect.rmAttr('disabled')
    }
})

// Handle send message
async function sendMessage() {
    const content = jjPromptInput.getValue().trim()
    if (!content || state.status !== 'ready' || state.isGenerating) {
        return
    }

    // Add user message
    state.messages.push({ role: 'user', content })
    renderMessages()
    jjPromptInput.setValue('')

    // Create placeholder for assistant message
    const assistantMessageIndex = state.messages.length
    state.messages.push({ role: 'assistant', content: '...' })
    renderMessages()

    // Set up streaming state
    state.isGenerating = true
    state.abortController = new AbortController()
    jjSendBtn.setText('Stop')
    jjPromptInput.setAttr('disabled', '')

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
        jjSendBtn.setText('Send')
        jjPromptInput.rmAttr('disabled')
        jjPromptInput.ref.focus()
    }
}

// Handle send/stop button click
jjSendBtn.on('click', () => {
    if (state.isGenerating) {
        // Stop generation
        state.abortController?.abort()
    } else {
        // Send message
        sendMessage()
    }
})

// Handle Enter key (Shift+Enter for newline)
jjPromptInput.on('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
    }
})

// Initialize
loadSavedConfig()
