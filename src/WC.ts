import { StyleFile, TemplateFile } from './ComponentFiles.js'
import { WHE } from './WHE.js'

export class WC extends HTMLElement {
    static template: TemplateFile
    static styles: StyleFile[] = []
    static shadowMode?: ShadowRootMode

    async connectedCallback() {
        // Prevent FOUC
        const { template: templateFile, styles: styleFiles, shadowMode = 'open' } = this.constructor as typeof WC
        const [template, ...styleSheets] = await Promise.all([
            templateFile.promise,
            ...styleFiles.map((style) => style.promise),
        ])
        WHE.from(this).setShadow(shadowMode, template, ...styleSheets)
    }
}
