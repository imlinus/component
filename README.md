# Component

A tiny (~30 KB), zero-dependency reactive component framework with a React-like hooks API, built for the modern browser — **no build steps or bundlers required.**

## Why it's cool

- **Cooperative Scheduling**: Never block the main thread again.
- **Generator-based Yield-Diffing**: The VDOM implementation uses generators to slice reconciliation work into non-blocking chunks.
- **Pure JavaScript**: Standard ESM imports. No JSX, no Babel, no headaches.
- **Familiar API**: Class components and functional hooks (`useState`, `useEffect`, `useRef`) that you already know.

## Quick Start

```javascript
import { html, Component, useState, mount } from '//js.imlin.us/component'

class Counter extends Component {
  render () {
    const [count, setCount] = useState(0)
    return html`
      <button onclick=${() => setCount(count + 1)}>
        Count is: ${count}
      </button>
    `
  }
}

mount(Counter, '#app')
```

## Learn by Example

Dive into the curated example apps to see the framework in action:

- [**Todo App**](./examples/todo) - The basics: State, lists, and forms.
- [**Notes App**](./examples/notes) - Advanced: Persistence, functional components, and composition.
- [**Weather App**](./examples/weather) - Real-world: Async data fetching and effect cleanups.

---

Made with 💜 by and for imlin.us. But feel free to use it!