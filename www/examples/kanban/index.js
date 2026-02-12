import { doc, JJHE } from '../../../lib/bundle.js'
import { KanbanCard } from './components/kanban-card.js'

// Register Custom Element
KanbanCard.register()

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
    todo: doc.find('#col-todo'),
    progress: doc.find('#col-progress'),
    done: doc.find('#col-done'),
}

const counts = {
    todo: doc.find('#count-todo'),
    progress: doc.find('#count-progress'),
    done: doc.find('#count-done'),
}

const addTaskBtn = doc.find('#add-task-btn')
const searchInput = doc.find('#search-input')

// --- Rendering ---

function render() {
    // Clear columns
    Object.values(columns).forEach((col) => col.empty())

    // Render tasks into columns
    const filteredTasks = tasks.filter((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase()))

    filteredTasks.forEach((task) => {
        const card = JJHE.create('kanban-card')
        // We can access the underlying component instance if we need to call methods directly
        // But here we rely on the component's API
        card.ref.setData(task)

        // Setup Drag start on the wrapper
        card.setAttr('draggable', 'true')
        card.on('dragstart', (e) => handleDragStart(e, task.id))

        columns[task.status].addChild(card)
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
Object.entries(columns).forEach(([status, col]) => {
    // Drag Over
    col.on('dragover', (e) => {
        e.preventDefault() // Allow drop
        e.dataTransfer.dropEffect = 'move'
        col.addClass('drag-over')
    })

    // Drag Leave
    col.on('dragleave', () => {
        col.rmClass('drag-over')
    })

    // Drop
    col.on('drop', (e) => {
        e.preventDefault()
        col.rmClass('drag-over')

        if (draggedTaskId) {
            updateTaskStatus(draggedTaskId, status)
            draggedTaskId = null
        }

        // Remove dragging class from all cards
        doc.findAll('kanban-card').forEach((c) => c.rmClass('dragging'))
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

addTaskBtn.on('click', addTask)

searchInput.on('input', (e) => {
    searchQuery = e.target.value
    render()
})

// Listen for custom delete event from cards (event delegation or global listener)
doc.on('card-delete', (e) => {
    const { id } = e.detail
    if (confirm('Delete this task?')) {
        deleteTask(id)
    }
})

// Initial Render
render()
