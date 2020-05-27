import { frag, html, ready, queryId } from '../jj.js'

function stateEvtToStr(stateEvt) {
    return stateEvt ? stateEvt.state : 'NA'
}

ready(() => {
    frag(
        html('header').text('Header'),
        html('main').text('Loading...')
            .route(/index\.html/i, (main, stateEvt) => {
                main.child(html('hr')).text(`We are in index! State: ${stateEvtToStr(stateEvt)}`)
            })
            .route(/page(\d+)\.html/i, (main, stateEvt, [,n]) => {
                main.child(html('hr')).text(`We're in page ${n}. State: ${stateEvtToStr(stateEvt)}`)
            })
            .defRoute((main, stateEvt) => {
                main.child(html('hr')).text(`404! Seems like you are not on a route we recognize! State: ${stateEvtToStr(stateEvt)}`)
            }),
        html('footer').text('Footer')
    ).addToBody()

    queryId('push-state').on('click', () => {
        const n = 10 + Math.floor(Math.random() * 10)
        const state = n
        history.pushState(state, null, `./page${n}.html`)
        // Workaround based on https://stackoverflow.com/questions/10940837/history-pushstate-does-not-trigger-popstate-event
        const popStateEvent = new PopStateEvent('popstate', { state });
        dispatchEvent(popStateEvent);
    })
})