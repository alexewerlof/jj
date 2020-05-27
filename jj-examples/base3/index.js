import { ready, html, queryId, queryAll } from '../jj.js'
import { appStyles } from './styles.js'
import { toRunic, range } from './utils.js'

function decToRunic(decStr) {
    const decNum = Number(decStr)
    const ternaryStr = decNum.toString(3)
    return toRunic(ternaryStr)
}

function first100() {
    const root = queryId('first100')
    root.children(
        html.thead(
            html.tr(
                html.th('Decimal'),
                html.th('Base 3'),
                html.th('Base 3 (runic)'),
            )
        ),
        html.tbody(
            range(100).map(n =>
                html.tr(
                    html.td(n),
                    html.td(n.toString(3)),
                    html.td(toRunic(n.toString(3))),
                )
            )
        )
    )
}

function convertDecToTer() {
    queryAll('.dec-to-ter').forEach(decimalEl => {
        const text = decimalEl.el.innerText.trim()
        const base10Num = Number(text)
        decimalEl.setText(base10Num.toString(3))
    })
}

function representRunic() {
    queryAll('.to-runic').forEach(decimalEl => {
        const text = decimalEl.el.innerText.trim()
        decimalEl.setText(toRunic(text))
    })
}

function main() {
    appStyles.appendToHead()
    convertDecToTer()
    representRunic()
    first100()
}

ready(main)
