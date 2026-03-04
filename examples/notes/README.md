# Notes App Example

A more advanced example showing off sub-components, persistence, and state management.

## Key Concepts Demonstrated

- **Persistence with `useEffect`**: Syncing component state to `localStorage` automatically.
- **Functional Components**: Using `Note` as a pure functional component inside the main class.
- **Composition**: Passing handlers (`onUpdate`, `onDelete`) down to child components.
- **Initial State Injection**: Loading data from local storage during the first render pass.
- **Grid Layouts**: Integrating with vanilla CSS Grid.

## How it works

The `NotesApp` class component holds the master array of notes. Every time the array changes (even just a character in a note), the `useEffect` hook triggers a save to `localStorage`.

The `Note` functional component makes the code more modular and readable by encapsulating the UI for a single note item.
