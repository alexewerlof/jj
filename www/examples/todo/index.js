import { doc, JJHE } from '../../../lib/bundle.js'
import { TodoItem } from './components/todo-item.js'
import { TodoList } from './components/todo-list.js'

await Promise.all([TodoItem.register(), TodoList.register()])

const form = doc.find('#todo-form', true)
const input = doc.find('#todo-input', true)
const filters = doc.find('#filters', true)
const clearButton = doc.find('#clear-completed', true)
const list = doc.find('#todo-list', true)
const emptyState = doc.find('#empty-state', true)
const countLabel = doc.find('#todo-count', true)
const progress = doc.find('#todo-progress', true)

let todos = [
    createTodo('Sketch glow cards', true),
    createTodo('Wire up custom events', false),
    createTodo('Polish interactions', false),
]

let currentFilter = 'all'

form.on('submit', (event) => {
    event.preventDefault()
    const text = input.getValue().trim()
    if (!text) {
        return
    }

    todos = [createTodo(text, false), ...todos]
    input.setValue('')
    input.focus()
    render()
})

filters.on('click', (event) => {
    if (!(event?.target instanceof Element)) {
        return
    }

    const button = event.target.closest('[data-filter]')
    if (!button) {
        return
    }

    currentFilter = button.getAttribute('data-filter') ?? 'all'
    updateFilterButtons()
    render()
})

clearButton.on('click', () => {
    todos = todos.filter((todo) => !todo.done)
    render()
})

list.on('todo-toggle', (event) => {
    const { id, done } = event.detail
    todos = todos.map((todo) => (todo.id === id ? { ...todo, done } : todo))
    render()
})

list.on('todo-remove', (event) => {
    const { id } = event.detail
    todos = todos.filter((todo) => todo.id !== id)
    render()
})

render()

function render() {
    const visible = getVisibleTodos()
    list.empty()

    if (visible.length === 0) {
        emptyState.setClass({ 'is-hidden': false })
    } else {
        emptyState.setClass({ 'is-hidden': true })
        list.addChildMap(visible, (todo) => renderItem(todo))
    }

    updateStats()
}

function getVisibleTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter((todo) => !todo.done)
        case 'done':
            return todos.filter((todo) => todo.done)
        default:
            return todos
    }
}

function renderItem(todo) {
    return JJHE.create('todo-item').setAttr({
        'item-id': todo.id,
        text: todo.text,
        done: todo.done,
    })
}

function updateFilterButtons() {
    filters.findAll('button').forEach((button) => {
        button.setClass({
            'is-active': button.getAttr('data-filter') === currentFilter,
        })
    })
}

function updateStats() {
    const activeCount = todos.filter((todo) => !todo.done).length
    const doneCount = todos.length - activeCount
    countLabel.setText(`${activeCount} active · ${doneCount} done`)
    progress.setAttr({
        max: Math.max(1, todos.length),
        value: doneCount,
    })
}

function createTodo(text, done) {
    return {
        id: crypto.randomUUID(),
        text,
        done,
    }
}
