import markdownIt from 'markdown-it'
import highlight from 'highlight.js/lib/core'
import highlightCss from 'highlight.js/lib/languages/css'
import highlightJavascript from 'highlight.js/lib/languages/javascript'
import highlightTypescript from 'highlight.js/lib/languages/typescript'
import highlightXml from 'highlight.js/lib/languages/xml'
import { inRangeInt, isArr, isPOJO, isStr } from 'jty'

highlight.configure({
    languages: ['javascript', 'typescript', 'css', 'xml'],
})
highlight.registerLanguage('javascript', highlightJavascript)
highlight.registerAliases('js', { languageName: 'javascript' })
highlight.registerLanguage('typescript', highlightTypescript)
highlight.registerAliases('ts', { languageName: 'typescript' })
highlight.registerLanguage('xml', highlightXml)
highlight.registerAliases('html', { languageName: 'xml' })
highlight.registerLanguage('css', highlightCss)

export { highlight, inRangeInt, isArr, isPOJO, isStr, markdownIt }
