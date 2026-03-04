import { test, assertEqual, didChange } from './runner.js'

export default function () {
  test('diff - no previous tree', () => {
    assertEqual(didChange(undefined, ['a', 'b']), true)
  })

  test('diff - same primitive arrays', () => {
    assertEqual(didChange(['a', 'b', 'c'], ['a', 'b', 'c']), false)
  })

  test('diff - different primitive arrays', () => {
    assertEqual(didChange(['a', 'b', 'c'], ['a', 'b', 'x']), true)
  })

  test('diff - arrays of different lengths', () => {
    assertEqual(didChange(['a', 'b'], ['a', 'b', 'c']), true)
  })

  test('diff - same nested arrays', () => {
    const prev = ['a', ['b', 'c'], 'd']
    const curr = ['a', ['b', 'c'], 'd']
    assertEqual(didChange(prev, curr), false)
  })

  test('diff - different nested arrays', () => {
    const prev = ['a', ['b', 'c'], 'd']
    const curr = ['a', ['b', 'x'], 'd']
    assertEqual(didChange(prev, curr), true)
  })
}
