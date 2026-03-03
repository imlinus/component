# Component Framework

A tiny (~30 KB), zero-dependency reactive UI framework with a React-like hooks API, cooperative scheduling, and native generator-based diffing. Built for the modern browser — **no build steps or bundlers required.**

## Quick Start

```javascript
import { html, Component, useState, useEffect, functional, mount } from '//js.imlin.us/component/index.js'
```

## Examples

### 1. Stateful Class Component

```javascript
import { Component, html, useState, mount } from '//js.imlin.us/component'

class Counter extends Component {
  render() {
    const [count, setCount] = useState(0)

    return html`
      <div class="card">
        <h2>Count: ${count}</h2>
        <button onclick=${() => setCount(c => c + 1)}>Increment</button>
      </div>
    `
  }
}

mount(Counter, '#app')
```

### 2. Functional Components with Hooks

```javascript
import { html, functional, useState } from '//js.imlin.us/component'

const Greeting = functional(({ name }) => {
  const [excited, setExcited] = useState(false)

  return html`
    <div>
      <span>Hello, ${name}${excited ? '!' : '.'}</span>
      <button onclick=${() => setExcited(!excited)}>Toggle</button>
    </div>
  `
})

// Use it inside another component automatically:
class App extends Component {
  render() {
    return html`
      <main>
        ${Greeting({ name: 'World' })}
      </main>
    `
  }
}
```

### 3. Arrays and Keyed DOM Elements

Use `data-key` inside `map()` so the underlying VDOM patcher perfectly tracks and re-orders instances instead of tearing them down.

```javascript
class TodoList extends Component {
  render() {
    const [todos, setTodos] = useState([
      { id: 1, text: 'Learn framework' },
      { id: 2, text: 'Build app' }
    ])

    const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id))

    return html`
      <ul>
        ${todos.map(todo => html`
          <li data-key="${todo.id}">
            <span>${todo.text}</span>
            <button onclick=${() => deleteTodo(todo.id)}>Delete</button>
          </li>
        `)}
      </ul>
    `
  }
}
```

### 4. Forms and Event Handlers

Supported native auto-delegated events: `onclick`, `onchange`, `oninput`, `onsubmit`, `onkeydown`, `onkeyup`. Keep it lowercase exactly like native DOM attributes.

```javascript
class SearchForm extends Component {
  render() {
    const [query, setQuery] = useState('')

    const handleSubmit = (e) => {
      e.preventDefault()
      alert(`Searching for: ${query}`)
    }

    return html`
      <form onsubmit=${handleSubmit}>
        <input 
          value="${query}" 
          oninput=${(e) => setQuery(e.target.value)} 
          placeholder="Search..."
        />
        <button type="submit">Go</button>
      </form>
    `
  }
}
```

### 5. Side-effects (useEffect)

```javascript
import { Component, html, useEffect, useState } from '//js.imlin.us/component/index.js'

class Clock extends Component {
  render() {
    const [time, setTime] = useState(new Date().toLocaleTimeString())

    useEffect(() => {
      const timer = setInterval(() => {
        setTime(new Date().toLocaleTimeString())
      }, 1000)
      
      return () => clearInterval(timer) // cleanup triggers before unmount/re-effect
    }, [])

    return html`<h3>${time}</h3>`
  }
}
```

---

Made with 💜 by and for imlin.us. But feel free to use it!