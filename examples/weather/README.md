# Weather App Example

Demonstrating asynchronous data fetching and cleanup in effects.

## Key Concepts Demonstrated

- **Async Fetching**: Using `fetch` inside `useEffect` to retrieve external data.
- **Race Condition Handling**: Using a `cancelled` flag inside the effect cleanup to prevent updating state on unmounted or stale components.
- **Loading States**: Managing a `loading` boolean to improve UX during network requests.
- **Conditional Rendering**: Swapping out templates based on data availability.

## Performance Note

Because this framework uses **cooperative scheduling**, the network request won't block the UI thread. The generator-based diffing ensures that when the data finally arrives, the DOM update is handled in small slices, keeping the animations (like the backdrop-filter blur) smooth.
