import { test, assertEqual } from './runner.js'
import { html } from './../source/template.js'

export default function () {
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
}
