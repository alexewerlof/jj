import { mapKeyVal, camel2kebab, nl, ind, isObj, isNum, isStr, isArr, qut } from './util.js'

function isAtRule(selectorTxt: string): boolean {
    return selectorTxt.trimLeft().startsWith('@')
}

function toValue(val: string | number | any[]): string {
    if (isStr(val)) {
        if (val.trim() === '') {
            return qut(val)
        }
        return val
    }
    if (isNum(val)) {
        return String(val)
    }
    if (isArr(val)) {
        return val.join(' ')
    }
    throw new TypeError(`Invalid value type: ${val} (${typeof val})`)
}

function extractRules(selectorTxt: string, bodyObj: object) {
    const baseRule = new SimpleRule(selectorTxt)
    const ownProps = baseRule.bodyObj
    const nestedRules: BaseRule[] = [baseRule]

    mapKeyVal<any>(bodyObj, (key, val) => {
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

function propVal(indentation: number, prop: string, val: any): string {
    return camel2kebab(prop)
        + ( indentation < 0 ? ':' : ': ')
        + toValue(val)
        + ';'
}

abstract class BaseRule {
    constructor(public selectorTxt: string, public bodyObj = {}) {
    }

    protected get isEmpty() {
        return Object.keys(this.bodyObj).length === 0
    }

    abstract toString(indentation?: number): string;
}

class SimpleRule extends BaseRule {

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

class NestedRule extends BaseRule {

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

class WrapperRule extends BaseRule {
    toString(indentation = 0) {
        let ret = ind(indentation) + this.selectorTxt
        if (isObj(this.bodyObj)) {
            const childIndentation = indentation >= 0 ? indentation + 1 : -1
            if (indentation >= 0) {
                ret += ' '
            }
            ret += '{' + nl(indentation)
            ret += objToRulesArr(this.bodyObj)
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
    return mapKeyVal(obj, (selectorTxt: string, bodyObj: {}) => {
        if (isAtRule(selectorTxt)) {
            return new WrapperRule(selectorTxt, bodyObj)
        }
        return new NestedRule(selectorTxt, bodyObj)
    })
}
