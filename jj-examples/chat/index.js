import { ready, html, css } from '../jj.js'

const messages = [
    {
        me: true,
        text: 'Hi!',
        time: Date.now() - 60000
    },
    {
        text: 'Hello!',
        time: Date.now() - 45000
    },
    {
        me: true,
        text: 'How are you?',
        time: Date.now() - 40000
    },
    {
        text: 'I\'m fine! Thanks. You?',
        time: Date.now() - 30000
    },
    {
        me: true,
        text: 'Surviving...',
        time: Date.now() - 20000
    }
]

css({
    'body': {
        backgroundColor: '#dbf5dc'
    },
    '.input-box': {
        width: '100%',
        marginTop: '10px',
        padding: '10px',
        boxSizing: 'border-box',
        border: '1px solid #8acc89',
        borderRadius: '5px',
    },
    '.messages': {
        display: 'flex',
        flexFlow: 'column',
    },
    '.message': {
        border: '1px solid #cfd0c2',
        borderRadius: '5px',
        padding: '10px',
        minWidth: '60%',
        maxWidth: '60%',
        backgroundColor: '#f5f4d8',
        '&+&': {
            marginTop: '10px'
        },
        'span.timestamp': {
            fontSize: '0.7em',
            color: '#555',
        }
    },
    '.from-me': {
        backgroundColor: '#d6e7ef',
        borderColor: '#b3bfda',
        textAlign: 'right',
        alignSelf: 'flex-end',
    }
}).appendToHead()

function dateToStr(d) {
    const date = new Date(d)
    return date.toLocaleString()
}

class Message {
    constructor(message) {
        this.root = html('div')
            .addClass('message')
            .addClass(`from-${message.me ? 'me' : 'other'}`)
            .children([
                html('span').class('timestamp').text(dateToStr(message.time)),
                html('p').text(message.text)
            ])
    }
}

ready(() => {
    let me = false
    let messagesDiv
    const root = html('div').children(
        messagesDiv = html('div').class('messages').mapChildren(messages, message => new Message(message)),
        html('input').class('input-box').type('text').on('keyup', (evt) => {
            if(evt.keyCode === 13) {
                messagesDiv.append(new Message({
                    me,
                    text: evt.target.value,
                    time: Date.now()
                }))
                evt.target.value = ''
                me = !me
            }
        })
    )

    root.appendTo(document.body)
})