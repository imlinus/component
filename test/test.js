import { report } from './runner.js'
import diffTests from './diff.test.js'
import templateTests from './template.test.js'
import componentTests from './component.test.js'
import hooksTests from './hooks.test.js'

console.log('--- Running Framework Tests ---')

// 1. Array Diff Tests
diffTests()

// 2. Render Template HTML Output Tests
templateTests()

// 3. Stateful Component Render Output Tests
componentTests()

// 4. Hook Output Tests
hooksTests()

report()
