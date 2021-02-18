import { doc } from './doc'
import { JJBase } from './JJBase'

export class Frag extends JJBase<DocumentFragment> {
    public clone(deep: boolean): Frag {
        return new Frag(this.el.cloneNode(deep) as DocumentFragment)
    }
}

export function frag(...children): Frag {
    const ret = new Frag(doc.fr())
    ret.addChildren(children)
    return ret
}