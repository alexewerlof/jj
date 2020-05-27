import { html, svg, frag, vh, vw, px } from '../jj.js'

import { config } from './config.js'

class Face {
    constructor() {
        this.root = svg()
            .attrs({
                viewBox: '0 0 100 100',
                'xmlns:xlink': 'http://www.w3.org/1999/xlink'
            })
            .style({
                maxHeight: vh(100),
                maxWidth: vw(100),
            })
            .children(
                svg('circle')
                    .attrs({
                        cx: 50,
                        cy: 50,
                        r: 45,
                        stroke: config.col.prim,
                        strokeWidth: 1,
                        fill: config.col.sec
                    }),
                svg('g')
                    .comment('The 1 indicators')
                    .range(0, 60, 1, (gTag, i) => {
                        if (i % 5 === 0) {
                            return
                        }
                        gTag.append(
                            svg('line')
                                .attrs({
                                    x1: 50,
                                    y1: 8,
                                    x2: 50,
                                    y2: 6,
                                    transform: `rotate(${i * 6} 50 50)`
                                })
                                .style({
                                    stroke: config.col.prim,
                                    strokeWidth: 0.7,
                                })
                        )
                    }),
                svg('g')
                    .comment('The 5 indicators')
                    .range(0, 60, 5, (gTag, i) => {
                        gTag.append(
                            svg('text')
                                .attrs({
                                    x: 50,
                                    y: 14,
                                    transform: `rotate(${(i-0.6) * 6} 50 50)`,
                                })
                                .style({
                                    fontSize: px(5),
                                    fill: config.col.prim,
                                })
                                .text(i === 0 ? '60' : i),
                            svg('line')
                                .attrs({
                                    x1: 50,
                                    y1: 9,
                                    x2: 50,
                                    y2: 5,
                                    transform: `rotate(${i * 6} 50 50)`
                                })
                                .style({
                                    stroke: config.col.prim,
                                    strokeWidth: 1.5,
                                })
                        )
                    }),
                svg('g')
                    .comment('Second')
                    .append(
                        this.second = svg('line')
                            .id('second-hand')
                            .attrs({
                                x1: 50,
                                y1: 70,
                                x2: 50,
                                y2: 10,
                            })
                            .style({
                                willChange: 'transform',
                                transformOrigin: '50px 50px',
                                stroke: config.col.prim,
                                strokeWidth: 1,
                            }),
                        svg('circle')
                            .attrs({
                                cx: 50,
                                cy: 50,
                                r: 3,
                                fill: config.col.prim
                            })
                    ),
                svg('g')
                    .comment('made in sweden')
                    .children(
                        svg('path')
                            .id('made-in-sweden-curve')
                            .attr('d', 
                                'M 2,50' +
                                'A 10,10 0 0 0 98,50'
                            )
                            .attr('fill', 'none')
                            .style({
                                stroke: 'none',
                                strokeWidth: 0.3,
                            }),
                        svg('text').child(
                            svg('textPath')
                                .attrs({
                                    'href': '#made-in-sweden-curve',
                                    fill: config.col.sec,
                                    startOffset: 64.3,
                                })
                                .style({
                                    fontSize: px(3),
                                    alignmentBaseline:'top',
                                })
                                .text('Made in Sweden')
                        )
                    )
            )
    }

    update(sec) {
        this.second.style({
            transform: `rotate(${sec*6}deg)`
        })
    }
}

export const face = new Face

// Demo
setInterval(() => {
    const d = new Date
    const sec = d.getSeconds() + d.getMilliseconds() / 1000
    face.update(sec)
    console.log('ho', sec)
}, 32)