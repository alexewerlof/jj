import { isObj } from './util'

export declare interface Component {
    root: Element;
}

export function isComponent(obj: unknown): obj is Component {
    return isObj(obj) && isObj(obj.root)
}
