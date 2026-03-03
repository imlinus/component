import { diff } from './../source/diff.js'
import { html } from './../source/template.js'
import { Component, functional } from './../source/component.js'
import { useState } from './../source/hooks.js'

let passes = 0
let fails = 0

function test (name, fn) {
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

function assertEqual (actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected "${expected}" but got "${actual}"`)
  }
}

// Helper to fully consume the diff generator and return true if changed
function didChange (prev, curr) {
  const gen = diff(prev, curr)
  const next = gen.next()
  return !next.done // true if it yielded a result (which means it changed)
}

console.log('--- Running Framework Tests ---')

//---------------------------------------------------------
// 1. Array Diff Tests
//---------------------------------------------------------

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

//---------------------------------------------------------
// 2. Render Template HTML Output Tests
//---------------------------------------------------------

test('html template - basic string interpolation', () => {
  const name = 'World'
  const tree = html`<div>Hello ${name}</div>`
  assertEqual(tree.toString(), '<div>Hello World</div>')
})

test('html template - array mapping', () => {
  const items = ['apple', 'banana']
  const tree = html`<ul>${items.map(item => html`<li>${item}</li>`)}</ul>`
  assertEqual(tree.toString(), '<ul><li>apple</li><li>banana</li></ul>')
})

test('html template - function attributes rewritten into data markers', () => {
  const cb = () => {}
  const tree = html`<button onclick="${cb}">Click</button>`
  // The framework rewrites "onclick=" into data-click="evt_anon_xxxxx"
  const renderStr = tree.toString()
  if (!renderStr.includes('data-click="evt_anon_')) {
     throw new Error(`Attribute was not appropriately rewritten: ${renderStr}`)
  }
})

test('html template - nested html templates', () => {
  const child = html`<span>nested</span>`
  const parent = html`<div>${child}</div>`
  assertEqual(parent.toString(), '<div><span>nested</span></div>')
})

//---------------------------------------------------------
// 3. Stateful Component Render Output Tests
//---------------------------------------------------------

test('class component render - static output test', () => {
  class Greeting extends Component {
    render () {
      return html`<h1>Welcome to ${this.props.siteName}!</h1>`
    }
  }
  
  const comp = new Greeting({ siteName: 'todo.imlin.us' })
  const renderOut = comp.render().toString()
  assertEqual(renderOut, '<h1>Welcome to todo.imlin.us!</h1>')
})

test('class component render - output contains state', () => {
  class Counter extends Component {
     constructor() {
        super()
        this.overrideCounter = 5
     }

     render () {
        return html`<div>Count: ${this.overrideCounter}</div>`
     }
  }
  
  const c = new Counter()
  assertEqual(c.render().toString(), '<div>Count: 5</div>')
  c.overrideCounter = 6
  assertEqual(c.render().toString(), '<div>Count: 6</div>')
})

//---------------------------------------------------------
// 4. Hook Output Tests
//---------------------------------------------------------

test('functional component - hook isolation simulation', () => {
  // We can't easily wait for the scheduler in this sync test environment without a real DOM,
  // because `app._runRender()` calls `document.createElement('template')` inside Component.js
  // Instead, we will test the useState function directly by mocking the required context!
  
// Imports are at the top of the file
  
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

console.log('\n--- Results ---')
console.log(`${passes} passed, ${fails} failed`)

if (fails > 0) {
  process.exit(1)
}
