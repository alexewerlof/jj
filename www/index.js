import { WHE } from '../lib/index.js'
import highlighter from 'highlight'
import hljs from 'highlight-js'
import hlcss from 'highlight-css'
import hlxml from 'highlight-xml'
import { CodeBlock } from './components/code-block.js'

await CodeBlock.register()

// https://highlightjs.readthedocs.io/en/latest/api.html#configure
highlighter.configure({
    languages: ['js', 'css', 'html'],
})
highlighter.registerLanguage('js', hljs)
highlighter.registerLanguage('css', hlcss)
highlighter.registerLanguage('xml', hlxml)

await Promise.all(WHE.queryAll('pre[data-file]').map(async (el) => {
    try {
        const response = await fetch(el.getData('file'))
        if (!response.ok) {
            return el.setText(`Error loading ${el.getData('file')}: ${response.status} ${response.statusText}`)
        }
        const code = await response.text()
        const highlighted = highlighter.highlight(code, {
            language: 'js',
        }).value
        el.setHtml(highlighted)
    } catch (e) {
        el.setText(`Error: ${e.message}`)
    }
}))
