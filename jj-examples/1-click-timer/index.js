import { ready, html, svg, css, frag, doc } from '../jj.js'
import { config } from './config.js'
import { face } from './face.js'
import { settings } from './settings.js'
import { Gear } from './gear.js'

const appStyle = css({
    'html,body': {
        padding: 0,
        margin: 0,
    },
    body: {
        fontFamily: config.font.family,
        backgroundColor: config.col.prim,
        color: config.col.sec
    },
})

ready(() => {
    appStyle.appendToHead()
    document.title = config.name
    const gear = new Gear(true)
    html('div')
        .route(/settings/, (parent) => {
            parent.setChild(settings)
        })
        .route(/\//, (parent) => {
            parent.setChild(face, gear)
        })
        .addTo(doc.body)
})