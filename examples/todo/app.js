import { Component, html, useState, mount } from '../../index.js'

class ToDoApp extends Component {
  render () {
    const [todos, setTodos] = useState([
      { id: 1, text: 'Learn the new Component Framework', completed: true },
      { id: 2, text: 'Build an awesome app', completed: false }
    ])

    const [inputValue, setInputValue] = useState('')

    const handleSubmit = (e) => {
      e.preventDefault()
      if (!inputValue.trim()) return

      setTodos(prev => [
        ...prev,
        { id: Date.now(), text: inputValue.trim(), completed: false }
      ])
      setInputValue('')
    }

    const toggleTodo = (id) => {
      setTodos(prev => prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ))
    }

    const deleteTodo = (id) => {
      setTodos(prev => prev.filter(t => t.id !== id))
    }

    return html`
      <div class="todo-container">
        <div class="todo-header">
          <h1>ToDo's</h1>
        </div>
        
        <form class="todo-form" onsubmit="${handleSubmit}">
          <input 
            type="text" 
            class="todo-input" 
            placeholder="What needs to be done?" 
            value="${inputValue}"
            oninput="${(e) => setInputValue(e.target.value)}"
          >
          <button type="submit" class="todo-btn">Add</button>
        </form>
        
        <ul class="todo-list">
          ${todos.length === 0 ? html`<div class="empty-state">All caught up! 🎉</div>` : ''}
          
          ${todos.map(todo => html`
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
              <input 
                type="checkbox" 
                ${todo.completed ? 'checked' : ''} 
                onchange="${() => toggleTodo(todo.id)}"
              />
              <span 
                class="todo-text" 
                onclick="${() => toggleTodo(todo.id)}">
                ${todo.text}
              </span>
              <button 
                class="todo-delete" 
                onclick="${() => deleteTodo(todo.id)}">
                Delete
              </button>
            </li>
          `)}
        </ul>
      </div>
    `
  }
}

mount(ToDoApp, '#app')
