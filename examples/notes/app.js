import { Component, html, useState, useEffect, functional, mount } from '../../index.js'

const Note = functional(({ note, onUpdate, onDelete }) => {
  return html`
    <div class="note" data-key="${note.id}">
      <textarea 
        oninput="${(e) => onUpdate(e.target.value)}"
        placeholder="Write something..."
      >${note.text}</textarea>
      <div class="note-footer">
        <span>${new Date(note.id).toLocaleDateString()}</span>
        <button class="delete-note" onclick="${onDelete}">Delete</button>
      </div>
    </div>
  `
})

class NotesApp extends Component {
  render () {
    const [notes, setNotes] = useState(() => {
      const saved = window.localStorage.getItem('notes-v1')
      return saved ? JSON.parse(saved) : [{ id: Date.now(), text: 'Welcome to your notes!' }]
    })

    // Persistence side-effect
    useEffect(() => {
      window.localStorage.setItem('notes-v1', JSON.stringify(notes))
    }, [notes])

    const addNote = () => {
      setNotes([...notes, { id: Date.now(), text: '' }])
    }

    const updateNote = (id, text) => {
      setNotes(notes.map(n => n.id === id ? { ...n, text } : n))
    }

    const deleteNote = (id) => {
      setNotes(notes.filter(n => n.id !== id))
    }

    return html`
      <div class="container">
        <header>
          <h1>Notes</h1>
          <button class="add-btn" onclick="${addNote}">+ New Note</button>
        </header>

        <div class="notes-grid">
          ${notes.map(note => Note({
            note,
            onUpdate: (text) => updateNote(note.id, text),
            onDelete: () => deleteNote(note.id)
          }))}
        </div>
      </div>
    `
  }
}

mount(NotesApp, '#app')
