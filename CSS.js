import { mapKeyVal, camel2kebab, nl, ind, isObj, isNum, isStr, isArr, qut } from './util.js'
import { isDim } from './unit.js'

function isAtRule(selectorTxt) {
    return selectorTxt.trimLeft().startsWith('@')
}

function toValue(val) {
    if (isStr(val)) {
        if (val.trim() === '') {
            return qut(val)
        }
        return val
    }
    if (isNum(val)) {
        return String(val)
    }
    if (isDim(val)) {
        return String(val)
    } else if (isArr(val)) {
        return val.join(' ')
    }
}

function extractRules(selectorTxt, bodyObj) {
    const baseRule = new SimpleRule(selectorTxt)
    const ownProps = baseRule.bodyObj
    const nestedRules = [baseRule]
    mapKeyVal(bodyObj, (key, val) => {
        const v = toValue(val)
        if (v !== undefined) {
            ownProps[key] = v
        } else if (isAtRule(key)) {
            nestedRules.push(new WrapperRule(key, { [selectorTxt]: val }))
        } else {
            let nestedSelectorTxt = key.replace(/&/g, selectorTxt)
            if (nestedSelectorTxt === key) {
                // No & was present, so the replacement didn't do anything. Nest the selectors
                nestedSelectorTxt = selectorTxt + ' ' + key
            }
            nestedRules.push(new NestedRule(nestedSelectorTxt, val))
        }
    })
    return nestedRules
}

function propVal(indentation, prop, val) {
    const colon = indentation < 0 ? ':' : ': '
    return camel2kebab(prop)
        + colon
        + toValue(val)
        + ';'
}

class SimpleRule {
    constructor(selectorTxt, bodyObj = {}) {
        this.selectorTxt = selectorTxt
        this.bodyObj = bodyObj
    }

    get isEmpty() {
        return Object.keys(this.bodyObj).length === 0
    }

    toString(indentation = 0) {
        if (this.isEmpty) {
            return indentation >= 0 ? ind(indentation) + `/* ${this.selectorTxt} {} */`: ''
        }
        let ret = ind(indentation) + this.selectorTxt
        if (indentation >= 0) {
            ret += ' '
        }
        ret += '{' + nl(indentation)
        const space = ind(indentation, 1)
        ret += mapKeyVal(this.bodyObj, (key, val) => space + propVal(indentation, key, val))
            .join(nl(indentation))
        if (indentation >= 0) {
            ret += nl(indentation) + ind(indentation)
        }
        ret += '}'
        return ret
    }
}

class NestedRule {
    constructor(selectorTxt, bodyObj) {
        this.selectorTxt = selectorTxt
        this.bodyObj = bodyObj
    }

    toString(indentation = 0) {
        if (isObj(this.bodyObj)) {
            return extractRules(this.selectorTxt, this.bodyObj)
                .map(rule => rule.toString(indentation))
                .join(nl(indentation))
        }
        const v = toValue(this.bodyObj)
        if (v !== undefined) {
            return ind(indentation) + propVal(indentation, this.selectorTxt, v)
        }
        return ind(indentation) + this.selectorTxt
    }
}

class WrapperRule {
    constructor(selectorTxt, ruleSet) {
        this.selectorTxt = selectorTxt
        this.ruleSet = ruleSet
    }

    toString(indentation = 0) {
        let ret = ind(indentation) + this.selectorTxt
        if (isObj(this.ruleSet)) {
            const childIndentation = indentation >= 0 ? indentation + 1 : -1
            if (indentation >= 0) {
                ret += ' '
            }
            ret += '{' + nl(indentation)
            ret += objToRulesArr(this.ruleSet)
                .map(rule => rule.toString(childIndentation))
                .join(nl(indentation))
            ret += nl(indentation)
            ret += ind(indentation) + '}'
        } else {
            ret += ';'
        }
        return ret
    }
}

export function objToRulesArr(obj) {
    if (!isObj(obj)){
        if (isStr(obj)) {
            obj = { [obj]: null }
        } else {
            throw new TypeError(`Invalid style descriptor: ${obj}`)
        }
    }
    return mapKeyVal(obj, (selectorTxt, bodyObj) => {
        if (isAtRule(selectorTxt)) {
            return new WrapperRule(selectorTxt, bodyObj)
        }
        return new NestedRule(selectorTxt, bodyObj)
    })
}
