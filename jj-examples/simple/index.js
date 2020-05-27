import { html, frag, ready, query } from '../jj.js'

const vm = {
    caption: 'A list of cars (click any row to remove)',
    cars: [
        {
            make: 'Volvo',
            model: 'V70',
            year: 2013
        },
        {
            make: 'Mercedes Benz',
            model: 'A 200',
            year: 2005
        },
        {
            make: 'Audi',
            model: '100',
            year: 1979
        }
    ]
}

const someCssToInline = {
    'background-color': '#333',
    'color': 'white',
}

function header(title) {
    return html('h1').text(title)
}

function body(vm) {
    return frag(
        html('form').class('greetings').submit(e => e.preventDefault()).children(
            html('label').for('name-field').text('Your name:'),
            html('br'),
            html('input').id('name-field').value('Alex').setAttr('placeholder', 'your name').if(0, t => t.hidden(true)),
            html('button').type('submit').text('Greet').click(e => {
                const name = document.querySelector('#name-field').value
                alert(`Hi ${name}!`)
                e.preventDefault()
            }),
        ),
        html('table').children(
            html('label').text('show caption').children(
                html('input').type('checkbox').checked(true).change(e => {
                    html(e.target).parent.parent.query('caption', t => t.tog())
                })
            ),
            html('caption').text(vm.caption),
            html('tr').children(
                html('th').text('Make'),
                html('th').text('Model'),
                html('th').text('Year'),
            ),
            vm.cars.map(car => html('tr')
                .children(
                    html('td').style(someCssToInline).text(car.make),
                    html('td').text(car.model),
                    html('td').text(car.year),
                )
                .detached(() => {
                    console.log('I am detached')
                })
                .click((evt) => {
                    evt.currentTarget.remove()
                })
            )
        )
    )
}

function render(vm) {
    return frag().children(
        header('hello'),
        body(vm)
    )
}

ready(() => {
    render(vm).mount(query('#app'))
})

frag().children(
    html('meta').name('Description').content('This is just a dummy meta'),
    html('meta').name('theme-color').content('#000'),
).appendTo(document.head)

setTimeout(() => {
    vm.cars.push({
        make: 'Nissan',
        model: 'Leaf',
        year: 2019
    })
    render(vm).mount(query('#app'))
}, 1000)
