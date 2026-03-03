/**
 * React-like hooks: useState, useEffect, useRef.
 * Works in class components and functional wrapper components.
 */

import { shallowEqual } from './utils.js'
import {
  currentComponent,
  hookIndex, _setHookIndex,
  currentFunctionalComponent,
  functionalComponentHooks,
  componentStack
} from './template.js'

// ---------------------------------------------------------------------------
// Internal hook utilities
// ---------------------------------------------------------------------------

/** Resolves hook context for functional components. */
function _getFuncContext () {
  if (!functionalComponentHooks.has(currentFunctionalComponent)) {
    functionalComponentHooks.set(currentFunctionalComponent, {
      hooks: [],
      hookIndex: 0,
      parentComponent: componentStack[componentStack.length - 1]
    })
  }
  return functionalComponentHooks.get(currentFunctionalComponent)
}

/** Resolves hooks slot context (from functional or class). */
function _resolveHookSlot () {
  if (currentFunctionalComponent) {
    const ctx = _getFuncContext()
    const index = ctx.hookIndex++
    return { hooks: ctx.hooks, index }
  }
  if (!currentComponent) throw new Error('Hook must be called inside a component')
  const idx = hookIndex
  _setHookIndex(hookIndex + 1)
  return { hooks: currentComponent._hooks, index: idx }
}

// ---------------------------------------------------------------------------
// Public hook API
// ---------------------------------------------------------------------------

/** React-like useState: Returns [value, setter]. */
export function useState (initialValue) {
  // ---- functional component path ----------------------------------------
  if (currentFunctionalComponent) {
    const ctx = _getFuncContext()
    const index = ctx.hookIndex++

    if (ctx.hooks[index] === undefined) {
      ctx.hooks[index] = initialValue
    }

    const setState = (newValue) => {
      const value = typeof newValue === 'function'
        ? newValue(ctx.hooks[index])
        : newValue

      if (!shallowEqual(ctx.hooks[index], value)) {
        ctx.hooks[index] = value
        if (ctx.parentComponent) ctx.parentComponent._render()
      }
    }
    return [ctx.hooks[index], setState]
  }

  // ---- class component path ---------------------------------------------
  if (!currentComponent) throw new Error('useState must be called inside a component')

  const component = currentComponent
  const idx = hookIndex
  _setHookIndex(hookIndex + 1)

  if (component._hooks[idx] === undefined) {
    component._hooks[idx] = initialValue
  }

  const setState = (newValue) => {
    const value = typeof newValue === 'function'
      ? newValue(component._hooks[idx])
      : newValue

    if (!shallowEqual(component._hooks[idx], value)) {
      component._hooks[idx] = value
      component._render()
    }
  }

  return [component._hooks[idx], setState]
}

/** React-like useEffect: Runs side effects after render. */
export function useEffect (callback, deps) {
  const { hooks, index } = _resolveHookSlot()

  const prevEntry = hooks[index]
  const hasChanged = !prevEntry || !deps ||
    deps.some((dep, i) => !Object.is(dep, prevEntry.deps?.[i]))

  if (hasChanged) {
    // Run previous cleanup synchronously before scheduling the new effect.
    if (prevEntry?.cleanup) {
      try { prevEntry.cleanup() } catch (e) { console.error('useEffect cleanup error', e) }
    }

    // Write the new entry immediately so concurrent renders see updated deps.
    hooks[index] = { deps, cleanup: null }

    queueMicrotask(() => {
      try {
        const cleanup = callback()
        if (hooks[index]) hooks[index].cleanup = cleanup
      } catch (e) {
        console.error('useEffect error', e)
      }
    })
  }
}

/** React-like useRef: Mutable reference persisting across renders. */
export function useRef (initialValue) {
  const { hooks, index } = _resolveHookSlot()
  if (!hooks[index]) {
    hooks[index] = { current: initialValue }
  }
  return hooks[index]
}
