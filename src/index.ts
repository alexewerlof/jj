export * from './types.js'
export * from './util.js'
export * from './case.js'
export * from './JJET.js'
export * from './JJN.js'
// Monkey patch the wrap() method which requires all the other JJ classes
import './JJN-wrap.js'
export * from './JJT.js'
export * from './JJE.js'
export * from './JJHE.js'
export * from './JJSE.js'
export * from './JJD.js'
export * from './JJDF.js'
export * from './JJSR.js'
export * from './helpers.js'
export * from './components.js'
export * from './ShadowMaster.js'

import { JJD } from './JJD.js'

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
