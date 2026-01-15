import { ChatMessage } from './components/chat-message.js'
import { ChatThread } from './components/chat-thread.js'
import { JJHE, byId } from '../../lib/bundle.js'

await ChatThread.register()
await ChatMessage.register()

const promptInput = byId('prompt-input')
const chatForm = byId('chat-form')
const chatThread = byId('chat-thread')

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
    const userChatMessage = JJHE.from(new ChatMessage('user', content))
    userChatMessage.setAttr('role', 'user')
    userChatMessage.setAttr('content', content)
    // userChatMessage.ref.content = content

    console.log(userChatMessage.ref)
    chatThread.append(userChatMessage)
    promptInput.setValue('')
    // Add your submission logic here
})
