import { JJD } from '../lib/bundle.js'
import { RenderMarkdown } from './components/render-markdown.js'

await RenderMarkdown.defined

const jjContent = JJD.from(document).find('#faq-content', true)
const response = await fetch('faq.md')

if (!response.ok) {
    jjContent.setText(`Failed to load FAQ: ${response.status} ${response.statusText}`)
} else {
    jjContent.ref.sourceUrl = response.url
    jjContent.ref.content = await response.text()
}
