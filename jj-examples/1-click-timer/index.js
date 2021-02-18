import { ready, html, css } from '../jj.js'
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
        color: config.col.prim
    },
})

ready(() => {
    appStyle.appendToHead()
    document.title = config.name
    const gear = new Gear(true)
    const { pathname } = new URL(window.location.href)
    html('div')
        .if(pathname.endsWith('/settings/'), (parent) => {
            console.log('On settings page')
            parent.setChild(settings)
        })
        .if(pathname.endsWith('/'), (parent) => {
            console.log('On main page')
            parent.setChild(face, gear)
        })
        .appendTo(document.body)
})