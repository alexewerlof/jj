export * from './util.js'
export * from './case.js'
export * from './wrappers/index.js'
export * from './helpers.js'
export * from './components.js'
export * from './ShadowMaster.js'

import { JJD } from './wrappers/JJD.js'

/**
 * A wrapped document for convenience.
 * It can be used instead of document
 *
 * @example
 * ```ts
 * import { doc } from 'jj'
 * const el = doc.find('#my-element') // A JJHE instance
 * const body = doc.body             // A JJHE instance
 * doc.addChild(JJHE.create('script').setAttr('src', 'my-code.js'))
 * doc.head.addChild(JJHE.create('link').setAttr({
 *   rel: 'stylesheet',
 *   href: 'code.css'
 * }))
 * ```
 */
export const doc = JJD.from(document)
