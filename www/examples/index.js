import { doc, JJHE } from '../../lib/bundle.js'

const GITHUB_BASE = 'https://github.com/alexewerlof/jj/tree/main/www/examples'

async function loadExamples() {
    try {
        const response = await fetch('./index.json')
        if (!response.ok) {
            throw new Error(`Failed to load examples: ${response.statusText}`)
        }

        const examples = await response.json()
        const examplesContainer = doc.byId('examples', true)

        // Sort examples by key
        const sortedKeys = Object.keys(examples).sort()

        sortedKeys.forEach((folderName) => {
            const description = examples[folderName]

            // Create card container
            const card = JJHE.create('div').addClass('card')

            // Create header section
            const header = JJHE.create('div').addClass('card-header')

            // Create title
            const title = JJHE.create('h2').setText(folderName)

            // Create description
            const desc = JJHE.create('p').setText(description)

            // Create actions container
            const actions = JJHE.create('div').addClass('card-actions')

            // Create view example link
            const viewLink = JJHE.create('a')
                .setAttr('href', `${folderName}/`)
                .setText('View Example →')

            // Create GitHub link
            const githubLink = JJHE.create('a')
                .setAttr('href', `${GITHUB_BASE}/${folderName}/`)
                .setAttr('target', '_blank')
                .addClass('secondary')
                .setText('View on GitHub →')

            // Assemble the structure
            actions.ref.appendChild(viewLink.ref)
            actions.ref.appendChild(githubLink.ref)

            header.ref.appendChild(title.ref)
            header.ref.appendChild(desc.ref)

            card.ref.appendChild(header.ref)
            card.ref.appendChild(actions.ref)

            // Append card to examples container
            examplesContainer.ref.appendChild(card.ref)
        })
    } catch (error) {
        const examplesContainer = doc.byId('examples', true)

        // Clear existing content
        examplesContainer.ref.innerHTML = ''

        // Create error message
        const errorDiv = JJHE.create('div').addClass('error')
        const errorMsg = JJHE.create('p').setText(`Error loading examples: ${error.message}`)

        errorDiv.ref.appendChild(errorMsg.ref)
        examplesContainer.ref.appendChild(errorDiv.ref)

        console.error('Failed to load examples:', error)
    }
}

// Load examples when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadExamples)
} else {
    loadExamples()
}
