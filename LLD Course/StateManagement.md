# State Management

**Course:** Chakde Frontend System Design - Machine Coding (LLD)  
**Duration:** 2.5 hours  
**Difficulty:** Intermediate to Advanced

## Module Goal

Learn how to manage React state without creating unnecessary complexity, inconsistent data, or performance issues.

## Learning Outcomes

- Place state at the right level.
- Avoid duplicated and derived state.
- Normalize complex state.
- Separate client state from server state.
- Use Context, custom hooks, and state libraries appropriately.
- Handle optimistic updates and complex workflows.
- Apply memoization and persistence strategically.

## Suggested Time Split

| Concept                                  |   Time |
| ---------------------------------------- | -----: |
| State Ownership & Single Source of Truth | 25 min |
| Derived & Normalized State               | 25 min |
| Client State vs Server State             | 25 min |
| Context, Custom Hooks & State Splitting  | 20 min |
| Optimistic Updates                       | 15 min |
| State Machines & Complex Workflows       | 20 min |
| Memoization & Persistence                | 20 min |

## 14 Core State Management Principles

### 1. Keep State as Close as Possible

**Avoid:** Storing input state in the top-level `App` component if that causes the entire app to re-render on every keystroke.

**Prefer:** Keep state in the specific component that uses it, such as `TodoInput`.

### 2. Maintain a Single Source of Truth

**Avoid:** Maintaining separate states for related values, such as `user` and `userName`, that can drift out of sync.

**Prefer:** Store the canonical data once.

```jsx
const [user, setUser] = useState({
  name: "Chirag",
  email: "xyz@gmail.com",
});
```

### 3. Derive State Instead of Duplicating It

If a value can be calculated from existing state, do not store a separate copy.

**Avoid:** Keeping an `itemCount` state alongside `items` and having to update both.

**Prefer:** Calculate it when needed.

```jsx
const itemCount = items.length;
```

### 4. Normalize Complex State

**Avoid:** Deeply nested structures that make updates cumbersome.

**Prefer:** Flat structures keyed by ID for easier updates and lookups.

```js
const state = {
  usersById: {
    1: { id: 1, name: "Chirag", postIds: [101] },
  },
  postsById: {
    101: { id: 101, userId: 1 },
  },
};
```

### 5. Use Immutable Updates

**Avoid:** Mutating state directly, which can prevent React from detecting changes.

```js
user.name = "John";
```

**Prefer:** Create a new object when updating state.

```jsx
setUser((previousUser) => ({
  ...previousUser,
  name: "John",
}));
```

### 6. Separate Server State and Client State

- **Client state:** Modal visibility, theme, dropdown state, and selected tabs. Manage it with tools such as `useState`, Context, Zustand, or Redux.
- **Server state:** Users, products, and orders fetched from an API. Consider dedicated server-state libraries such as TanStack Query, SWR, or Apollo Client.

### 7. Lift State Only When Needed

Keep state local unless multiple distinct components genuinely need to share it. Avoid lifting state higher than necessary.

### 8. Use Context Carefully

**Avoid:** Putting all application state into one large `AppContext`, which can cause broad re-renders and tight coupling.

**Prefer:** Split contexts by domain, such as `ThemeContext`, `AuthContext`, and `LanguageContext`.

### 9. Extract Logic into Custom Hooks

Group related state and effect logic into focused custom hooks, such as `useUsers()` or `useOnlineStatus()`.

### 10. Split Large State Objects

Avoid monolithic state objects that combine unrelated domains such as users, orders, cart, and filters. Separate them into focused stores or state slices.

### 11. Use Optimistic Updates Carefully

Update the UI immediately after a user action, send the API request in the background, and roll back or reconcile the UI if the request fails.

### 12. Use State Machines for Complex Workflows

**Avoid:** Managing several booleans such as `isLoading`, `isSuccess`, and `isError` when they can represent contradictory states.

**Prefer:** Use a single explicit status, or a state-machine library such as XState.

```js
const status = "idle"; // "loading", "success", or "error"
```

### 13. Memoize Expensive Derived State

Use `useMemo` when a calculation is expensive and does not need to run on every render.

```jsx
const filteredUsers = useMemo(
  () => users.filter(/* filtering condition */),
  [users],
);
```

### 14. Persist Only What Matters

- **Consider persisting:** Theme, language, and shopping cart.
- **Avoid persisting:** Loading states, temporary errors, and modal visibility.
- **Sensitive data:** Do not store authentication tokens in browser storage without carefully considering the security implications.

## State Management Decision Guide

| State type             | Possible solution                                   |
| ---------------------- | --------------------------------------------------- |
| Input field            | `useState`                                          |
| Form                   | `useState` or React Hook Form                       |
| Shared UI state        | Context                                             |
| Feature state          | Zustand                                             |
| Large enterprise state | Redux Toolkit                                       |
| Server state           | TanStack Query                                      |
| GraphQL state          | Apollo Client                                       |
| Complex workflow       | State machine (for example, XState)                 |
| Persistent state       | Local storage paired with a store, when appropriate |

Choose based on the application's needs; these are options, not strict rules.

## Hands-on Practice Problem

### Build a Task Management Dashboard

Build a task management application where users can:

- Create, edit, and delete tasks.
- Filter tasks by status and priority.
- Assign tasks to users.
- Open task details in a modal.
- Update task status optimistically.
- Fetch tasks from an API and handle loading, error, and retry states.
