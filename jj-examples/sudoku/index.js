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

css({
    table: {
        borderSpacing: 'unset',
    },
    tr: {
        '&:first-child td': {
            borderTop: [conf.border.thick.size, 'solid', conf.border.thick.color]
        },
        '&:nth-child(3n) td': {
            borderBottom: [conf.border.thick.size, 'solid', conf.border.thick.color]
        },
        '& td': {
            width: em(1),
            fontWeight: 'bold',
            textAlign: 'center',
            border: [conf.border.thin.size, 'solid', conf.border.thin.color],

            '&:first-child': {
                borderLeft: [conf.border.thick.size, 'solid', conf.border.thick.color]
            },
            '&:nth-child(3n)': {
                borderRight: [conf.border.thick.size, 'solid', conf.border.thick.color]
            }
        },
    }
}).appendToHead()

// When the document is ready...
ready(() => {
    // Draw a table
    html('table')
        // 9 times (one for each orw)
        .times(9, (table) => {
            // 9 times in each row (for the cells)
            let tr = html('tr').times(9, (tr, j) => {
                // append the <TD> element to the <TR>
                tr.append(html('td').text(j))
            })
            // Append the <TR> element to the <TABLE>
            table.append(tr)
    // Append the <TABLE> to the body!
    }).appendToBody();

    const obj = {
        tagName: 'table',
        children: []
    }

    for (let row = 0; row < 9; row++) {
        const row = {
            tagName: 'tr',
            children: []
        }
        obj.children.push(row)
        for (let col = 0; col < 9; col++) {
            row.children.push({
                tagName: 'td'
            })
        }
    }

    function convertToDom(obj) {
        const root = document.createElement(obj.tagName)
        if (obj.children) {
            for (let child of obj.children) {
                root.append(convertToDom(child))
            }
        }
        return root
    }

    const dom = convertToDom(obj)
    document.body.append(...dom)
})