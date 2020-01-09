import { sqBra, qut, alias, rnd, mapKeyVal } from './util.js'

class Selector {
    constructor(selector = '') {
        this.selector = selector
    }

    toString() {
        return this.selector
    }

    css(ruleObj) {
        return { [this.selector]: ruleObj }
    }

    clone() {
        return new Selector(this.selector)
    }

    append(...str) {
        if (str.length) {
            this.selector += str.map(s => isSel(s) ? s.selector : s).join('')
        }
        return this
    }

    at(str) {
        return this.append('@', str)
    }

    get _() {
        return this.append(' ')
    }

    // [attribute]	[target]	Selects all elements with a target attribute
    // [attribute=value]	[target=_blank]	Selects all elements with target="_blank"
    attr(attrName, attrValue) {
        return attrValue === undefined ?
            this.append(sqBra(attrName)) :
            this.append(sqBra(attrName, '=', qut(attrValue)))
    }

    // [attribute~=value]	[title~=flower]	Selects all elements with a title attribute containing the word "flower"
    attrValArrContains(attrName, attrValue) {
        return this.append(sqBra(attrName, '~=', qut(attrValue)))
    }

    // [attribute^=value]	a[href^="https"]	Selects every <a> element whose href attribute value begins with "https"
    attrValStartsWith(attrName, attrValue) {
        return this.append(sqBra(attrName, '^=', qut(attrValue)))
    }

    // [attribute$=value]	a[href$=".pdf"]	Selects every <a> element whose href attribute value ends with ".pdf"
    attrValEndsWith(attrName, attrValue) {
        return this.append(sqBra(attrName, '$=', qut(attrValue)))
    }

    // [attribute*=value]	a[href*="w3schools"]	Selects every <a> element whose href attribute value contains the substring "w3schools"
    attrValContains(attrName, attrValue) {
        return this.append(sqBra(attrName, '*=', qut(attrValue)))
    }

    class(...classNames) {
        classNames.forEach(c => this.append('.', c))
        return this
    }

    BEM(block, element, modifier) {
        this.B(block)
        if (element !== undefined) {
            this.E(element)            
        }
        if (modifier !== undefined) {
            this.M(modifier)
        }
        return this
    }

    E(element) {
        return this.append('__', element)
    }

    M(modifier) {
        return this.append('--', modifier)
    }

    id(idString) {
        return this.append('#', idString)
    }

    pClass(pseudo) {
        return this.append(':', pseudo)
    }

    pEl(pseudo) {
        return this.append('::', pseudo)
    }

    par(...str) {
        return this.append('(', ...str, ')')
    }

    prop(prop, val) {
        return this.par(prop, ':', val)
    }

    nthChild(str) {
        return this.pClass(`nth-child(${str})`)
    }

    firstChild() {
        return this.pClass(`first-child`)
    }

    rnd(prefix = '') {
        return this.append(rnd(prefix))
    }

    [Symbol.toPrimitive](hint) {
        if (hint === 'string') {
            return this.toString()
        }
        return this.value
    }
}

// B, E, M are for Block Element Modifier: http://getbem.com/introduction/
alias(Selector, {
    class: 'B',
    append: ['add', 'el', 'tag', 'com', 'cond', 'star', 'all', 'sel', 'concat'],
})

const shortHands = {
    [Symbol.toPrimitive]: 'toString',
    '>': ['gt', 'parentOf'],
    '*': ['star', 'all'],
    '~': ['tilde', 'precedes'],
    '+': ['plus', 'followedBy'],
    ',': ['comma', 'or'],
    // TODO: there's :not() pseudo-class as well and that one takes a selector
    'not': ['not'],
    'only': ['only'],
    'and': ['and'],
}

mapKeyVal(shortHands, (str, vals) => {
    vals.forEach(v => {
        Selector.prototype[v] = function () {
            return this.append(str)
        }
    })
})

export function isSel(v) {
    return v instanceof Selector
}

function _sel(param) {
    if (isSel(param)) {
        return param
    }
    return new Selector(param)
}

export const sel = new Proxy(_sel, {
    get(_sel, prop) {
        const selector = new Selector()
        if (prop in selector) {
            return selector[prop]
        } else {
            selector.append(prop)
            return selector
        }
    }
})