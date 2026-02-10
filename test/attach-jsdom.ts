import { JSDOM } from 'jsdom'

const { window } = new JSDOM()
global.Document = window.Document
global.DocumentFragment = window.DocumentFragment
global.ShadowRoot = window.ShadowRoot
global.Node = window.Node
global.Text = window.Text
global.Element = window.Element
global.HTMLElement = window.HTMLElement
global.HTMLTemplateElement = window.HTMLTemplateElement
global.SVGElement = window.SVGElement
global.EventTarget = window.EventTarget
global.Event = window.Event
global.document = window.document
global.customElements = window.customElements
global.CSSStyleSheet = window.CSSStyleSheet
