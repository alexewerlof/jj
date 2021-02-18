class StyleTag {
    constructor(...rulesetObjArr) {
        this.root = html(STYLE)
            .type('text/css')
            .rel('stylesheet')
        this.rulesetObjArr = rulesetObjArr
        this.update()
    }

    get isAttached() {
        return this.root.isAttached()
    }

    appendToHead() {
        if (!document.head.contains(this.root.el)) {
            this.root.appendToHead()
        }
        return this
    }

    title(tagTitle) {
        this.root.el.title = tagTitle
        return this
    }

    rm() {
        this.root.rm()
        return this
    }

    minified(val) {
        this.minified = Boolean(val)
        return this
    }

    toString(minified = this.minified) {
        const indentation = minified ? -1 : 0
        const separator = nl(indentation)
        return this.rulesetObjArr
            .map(rule => objToRulesArr(rule)
                .map(rule => rule.toString(indentation))
                .join(separator)
            )
            .join(separator)
    }

    update() {
        const cssString = this.toString()
        // Only if successful, reset its content to the CSS
        this.root.setText(cssString)
        return this
    }
}

export function css(...rulesetObjArr) {
    const styleTag = html(STYLE)
        .type('text/css')
        .rel('stylesheet')
    return styleTag
}