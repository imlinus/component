# Component Framework

A tiny (~30 KB), zero-dependency reactive UI framework with a React-like hooks API, cooperative scheduling, and native generator-based diffing. Built for the modern browser — **no build steps or bundlers required.**

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
  
---

Made with 💜 by and for imlin.us. But feel free to use it!
