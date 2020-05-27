import { ready, html, frag, rnd } from '../jj.js'

class MyComponent {
    constructor(initialVm) {
        this.hiSelector = rnd('hi')
        this.byeSelector = rnd('hi')
        this.root = html('div')
            .children(
                html('span').class(this.hiSelector),
                html('span').text('-'),
                html('span').class(this.byeSelector),
            )
        this.update(initialVm)
    }

    onAttached() {
        console.log('I am attached')
    }

    onDetached() {
        console.log('I am detached')
    }

    update(vm) {
        this.root.query('.' + this.hiSelector).clear().text(vm)
        this.root.query('.' + this.byeSelector).clear().text(vm.split('').reverse().join(''))
    }
}

ready(() => {
    const comp1 = new MyComponent('comp1')
    frag(
        html('h1').text('Let\'s do this'),
        comp1,
        new MyComponent('comp2'),
    ).appendToBody()
    comp1.update('dare')
})