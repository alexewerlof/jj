import { getTutorialStepIndex } from '../tutorial/steps.js'

const tutorialFileAliases = {
    'getting-started.md': 'intro.md',
    'state-and-events.md': 'state-management.md',
    'wrapper-mental-model.md': 'wrappers.md',
}

export function resolveMarkdownLinks(jjContent, sourceUrl) {
    jjContent.findAll('a').forEach((jjLink) => {
        const href = jjLink.getAttr('href')
        if (!href || href.startsWith('#')) {
            return
        }

        const targetUrl = new URL(href, sourceUrl)
        if (targetUrl.origin !== window.location.origin) {
            return
        }

        const siteRoot = getSiteRoot(window.location.pathname)
        const guideMatch = targetUrl.pathname.match(/\/guides\/([^/]+\.md)$/)
        if (guideMatch) {
            targetUrl.pathname = `${siteRoot}www/guides/index.html`
            targetUrl.search = ''
            targetUrl.searchParams.set('file', guideMatch[1])
            jjLink.setAttr('href', targetUrl.href)
            return
        }

        const tutorialMatch = targetUrl.pathname.match(/\/tutorial\/([^/]+\.md)$/)
        if (tutorialMatch) {
            const fileName = tutorialFileAliases[tutorialMatch[1]] ?? tutorialMatch[1]
            const stepIndex = getTutorialStepIndex(fileName)
            if (stepIndex >= 0) {
                targetUrl.pathname = `${siteRoot}www/tutorial/index.html`
                targetUrl.search = ''
                targetUrl.searchParams.set('step', String(stepIndex))
                jjLink.setAttr('href', targetUrl.href)
                return
            }
        }

        if (targetUrl.pathname.endsWith('/skills/')) {
            targetUrl.pathname += 'SKILL.md'
        }

        if (targetUrl.pathname === `${siteRoot}examples/`) {
            targetUrl.pathname = `${siteRoot}www/examples/`
        }

        jjLink.setAttr('href', targetUrl.href)
    })
}

function getSiteRoot(pathname) {
    const wwwIndex = pathname.indexOf('/www/')
    return wwwIndex === -1 ? '/' : pathname.slice(0, wwwIndex + 1)
}
