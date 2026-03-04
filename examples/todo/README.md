# Todo App Example

A standard Todo application demonstrating the fundamental concepts of the framework.

## Key Concepts Demonstrated

- **Class Components**: Using `class extends Component` for stateful containers.
- **useState Hook**: Managing local component state for the list of todos and input fields.
- **Event Handling**: Capturing `onsubmit`, `oninput`, and `onclick` events natively.
- **Reactivity**: Automatic UI updates when the state is modified via `setTodos`.
- **List Rendering**: Mapping over arrays and returning `html` templates.

## Architecture

The app is built as a single class component `ToDoApp`. It manages the orchestration of adding, toggling, and deleting tasks.

```javascript
import { Component, html, useState, mount } from '../../index.js'
```
