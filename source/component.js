/**
 * Core foundation: Component class, functional() hook wrapper, and mount() helpers.
 */

import { schedule } from './scheduler.js'
import { diff } from './diff.js'
import { patch } from './patch.js'
import {
  componentStack,
  functionalComponentHooks,
  currentComponent, _setCurrentComponent,
  hookIndex, _setHookIndex,
  _nextComponentId,
  currentFunctionalComponent, _setCurrentFunctionalComponent,
  html
} from './template.js'

// ---------------------------------------------------------------------------
// Base Component class
// ---------------------------------------------------------------------------

/**
 * Base class for stateful components. Override `render()` to return an `html` 
 * template. Uses cooperative rendering scheduling and event delegation.
 */
export class Component {
  constructor (props = {}) {
    this.props = props
    this._hooks = []
    this._handlers = new Map()
    this._parent = null
    this._prevHTML = ''
    this._prevTree = null
    this._mounted = false
    this._scheduled = false
    this._id = _nextComponentId()
    this._handlerIndex = 0 // Reset each render; used for stable handler IDs.
  }

  /** Override in subclasses to return html`...`. */
  render () { return html`` }

  /** Mount component to DOM selector, starting the render loop. */
  mount (selector) {
    this._parent = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector
    if (!this._parent) throw new Error('Invalid mount selector')
    this._render()
    this._setupDelegation()
    this._mounted = true
    if (this.mounted) this.mounted()
  }

  /** Schedules a re-render. Deduplicates multiple calls in the same frame. */
  _render () {
    if (this._scheduled) return
    this._scheduled = true
    schedule(this._runRender())
  }

  /** Generator that processes the render loop and VDOM diff. Yields to scheduler. */
  * _runRender () {
    const startTime = performance.now()
    const prevComp = currentComponent
    const prevHookIndex = hookIndex

    const nextHandlers = new Map()

    _setCurrentComponent(this)
    this._handlers = nextHandlers
    // Reset indices so hooks and handler IDs are stable across renders.
    this._handlerIndex = 0
    this._funcCallIndex = 0
    _setHookIndex(0)
    componentStack.push(this)

    const tree = this.render()

    componentStack.pop()
    _setCurrentComponent(prevComp)
    _setHookIndex(prevHookIndex)

    // Diff the previous and current virtual trees.
    const diffGen = diff(this._prevTree, tree)
    let changed = false

    let next = diffGen.next()
    while (!next.done) {
      changed = true
      if (performance.now() - startTime > 10) yield // Cooperative yield.
      next = diffGen.next()
    }

    // If the tree changed (or this is the first mount), serialise to HTML
    // and patch the live DOM.
    if (changed || !this._mounted) {
      const contentString = tree.toString().trim()
      if (contentString !== this._prevHTML) {
        // Parse the HTML string into a document fragment via <template>.
        const template = document.createElement('template')
        template.innerHTML = contentString

        if (!this._mounted || !this._parent.firstChild) {
          // First render or empty container — set innerHTML directly.
          this._parent.innerHTML = contentString
        } else {
          // Subsequent renders — patch each top-level node incrementally.
          const targetNodes = Array.from(template.content.childNodes)
          const currentNodes = Array.from(this._parent.childNodes)
          const max = Math.max(targetNodes.length, currentNodes.length)

          for (let i = 0; i < max; i++) {
            if (!currentNodes[i]) {
              this._parent.appendChild(targetNodes[i].cloneNode(true))
            } else if (!targetNodes[i]) {
              currentNodes[i].remove()
            } else {
              patch(currentNodes[i], targetNodes[i])
            }
          }
        }
        this._prevHTML = contentString
      }
    }

    this._handlers = nextHandlers
    this._prevTree = tree
    this._scheduled = false
  }

  /** Sets up event delegation mapping DOM events to component handlers via data attributes. */
  _setupDelegation () {
    const events = ['click', 'change', 'input', 'submit', 'keydown', 'keyup']
    events.forEach(eventType => {
      this._parent.addEventListener(eventType, (e) => {
        let target = e.target
        while (target && target !== this._parent) {
          const handlerId = target.getAttribute(`data-${eventType}`)
          if (handlerId && this._handlers.has(handlerId)) {
            this._handlers.get(handlerId)(e)
            break
          }
          target = target.parentElement
        }
      })
    })
  }
}

// ---------------------------------------------------------------------------
// Functional component wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps a plain function so it can use hooks (useState, useEffect, useRef).
 *
 * Instance isolation: each rendered call site gets a unique key composed of
 * `(functionName, parentComponentId, perRenderCallIndex)`.  This means two
 * calls to the same functional component in one render get separate hook
 * state.
 *
 * The API is unchanged:
 *   const MyCard = functional(({ title }) => html`<div>${title}</div>`)
 *
 * @param {Function} fn - The pure render function to wrap.
 * @returns {Function} A wrapper that sets up hook context before calling `fn`.
 */
export function functional (fn) {
  return function (...args) {
    const parentComp = componentStack[componentStack.length - 1]

    // Build a stable per-call-site key.  parentComp._funcCallIndex is reset
    // to 0 at the start of each _runRender, just like hookIndex.
    let instanceKey
    if (parentComp) {
      if (parentComp._funcCallIndex === undefined) parentComp._funcCallIndex = 0
      instanceKey = `${fn.name || 'anon'}_${parentComp._id}_${parentComp._funcCallIndex++}`
    } else {
      instanceKey = fn // Fallback for top-level usage.
    }

    const prevFunc = currentFunctionalComponent
    _setCurrentFunctionalComponent(instanceKey)

    // Reset hook index for this instance so hooks resolve in the same order.
    if (functionalComponentHooks.has(instanceKey)) {
      functionalComponentHooks.get(instanceKey).hookIndex = 0
    }

    const result = fn(...args)
    _setCurrentFunctionalComponent(prevFunc)
    return result
  }
}

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------

/**
 * Convenience function to instantiate and mount a component in one call.
 *
 * @param {typeof Component} ComponentClass - The component class to instantiate.
 * @param {string|Element} selector - A CSS selector or DOM element to mount into.
 * @param {Object} [props] - Optional props passed to the constructor.
 * @returns {Component} The mounted component instance.
 */
export function mount (ComponentClass, selector, props) {
  const c = new ComponentClass(props)
  c.mount(selector)
  return c
}
