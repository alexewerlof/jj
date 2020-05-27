import { ready, html, sel, css, px, em } from '../jj.js'

const conf = {
    border: {
        thick: {
            size: px(2),
            color: 'black'
        },
        thin: {
            size: px(1),
            color: '#666'
        }
    }
}

css(
    sel('table').css({
        borderSpacing: 'unset'
    }),
    sel('tr').css({
        [sel('&')._.el('td')]: {
            width: em(1),
            fontWeight: 'bold',
            textAlign: 'center',
            border: [conf.border.thin.size, 'solid', conf.border.thin.color]
        },
        [sel('&').firstChild()._.el('td')]: {
            borderTop: [conf.border.thick.size, 'solid', conf.border.thick.color]
        },
        [sel('&').nthChild('3n')._.el('td')]: {
            borderBottom: [conf.border.thick.size, 'solid', conf.border.thick.color]
        },
        [sel('&')._.el('td').firstChild()]: {
            borderLeft: [conf.border.thick.size, 'solid', conf.border.thick.color]
        },
        [sel('&')._.el('td').nthChild('3n')]: {
            borderRight: [conf.border.thick.size, 'solid', conf.border.thick.color]
        }
    })
).appendToHead()

ready(() => {
    html('table')
        .times(9, (table) => {
            let tr = html('tr').times(9, (tr, j) => {
                tr.append(html('td').text(j))
            })
            table.append(tr)
    }).appendToBody();
})