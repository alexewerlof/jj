import { JJD, JJHE } from '../../../lib/bundle.js'
import { KanbanCard } from './components/kanban-card.js'

const jjDoc = JJD.from(document)

// Register Custom Element
await KanbanCard.defined

// Application State
let tasks = [
    { id: 't-1', text: 'Analyze generic Kanban requirements', status: 'todo', priority: 'high' },
    { id: 't-2', text: 'Design the board layout', status: 'progress', priority: 'medium' },
    { id: 't-3', text: 'Implement Drag and Drop', status: 'todo', priority: 'high' },
    { id: 't-4', text: 'Refine UI animations', status: 'done', priority: 'low' },
]
let searchQuery = ''

// DOM Elements
const columns = {
    todo: jjDoc.find('#col-todo'),
    progress: jjDoc.find('#col-progress'),
    done: jjDoc.find('#col-done'),
}

const counts = {
    todo: jjDoc.find('#count-todo'),
    progress: jjDoc.find('#count-progress'),
    done: jjDoc.find('#count-done'),
}

const jjAddTaskBtn = jjDoc.find('#add-task-btn')
const jjSearchInput = jjDoc.find('#search-input')

// --- Rendering ---

function render() {
    // Clear columns
    Object.values(columns).forEach((col) => col.empty())

    // Render tasks into columns
    const filteredTasks = tasks.filter((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase()))

    filteredTasks.forEach((task) => {
        const jjCard = JJHE.create('kanban-card')
        // We can access the underlying component instance if we need to call methods directly
        // But here we rely on the component's API
        jjCard.ref.setData(task)

        // Setup Drag start on the wrapper
        jjCard.setAttr('draggable', 'true')
        jjCard.on('dragstart', (e) => handleDragStart(e, task.id))

        columns[task.status].addChild(jjCard)
    })

    // Update counts
    updateCounts()
}

function updateCounts() {
    const stats = { todo: 0, progress: 0, done: 0 }
    tasks.forEach((t) => stats[t.status]++)

    Object.keys(stats).forEach((status) => {
        counts[status].setText(stats[status])
    })
}

// --- Drag and Drop Logic ---

let draggedTaskId = null

function handleDragStart(e, id) {
    draggedTaskId = id
    e.dataTransfer.effectAllowed = 'move'
    // Required for Firefox
    e.dataTransfer.setData('text/plain', id)

    // Add dragging class for visuals
    requestAnimationFrame(() => e.target.classList.add('dragging'))
}

// Setup Column Drop Zones
Object.entries(columns).forEach(([status, jjCol]) => {
    // Drag Over
    jjCol.on('dragover', (e) => {
        e.preventDefault() // Allow drop
        e.dataTransfer.dropEffect = 'move'
        jjCol.addClass('drag-over')
    })

    // Drag Leave
    jjCol.on('dragleave', () => {
        jjCol.rmClass('drag-over')
    })

    // Drop
    jjCol.on('drop', (e) => {
        e.preventDefault()
        jjCol.rmClass('drag-over')

        if (draggedTaskId) {
            updateTaskStatus(draggedTaskId, status)
            draggedTaskId = null
        }

        // Remove dragging class from all cards
        jjDoc.findAll('kanban-card').forEach((jjC) => jjC.rmClass('dragging'))
    })
})

// --- Data Operations ---

function updateTaskStatus(id, newStatus) {
    const taskIndex = tasks.findIndex((t) => t.id === id)
    if (taskIndex > -1 && tasks[taskIndex].status !== newStatus) {
        tasks[taskIndex].status = newStatus
        render()
    }
}

function addTask() {
    const text = prompt('Enter task description:')
    if (!text) return

    const newTask = {
        id: `t-${Date.now()}`,
        text,
        status: 'todo',
        priority: 'medium', // Default
    }

    tasks.push(newTask)
    render()
}

function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id)
    render()
}

// --- Event Listeners ---

jjAddTaskBtn.on('click', addTask)

jjSearchInput.on('input', (e) => {
    searchQuery = e.target.value
    render()
})

// Listen for custom delete event from cards (event delegation or global listener)
jjDoc.on('card-delete', (e) => {
    const { id } = e.detail
    if (confirm('Delete this task?')) {
        deleteTask(id)
    }
})

// Initial Render
render()
