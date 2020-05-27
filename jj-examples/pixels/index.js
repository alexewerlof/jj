import { ready, queryId, html, css, sel } from '../jj.js'

function hex(n) {
    const x = n.toString(16)
    return n < 16 ? '0' + x : x
}

function getColor(imageData, x, y) {
    const { width, data } = imageData
    const red = (y * width + x ) * 4
    return `#${hex(data[red])}${hex(data[red + 1])}${hex(data[red + 2])}`
}

function getImageArray(imageId) {
    const img = queryId(imageId).el
    const canvas = html('canvas')
    const { width, height } = img
    canvas.width(width).height(height)
    const context = canvas.el.getContext('2d')
    context.drawImage(img, 0, 0, width, height)
    const imageData = context.getImageData(0, 0, width, height);
    const result = []
    for(let x = 0; x < width; x++) {
        result[x] = []
        for(let y = 0; y < height; y++) {
            result[x][y] = getColor(imageData, x, y)
        }
    }
    result.height = height
    result.width = width
    return result
}

const config = {
    pixelDimension: '1px',
}

css({
    '.pixel': {
        display: 'inline-block',
        width: config.pixelDimension,
        height: config.pixelDimension,
        '&:hover': {
            backgroundColor: 'white !important'
        }
    }
}).appendToHead()

ready(() => {
    const matrix = getImageArray('the-image')
    const { height, width } = matrix
    html('h1').text(`${height}x${width}=${height * width} pixels`).appendToBody()
    html('div').style({
        display: 'gid',
        cursor: 'none',
        fontSize: '0px'
    })
    .appendToBody()
    .range(height, (container, y) => {
        window.requestAnimationFrame(() => {
            html('div')
            .appendTo(container)
            .range(width, (row, x) => {
                html('span')
                    .class('pixel')
                    .title(`${x}, ${y} = ${matrix[x][y]}`)
                    .style({
                        backgroundColor: matrix[x][y]
                    })
                    .appendTo(row)
            })
        })
    })
})