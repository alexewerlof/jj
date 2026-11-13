import { JJD, JJHE } from '../src/index.ts'

const jjDoc = JJD.from(document)
const jjHtml = JJHE.from(document.documentElement)
const jjSearchForm = jjDoc.find('#api-search-form', true)
const jjSearch = jjDoc.find('#api-search', true)
const jjInherited = jjDoc.find('#api-inherited', true)
const jjProtected = jjDoc.find('#api-protected', true)
const jjExternal = jjDoc.find('#api-external', true)
const jjThemeToggle = jjDoc.find('#api-theme-toggle', true)
const jjEmptyState = jjDoc.find('#api-empty-state', true)
const jjSymbols = jjDoc.findAll('.api-doc__symbol')
const jjNavigationLinks = jjDoc.findAll('.api-doc__nav-link')
let searchQuery = ''

function updateVisibility() {
    let visibleSymbolCount = 0

    for (const jjSymbol of jjSymbols) {
        const symbolMatches = !searchQuery || jjSymbol.getDataAttr('search').includes(searchQuery)
        const symbolFlags = (jjSymbol.getDataAttr('visibility') || '').split(' ')
        const visibilityMatches =
            (jjInherited.ref.checked || !symbolFlags.includes('inherited')) &&
            (jjProtected.ref.checked || !symbolFlags.includes('protected')) &&
            (jjExternal.ref.checked || !symbolFlags.includes('external'))
        const jjMembers = jjSymbol.findAll('.api-doc__member')
        let matchingMember = false

        for (const jjMember of jjMembers) {
            const memberFlags = (jjMember.getDataAttr('visibility') || '').split(' ')
            const memberMatches =
                (!searchQuery || jjMember.getDataAttr('search').includes(searchQuery)) &&
                (jjInherited.ref.checked || !memberFlags.includes('inherited')) &&
                (jjProtected.ref.checked || !memberFlags.includes('protected')) &&
                (jjExternal.ref.checked || !memberFlags.includes('external'))
            jjMember.swAttr('hidden', !(visibilityMatches && memberMatches))
            if (searchQuery) {
                jjMember.ref.open = memberMatches
            }
            matchingMember ||= memberMatches
        }

        const shouldShow = visibilityMatches && (symbolMatches || matchingMember)
        jjSymbol.swAttr('hidden', !shouldShow)
        visibleSymbolCount += Number(shouldShow)

        for (const jjLink of jjNavigationLinks) {
            if (jjLink.getDataAttr('symbol') === jjSymbol.getAttr('id')) {
                jjLink.swAttr('hidden', !shouldShow)
            }
        }
    }

    jjEmptyState.swAttr('hidden', visibleSymbolCount > 0)
}

jjSearchForm.on('submit', (event) => {
    event.preventDefault()
    searchQuery = jjSearch.getValue().trim().toLowerCase()
    updateVisibility()

    if (searchQuery) {
        const firstResult = jjSymbols.find((jjSymbol) => !jjSymbol.ref.hidden)
        firstResult?.ref.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
})

jjInherited.on('change', updateVisibility)
jjProtected.on('change', updateVisibility)
jjExternal.on('change', updateVisibility)

function revealHashTarget() {
    const targetId = decodeURIComponent(location.hash.slice(1))
    const target = targetId ? document.getElementById(targetId) : null
    const details = target?.closest('details')

    if (details) {
        JJHE.from(details).ref.open = true
    }
}

window.addEventListener('hashchange', revealHashTarget)
revealHashTarget()

const storedTheme = localStorage.getItem('jj-api-theme') || 'dark'
jjHtml.setDataAttr('theme', storedTheme)

function updateThemeLabel() {
    const isDark = jjHtml.getDataAttr('theme') !== 'light'
    jjThemeToggle.setText(isDark ? 'Light theme' : 'Dark theme')
    jjThemeToggle.setAriaAttr('pressed', String(!isDark))
}

jjThemeToggle.on('click', () => {
    const nextTheme = jjHtml.getDataAttr('theme') === 'dark' ? 'light' : 'dark'
    jjHtml.setDataAttr('theme', nextTheme)
    localStorage.setItem('jj-api-theme', nextTheme)
    updateThemeLabel()
})

updateThemeLabel()
updateVisibility()
