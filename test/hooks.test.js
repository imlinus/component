import { test, assertEqual } from './runner.js'
import { functional } from './../source/component.js'
import { useState } from './../source/hooks.js'

export default function () {
  test('functional component - hook isolation simulation', () => {
    const TestComponent = functional(({ step }) => {
      const [val, setVal] = useState(0)
      if (step === 1) setVal(10)
      return `Value: ${val}`
    })

    // Call 1
    const res1 = TestComponent({ step: 0 })
    assertEqual(res1, 'Value: 0')

    // Call 2
    const res2 = TestComponent({ step: 1 })
    assertEqual(res2, 'Value: 0')

    // Call 3 - state should have persisted internally and been updated!
    const res3 = TestComponent({ step: 2 })
    assertEqual(res3, 'Value: 10')
  })
}
