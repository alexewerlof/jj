import { JJD, JJHE } from '../../../lib/bundle.js'
import { TodoItem } from './components/todo-item.js'
import { TodoList } from './components/todo-list.js'

const jjDoc = JJD.from(document)

await Promise.all([TodoItem.defined, TodoList.defined])

const jjForm = jjDoc.find('#todo-form', true)
const jjInput = jjDoc.find('#todo-input', true)
const jjFilters = jjDoc.find('#filters', true)
const jjClearButton = jjDoc.find('#clear-completed', true)
const jjList = jjDoc.find('#todo-list', true)
const jjEmptyState = jjDoc.find('#empty-state', true)
const jjCountLabel = jjDoc.find('#todo-count', true)
const jjProgress = jjDoc.find('#todo-progress', true)

let todos = [
    createTodo('Sketch glow cards', true),
    createTodo('Wire up custom events', false),
    createTodo('Polish interactions', false),
]

let currentFilter = 'all'

jjForm.on('submit', (event) => {
    event.preventDefault()
    const text = jjInput.getValue().trim()
    if (!text) {
        return
    }

    todos = [createTodo(text, false), ...todos]
    jjInput.setValue('')
    jjInput.focus()
    render()
})

jjFilters.on('click', (event) => {
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

jjClearButton.on('click', () => {
    todos = todos.filter((todo) => !todo.done)
    render()
})

jjList.on('todo-toggle', (event) => {
    const { id, done } = event.detail
    todos = todos.map((todo) => (todo.id === id ? { ...todo, done } : todo))
    render()
})

jjList.on('todo-remove', (event) => {
    const { id } = event.detail
    todos = todos.filter((todo) => todo.id !== id)
    render()
})

render()

function render() {
    const visible = getVisibleTodos()
    jjList.empty()

    if (visible.length === 0) {
        jjEmptyState.setClasses({ 'is-hidden': false })
    } else {
        jjEmptyState.setClasses({ 'is-hidden': true })
        jjList.addChildMap(visible, (todo) => renderItem(todo))
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
    return JJHE.create('todo-item').setAttrs({
        'item-id': todo.id,
        text: todo.text,
        done: todo.done,
    })
}

function updateFilterButtons() {
    jjFilters.findAll('button').forEach((button) => {
        button.setClasses({
            'is-active': button.getAttr('data-filter') === currentFilter,
        })
    })
}

function updateStats() {
    const activeCount = todos.filter((todo) => !todo.done).length
    const doneCount = todos.length - activeCount
    jjCountLabel.setText(`${activeCount} active · ${doneCount} done`)
    jjProgress.setAttrs({
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
