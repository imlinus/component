/**
 * Generator-based virtual tree diffing.
 *
 * Compares two virtual trees and yields whenever a difference is found to allow
 * cooperative non-blocking scheduling.
 */

/**
 * Recursively compare `prev` and `curr` template-part arrays.
 *
 * @param {Array} prev - The previous template parts array.
 * @param {Array} curr - The current template parts array.
 * @yields {Array} The current array whenever a difference is detected.
 */
export function * diff (prev, curr) {
  // First render — everything is new.
  if (!prev) {
    yield true
    return
  }

  const length = Math.max(prev.length, curr.length)

  for (let i = 0; i < length; i++) {
    if (Array.isArray(prev[i]) && Array.isArray(curr[i])) {
      // Check nested arrays. If a change is found, bubble it up and exit early.
      const nestedDiff = diff(prev[i], curr[i])
      if (!nestedDiff.next().done) {
        yield true
        return
      }
    } else if (prev[i] !== curr[i]) {
      // Primitive or reference mismatch — signal change and exit immediately!
      yield true
      return
    }
  }
}
