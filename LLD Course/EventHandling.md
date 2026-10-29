# Event Handling

**Course:** Chakde Frontend System Design - Machine Coding (LLD)  
**Duration:** 2 hours  
**Difficulty:** Intermediate to Advanced

## Module Goal

Learn how to design React event handling that stays clean, performant, accessible, and maintainable as applications scale.

## Learning Outcomes

- Keep event handlers small and focused.
- Separate UI events from business logic.
- Apply debounce, throttle, and event delegation appropriately.
- Handle event propagation and cleanup correctly.
- Build reusable event logic with custom hooks.
- Handle keyboard and asynchronous interactions safely.
- Prevent unnecessary re-renders and race conditions.

## Suggested Time Split

| Concept                          |   Time |
| -------------------------------- | -----: |
| Event Handlers & Business Logic  | 20 min |
| Event Delegation & Propagation   | 20 min |
| Debounce & Throttle              | 25 min |
| Event Cleanup & Async Events     | 20 min |
| Keyboard Accessibility           | 15 min |
| Custom Event Hooks & Performance | 20 min |

## 15 Core Event Handling Principles

### 1. Keep Event Handlers Small

**Avoid:** Putting many unrelated tasks directly inside an inline event handler.

```jsx
<button
  onClick={() => {
    validate();
    save();
    sendAnalytics();
    showToast();
    navigate();
  }}
>
  Save
</button>
```

**Prefer:** Move the work into a named handler and focused functions.

```jsx
function handleSave() {
  validateForm();
  saveUser();
}

<button onClick={handleSave}>Save</button>;
```

### 2. Separate UI Events from Business Logic

**Avoid:** Fetching data and transforming it directly inside a UI event handler.

**Prefer:** Delegate business logic to service functions or custom hooks.

```js
function handleClick() {
  loadUsers();
}

async function loadUsers() {
  const users = await api.getUsers();
  userStore.set(users);
}
```

### 3. Use Event Delegation When Appropriate

For large lists, tables, menus, or tree views, a parent handler can handle events from its children instead of attaching a separate handler to every item.

```jsx
<ul onClick={handleListClick}>
  {items.map((item) => (
    <li key={item.id} data-id={item.id}>
      {item.name}
    </li>
  ))}
</ul>
```

```js
function handleListClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const item = target.closest("[data-id]");
  if (!item) return;

  const id = item.getAttribute("data-id");
  // Handle the selected item.
}
```

### 4. Debounce Expensive Events

**Problem:** Typing ten letters can trigger ten immediate API requests.

**Approach:** Debounce search, filter, and autocomplete input so work runs after the user pauses.

```jsx
const debouncedSearch = useDebounce(search, 300);
```

### 5. Throttle High-Frequency Events

**Problem:** Scrolling, resizing, or pointer movement can fire many events in a short time.

**Approach:** Throttle the handler when it only needs to run at a limited frequency.

```js
const throttledScroll = throttle(handleScroll, 200);
```

### 6. Clean Up Event Listeners

**Avoid:** Adding a listener without removing it when the effect is cleaned up.

```jsx
useEffect(() => {
  window.addEventListener("resize", handleResize);
}, []);
```

**Prefer:** Return a cleanup function.

```jsx
useEffect(() => {
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
```

### 7. Use Semantic Handler Names

**Avoid:** Vague handler names.

```jsx
<button onClick={click}>Continue</button>
```

**Prefer:** Names that describe the action.

```jsx
<button onClick={handleCheckout}>Checkout</button>
<button onClick={handleAddToCart}>Add to cart</button>
```

### 8. Use Stable Callbacks When They Help

Use `useCallback` when a stable function reference is useful, such as when passing a callback to a memoized child. It is not necessary for every handler.

```jsx
const handleUserSelect = useCallback(
  (id) => {
    selectUser(id);
  },
  [selectUser],
);
```

### 9. Support Keyboard Interaction

Use semantic interactive elements such as `<button>` and `<input>` so standard keyboard behavior works. Implement additional keyboard interactions for widgets such as menus, dialogs, and listboxes.

```js
function handleKeyDown(event) {
  if (event.key === "Escape") {
    closeDialog();
  }
}
```

### 10. Handle Event Propagation Properly

Clicking a button inside a clickable card may trigger both handlers because the click bubbles.

```js
function handleDelete(event) {
  event.stopPropagation();
  deleteItem();
}
```

Stop propagation only when the nested interaction should not trigger the parent action.

### 11. Use `preventDefault()` Correctly

Use `preventDefault()` when the browser's default action should not occur, such as when handling a form submission in JavaScript.

```js
function handleSubmit(event) {
  event.preventDefault();
  saveUser();
}
```

### 12. Extract Reusable Event Logic into Custom Hooks

Avoid repeating the same event-listener logic across components. Consider focused hooks such as:

- `useClickOutside()`
- `useKeyboardShortcut()`
- `useWindowSize()`
- `useOnlineStatus()`

### 13. Handle Asynchronous Events Safely

**Problem:** A search request for an older query may finish after a newer request and overwrite its results.

**Approach:** Cancel stale requests with `AbortController` or use a data-fetching library that handles request cancellation and stale results.

### 14. Keep Expensive Work Out of the Interaction Path

Avoid expensive calculations directly in render or in a handler when they can be prepared, simplified, or moved off the main interaction path. Use memoization only when it addresses a measured or expected performance cost.

### 15. Use Custom Events for Decoupled Components

Custom events can be useful in integration boundaries such as widgets or micro frontends. Prefer direct component callbacks or shared state for ordinary communication within a React application.

```js
window.dispatchEvent(new CustomEvent("user-logged-in"));
```

## Hands-on Practice Problem

### Build a Searchable User Directory

Build a user directory with:

- API-based autocomplete search.
- Debounced search requests.
- Keyboard navigation through results.
- Click-outside handling to close suggestions.
- Infinite scrolling for users.
- User selection and profile actions.
- Proper event-listener cleanup.
- Safe handling of rapid consecutive searches.
