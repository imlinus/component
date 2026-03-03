/**
 * html tagged template — virtual DOM builder with event handler registration.
 *
 * Converts html strings into a virtual DOM tree. Function attributes (onclick=${fn})
 * are rewritten to `data-*` attributes and registered centrally for event delegation.
 */

import { escapeAttr } from './utils.js'

// ---------------------------------------------------------------------------
// Shared internal state — used by template.js, hooks.js, and component.js
// ---------------------------------------------------------------------------

/** Currently rendering class component (set during _runRender). */
export let currentComponent = null
export function _setCurrentComponent (c) { currentComponent = c }

/** Index counter for hooks within the current render pass. */
export let hookIndex = 0
export function _setHookIndex (v) { hookIndex = v }

/** Stack of rendering class components for nested hierarchy. */
export const componentStack = []

/** Map of functional component instance keys → hook state. */
export const functionalComponentHooks = new Map()

/** Monotonically increasing component ID counter for stable handler keys. */
export let _componentIdCounter = 0
export function _nextComponentId () { return ++_componentIdCounter }

/** Currently rendering functional component's instance key. */
export let currentFunctionalComponent = null
export function _setCurrentFunctionalComponent (v) { currentFunctionalComponent = v }

// ---------------------------------------------------------------------------
// html tagged template
// ---------------------------------------------------------------------------

/** Tagged template literal builder. Produces virtual DOM arrays. */
export function html (strings, ...values) {
  // _handlerIndex is reset to 0 at the top of each Component._runRender so
  // that the same template call always produces the same stable ID.
  const comp = componentStack[componentStack.length - 1] || currentComponent

  const result = strings.flatMap((str, i) => {
    let val = values[i]
    if (i < values.length) {
      if (typeof val === 'function') {
        // Check if this function is in an attribute position (e.g. onclick=)
        const match = str.match(/([a-zA-Z0-9-]+)=["']?$/)
        if (match) {
          const eventName = match[1].replace(/^on/, '').toLowerCase()

          // Stable ID: componentId + monotonically increasing handler index.
          // Because hooks (and therefore html calls) run in a fixed order, the
          // same event registration always gets the same index each render.
          const id = comp
            ? `evt_${comp._id}_${comp._handlerIndex++}`
            : `evt_anon_${Math.random().toString(36).substr(2, 9)}`

          if (comp) comp._handlers.set(id, val)

          // Rewrite the attribute from e.g. `onclick=` to `data-click="evt_1_0"`.
          // The closing `"` is included so the attribute is self-contained.
          // val is set to '' to avoid leaking the handler ID as a bare attribute.
          str = str.replace(/([a-zA-Z0-9-]+)=["']?$/, `data-${eventName}="${id}"`)
          val = ''
        }
      } else if (val !== null && val !== undefined && !val._isHtml && !Array.isArray(val)) {
        // For non-function, non-html, non-array values: check if we're inside
        // an attribute context.  If so, HTML-escape to prevent boundary breakout.
        const inAttr = /=["']?[^"']*$/.test(str) || /=["'][^"']*$/.test(str)
        if (inAttr && typeof val !== 'number') {
          val = escapeAttr(String(val))
        }
      }
      return [str, val]
    }
    return [str]
  })

  result._isHtml = true

  /** Serialise the virtual tree into an HTML string. */
  result.toString = function () {
    return this.flat(Infinity).map(p => {
      if (!p && p !== 0) return ''
      if (p._isHtml) return p.toString()
      if (Array.isArray(p)) return p.map(pi => (pi && pi._isHtml) ? pi.toString() : pi).join('')
      if (typeof p === 'object' && p.html) return p.html
      return p
    }).join('')
  }

  return result
}
