/** Shared component utilities (shallow equality and escaping). */

/** Lightweight Object.is comparison for component updates. */
export function shallowEqual (a, b) {
  if (Object.is(a, b)) return true

  if (a === null || b === null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!Object.is(a[key], b[key])) return false
  }
  return true
}

/** Escape string to embed safely inside an HTML attribute value. */
export function escapeAttr (str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
