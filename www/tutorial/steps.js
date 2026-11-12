export const tutorialSteps = [
    'Intro',
    'Wrappers',
    'DOM Creation',
    'DOM Manipulation',
    'Events',
    'State Management',
    'Components',
    'Templates',
    'Styles',
    'Next Steps',
]

export function getTutorialStepIndex(fileName) {
    return tutorialSteps.findIndex((title) => `${title.toLowerCase().replace(/\s+/g, '-')}.md` === fileName)
}
