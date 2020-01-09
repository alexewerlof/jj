import { win } from './win.js'
import { isFn, isStr, isObj } from './util.js'

function match(regexp, pathname) {
    if(isStr(regexp)) {
        console.log('boo', regexp, pathname)
        return regexp === pathname
    }
    if (regexp instanceof RegExp) {
        const parseResult = pathname.match(regexp)
        return parseResult || false
    } 
    throw new TypeError(`Invalid route regexp: ${regexp}`)
}

const rootRouterMap = new WeakMap()

class Router {
    constructor(root) {
        if (!isObj(root) || !isFn(root.run)) {
            throw new Error(`Root must have a run method but got ${root}`)
        }
        this.routes = []
        this.root = root
        this.isMatched = false
        rootRouterMap.set(root, this)

        const matchThis = (state) => this.runMatches(state)
        win.on('popstate', matchThis).on('hashchange', matchThis)
    }

    addRoute(regexp, handler) {
        if (isFn(this.defRouteHandler)) {
            throw new Error(`Cannot add a route after the default route is set`)
        }
        if (!isFn(handler)) {
            throw new TypeError(`Expected a route handler function but got ${handler}`)
        }
        const newRoute = { regexp, handler }
        this.routes.push(newRoute)
        if (!this.isMatched) {
            this._runRoute(undefined, newRoute)
        }
        return this
    }

    addDefRoute(handler) {
        if (isFn(this.defRouteHandler)) {
            throw new Error(`There is already a default route handler`)
        }
        if (!isFn(handler)) {
            throw new TypeError(`Expected a default route handler function but got ${handler}`)
        }
        this.defRouteHandler = handler
        if (!this.isMatched) {
            this._runDefRoute()
        }
        return this
    }

    _runRoute(state, { regexp, handler}, pathname  = window.location.pathname) {
        const matchResult = match(regexp, pathname)
        if (matchResult) {
            this.isMatched = true
            this.root.run(handler, state, matchResult)
        }
        return !!matchResult
    }

    _runDefRoute() {
        this.root.run(this.defRouteHandler)
        return this
    }

    runMatches(state, pathname  = window.location.pathname) {
        const someRouteMatched = this.routes.some(route => this._runRoute(state, route, pathname))
        if (!someRouteMatched) {
            return this._runDefRoute()
        }
        return this
    }
}

export function router(root) {
    if (!isObj(root) || !isFn(root.run)) {
        throw new TypeError(`root should be a Tag instance. Got ${root}`)
    }
    return rootRouterMap.get(root) || new Router(root)
}