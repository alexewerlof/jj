import { ready, html, frag, sel } from '../jj.js'
import { appStyles } from './appStyles.js'

/*
interface Task {
    title: string;
    done: boolean;
}
 */
const tasks = [
    {
        title: 'Hi'
    },
    {
        title: 'Howdy'
    },
    {
        title: 'By'
    }
]

function renderTask(task, todoInstance) {
    return html('li')
    .children(
        html('input')
            .type('checkbox')
            .setProp('checked', task.done)
            .on('change', evt => {
                task.done = evt.target.checked
                todoInstance.update()
            }),
            html('span')
                .togClass('done', !!task.done)
                .text(task.title),
            html('button')
                .text('X')
                .title('Remove')
                .click(() => {
                    todoInstance.removeTask(task)
                })
        )
}

class Todo {
    constructor(tasks) {
        this.tasks = tasks
        this.show = 'all'
        const bem = sel().B('Todo')
        this.root = html.div(
            html('input')
                .class(bem.clone().E('new'))
                .type('text')
                .placeholder('What needs to be done?')
                .on('keyup', evt => {
                    if (evt.key === 'Enter') {
                        this.tasks.push({
                            title: evt.target.value
                        })
                        evt.target.value = ''
                        this.update()
                    }
                }),
            this.taskList = html('ul'),
            this.footer = html('footer')
                .children(
                    this.counter = html('span'),
                    this.allBtn = html.button('All').click(() => {
                        this.show = 'all'
                        this.update()
                    }),
                    this.activeBtn = html.button('Active').click(() => {
                        this.show = 'active'
                        this.update()
                    }),
                    this.completedBtn = html.button('Completed').click(() => {
                        this.show = 'completed'
                        this.update()
                    }),
                    this.clearCompleted = html.button('Clear Completed').click(() => {
                        this.tasks = this.tasks.filter(t => !t.done)
                        this.show = 'all'
                        this.update()
                    }),
                )
        ).class('Todo')
        this.update()
    }

    removeTask(task) {
        const index = this.tasks.indexOf(task)
        if (index !== -1) {
            this.tasks.splice(index, 1)
            this.update()
        }
    }

    update() {
        this.taskList.empty().children(
            this.tasks.filter(task => {
                switch (this.show) {
                    case 'active':
                        return !task.done
                    case 'completed':
                        return task.done
                    default:
                        return true
                }
            }).map(task => renderTask(task, this))
        )
        this.footer.tog(this.tasks.length)
        if (this.tasks.length) {
            this.counter.setText(this.tasks.length + ' items left')
        } else {
            this.counter.empty()
        }
        this.allBtn.togClass('selected', this.show === 'all')
        this.activeBtn.togClass('selected', this.show === 'active')
        this.completedBtn.togClass('selected', this.show === 'completed')
        this.clearCompleted.tog(this.tasks.some(t => t.done))
    }
}

function main() {
    // appStyles.appendTo(document.head)
    appStyles.appendToHead()
    frag(
        html('header').child(
            html('h1').text('todos'),
        ),
        new Todo(tasks),
        html('footer').children(
            html.div('Written by Alex Ewerlöf'),
        )
    ).appendTo(document.body)
}

ready(main)