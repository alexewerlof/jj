import { ready, html, em, perc, px, vw, css, qut } from '../jj.js'

const texts = [
    {
        title: 'Simple',
        jjObject: {
            body: {
                color: 'red',
            },
            div: {
                color: 'green',
                span: {
                    fontStyle: 'italic',
                }
            }
        },
    },
    {
        title: 'Nesting',
        jjObject: {
            h1: {
                color: 'blue',
                '&.special': {
                    fontSize: em(2)
                },
                span: { /* intentionally empty */ }
            },
        }
    },
    {
        title: 'Multiple nest',
        jjObject: {
            body: {
                color: 'pink',
                h1: {
                    color: 'yellow',
                    '& + &': {
                        color: 'blue'
                    },
                    span: {
                        color: 'brown'
                    }
                }
            }
        }
    },
    {
        title: 'Media queries',
        jjObject: {
            '@media only screen and (min-width: 590px)': {
                '.abThemeGradientPage': {
                    backgroundImage: '-webkit-linear-gradient(top,#fff,#f7f7fa 300px)',
                    backgroundImage: 'linear-gradient(180deg,#fff,#f7f7fa 300px)'
                },
                span: { /* intentionally empty */ }
            }
        }
    },
    {
        title: 'Nested media queries',
        jjObject: {
            '@supports (display: flex)': {
                '@media screen and (min-width: 900px)': {
                    article: {
                        display: 'flex',
                    }
                }
            }
        }
    },
    {
        title: 'At rules',
        jjObject: {
            /*
            General structure
            @IDENTIFIER (RULE);
            */
            '@namespace url(http://www.w3.org/1999/xhtml)': null,
            '@namespace svg url(http://www.w3.org/2000/svg)': null,
            '@import url("fineprint.css") print': null,
            '@import url("bluish.css") speech': null,
            '@import "custom.css"': null,
            '@import url("chrome://communicator/skin/")': null,
            '@import "common.css" screen': null,
            '@import url("landscape.css") screen and (orientation:landscape)': null,
            '@charset "utf-8"': null,
        }
    },
    {
        title: 'Font feature values',
        jjObject: {
            '@font-feature-values Font One': {
                '@styleset': {
                    niceStyle: 12,
                }
            }
        }
    },
    {
        title: 'Counter style',
        jjObject: {
            '@counter-style thumbs': {
                system: 'cyclic',
                symbols: 0x1F44D,
                suffix: " ",
            }
        }
    },
    {
        title: 'Viewport',
        jjObject: {
            '@viewport': {
                width: vw(100).toString(), /*Sets the width of the actual viewport to the device width*/
            }
        }
    },
    {
        title: 'Keyframe',
        jjObject: {
            '@keyframes slidein': {
                from: {
                    transform: 'translateX(0%)',
                },              
                to: {
                    transform: 'translateX(100%)',
                }
            }
        }
    },
    {
        title: 'Font face',
        jjObject: {
            '@font-face': {
                fontFamily: "Open Sans",
                src: [
                    'url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2")',
                    'url("/fonts/OpenSans-Regular-webfont.woff") format("woff")',
                ],
            }
        }
    },
    {
        title: '@page',
        jjObject: {
            '@page': {
                margin: '1cm',
            },
            '@page :first': {
                margin: '2cm',
            }
        }
    },
    {
        title: '@document',
        jjObject: {
            '@document url("https://www.example.com/")': {
                h1: {
                    color: 'green',
                }
            }
        }
    },
    {
        title: '@supports',
        jjObject: {
            '@supports (display: grid)': {
                div: {
                    display: 'grid',
                }
            },
            '@supports not (display: grid)': {
                div: {
                    float: 'right',
                }
            }
        }
    },
]

texts.forEach(text => {
    text.cssResult = css(text.jjObject).toString()
})

const appStyles = css({
    body: {
        padding: px(0),
        margin: px(0),
        backgroundColor: 'black',
    },
    main: {
        display: 'grid',
        gridTemplateColumns: [perc(50), perc(50)],
        gridTemplateRows: [em(2), 'auto'],
        gridTemplateAreas: [
            qut('header header'),
            qut('jj-obj css-result'),
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
    '#css-result': {
        gridArea: 'css-result',
        backgroundColor: '#555',
        color: '#EEE',
    }
})

ready(() => {
    appStyles.appendToHead();

    let jjObject, cssResult, selectTag, minifiedCbx

    function update() {
        const selectedOption = selectTag.el.selectedOptions[0]
        const text = texts[selectedOption.dataset.index]
        jjObject.setText(JSON.stringify(text.jjObject, undefined, 2))
        const minified = minifiedCbx.getProp('checked')
        cssResult.setText(css(text.jjObject).toString(minified))
    }

    html.main()
    .children(
        html.header().children(
            html.label().for('selector-box').text('Demo:'),
            ' ',
            selectTag = html.select().id('selector-box').setProp('autofocus', true).children(
                Object.values(texts).map((o, index) => 
                    html.option()
                        .text(o.title)
                        .setData('index', index)
                )
            )
            .change(update),
            ' ',
            html.label(
                minifiedCbx = html.input().type('checkbox').change(update),
                'Minified'
            )
        ),

        jjObject = html.pre().id('jj-object').text('jj'),

        cssResult = html.pre().id('css-result').text('css'),
    )
    .appendToBody()

    update()
})