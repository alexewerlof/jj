function parseHeaderLine(line) {
    const [, hashes, text ] = line.match(/^(#+)(.*)$/)
    return {
        type: `h${hashes.length}`,
        text: text.trim(),
    }
}

function parseText() {
    const rawText = "This is just some random text. If you want to Google something, [here](https://www.google.com)'s the link!"

    const result = [
        "This is just some random text. If you want to Google something, ",
        {
            type: 'a',
            text: 'here',
            href: 'https://www.google.com',
        },
        "'s the link!"
    ]
}

function parse(rawText) {
    const sections = []
    const currentParagraph = []
    for (const line of rawText.split('\n')) {
        if (line.trimStart().startsWith('#')) {
            console.log('Found a title!', line)
            currentParagraph.length = 0
            sections.push(parseHeaderLine(line))
        } else if (line === '---') {
            sections.push({
                type: 'hr'
            })
        } else if (line.trim() === '') {
            if (currentParagraph.length) {
                sections.push({
                    type: 'p',
                    text: currentParagraph.join(' ')
                })
                currentParagraph.length = 0
            }
        } else {
            currentParagraph.push(line)
        }
    }

    /** @see https://github.com/bustle/mobiledoc-kit/blob/master/MOBILEDOC.md */
    return {
        version: "0.3.2",
        sections
    }
}

console.dir(parse(`# Hello world

This is just some random text.
If you want to Google something, [here](https://www.google.com)'s the link!

![Here's an image for you](//via.placeholder.com/350x150)

---

Thank you!`))