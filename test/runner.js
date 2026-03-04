import { diff } from './../source/diff.js'

let passes = 0
let fails = 0

/** Global test runner */
export function test (name, fn) {
  try {
    fn()
    console.log(`✅ ${name}`)
    passes++
  } catch (err) {
    console.error(`❌ ${name}`)
    console.error(err)
    fails++
  }
}

/** Basic assertion */
export function assertEqual (actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected "${expected}" but got "${actual}"`)
  }
}

/** VDOM diff helper */
export function didChange (prev, curr) {
  const gen = diff(prev, curr)
  const next = gen.next()
  return !next.done
}

/** Print summary and exit if failed */
export function report () {
  console.log('\n--- Results ---')
  console.log(`${passes} passed, ${fails} failed`)

  if (fails > 0) {
    process.exit(1)
  }
}
