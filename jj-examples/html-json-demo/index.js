import { ready, html, em, perc, px, toTag, css, qut } from '../jj.js'

const _name = 'name'
const _children = 'children'
const _attribs = 'attrs'
const _events = 'on'

const demoCases = [
    {
        title: 'Simple',
        htmlJsonArr: {
            [_name]: 'div',
            [_attribs]: {
                class: 'coolness-div-class'
            },
            [_children]: [
                'This is normal, ',
                {
                    [_name]: 'b',
                    [_children]: 'bold',
                },
                ' and ',
                {
                    [_name]: 'i',
                    [_children]: 'italic'
                },
                ' text!'
            ],
            [_events]: {
                click() {
                    alert('I am clicked!')
                }
            }
        }
    }
]

const appStyles = css({
    body: {
        padding: px(0),
        margin: px(0),
        backgroundColor: 'black',
    },
    main: {
        display: 'grid',
        gridTemplateColumns: [perc(50), perc(50)],
        gridTemplateRows: [em(2), perc(50), perc(50)],
        gridTemplateAreas: [
            qut('header header'),
            qut('jj-obj html-string'),
            qut('jj-obj html-result'),
        ]
    },
    header: {
        gridArea: 'header',
        backgroundColor: 'tomato',
        padding: em(0.5),
    },
    pre: {
        padding: em(0.5),
        margin: px(0),
    },
    '#jj-object': {
        gridArea: 'jj-obj',
        backgroundColor: '#333',
        color: '#CCC',
    },
    '#html-string': {
        gridArea: 'html-string',
        backgroundColor: '#555',
        color: '#EEE',
        overflow: 'auto',
    },
    '#html-result': {
        gridArea: 'html-result',
        backgroundColor: 'white',
        color: 'black',
    },
})

ready(() => {
    appStyles.appendToHead();

    let jjObject, htmlResult, htmlString, selectTag

    function update() {
        const selectedOption = selectTag.el.selectedOptions[0]
        const selectedDemoCase = demoCases[selectedOption.dataset.index]
        const { htmlJsonArr } = selectedDemoCase
        jjObject.setText(JSON.stringify(htmlJsonArr, undefined, 2))
        const htmlFragment = toTag(htmlJsonArr)
        htmlString.setChild(htmlFragment.toString())
        htmlResult.setChild(htmlFragment)
    }

    html.main()
        .children(
            html.header().children(
                html.label().for('selector-box').text('Demo:'),
                ' ',
                selectTag = html.select()
                    .id('selector-box')
                    .setProp('autofocus', true)
                    .children(
                        Object.values(demoCases).map((caseObj, index) => 
                            html.option()
                                .text(caseObj.title)
                                .setData('index', index)
                        )
                    )
                    .change(update)
            ),

            jjObject = html.pre().id('jj-object').text('json'),

            htmlString = html.pre().id('html-string').text('HTML string'),

            htmlResult = html.div().id('html-result').text('HTML result'),
        )
        .appendToBody()

    update()
})