import { JJD, JJHE } from '../../lib/bundle.js'

const jjDoc = JJD.from(document)

const GITHUB_BASE = 'https://github.com/alexewerlof/jj/tree/master/www/examples'

async function loadExamples() {
    try {
        const response = await fetch('./index.json')
        if (!response.ok) {
            throw new Error(`Failed to load examples: ${response.statusText}`)
        }

        const examples = await response.json()
        const jjExamplesContainer = jjDoc.find('#examples', true)

        // Sort examples by key
        const sortedKeys = Object.keys(examples).sort()

        sortedKeys.forEach((folderName) => {
            const description = examples[folderName]

            // Create card container
            const jjCard = JJHE.create('div').addClass('card')

            // Create header section
            const jjHeader = JJHE.create('div').addClass('card-header')

            // Create title
            const jjTitle = JJHE.create('h2').setText(folderName)

            // Create description
            const jjDesc = JJHE.create('p').setText(description)

            // Create actions container
            const jjActions = JJHE.create('div').addClass('card-actions')

            // Create view example link
            const jjViewLink = JJHE.create('a').setAttr('href', `${folderName}/`).setText('View Example →')

            // Create GitHub link
            const jjGithubLink = JJHE.create('a')
                .setAttr('href', `${GITHUB_BASE}/${folderName}/`)
                .setAttr('target', '_blank')
                .addClass('secondary')
                .setText('View on GitHub →')

            // Assemble the structure
            jjActions.addChild(jjViewLink)
            jjActions.addChild(jjGithubLink)

            jjHeader.addChild(jjTitle)
            jjHeader.addChild(jjDesc)

            jjCard.addChild(jjHeader)
            jjCard.addChild(jjActions)

            // Append card to examples container
            jjExamplesContainer.addChild(jjCard)
        })
    } catch (error) {
        const jjExamplesContainer = jjDoc.find('#examples', true)

        // Clear existing content
        jjExamplesContainer.ref.innerHTML = ''

        // Create error message
        const jjErrorDiv = JJHE.create('div').addClass('error')
        const jjErrorMsg = JJHE.create('p').setText(`Error loading examples: ${error.message}`)

        jjErrorDiv.addChild(jjErrorMsg)
        jjExamplesContainer.addChild(jjErrorDiv)

        console.error('Failed to load examples:', error)
    }
}

// Load examples when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadExamples)
} else {
    loadExamples()
}
