import { ChatMessage } from './components/chat-message.js'
import { ChatThread } from './components/chat-thread.js'
import { WHE } from '../../lib/bundle.js'

await ChatThread.register()
await ChatMessage.register()

const promptInput = WHE.byId('prompt-input')
const chatForm = WHE.byId('chat-form')
const chatThread = WHE.byId('chat-thread')

promptInput.on('keydown', (event) => {
    if (event.key === 'Enter' && !event.ctrlKey && !event.isComposing) {
        event.preventDefault()
        chatForm.ref.requestSubmit()
    }
})

chatForm.on('submit', (event) => {
    event.preventDefault()
    const content = promptInput.getValue()
    console.log('Handling submission:', content)
    const userChatMessage = WHE.from(new ChatMessage('user', content))
    userChatMessage.setAttr('role', 'user')
    userChatMessage.setAttr('content', content)
    // userChatMessage.ref.content = content

    console.log(userChatMessage.el)
    chatThread.append(userChatMessage)
    promptInput.setValue('')
    // Add your submission logic here
})
