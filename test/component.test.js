import { test, assertEqual } from './runner.js'
import { html } from './../source/template.js'
import { Component } from './../source/component.js'

export default function () {
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
      constructor () {
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
}
