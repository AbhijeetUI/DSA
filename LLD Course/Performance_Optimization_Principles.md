# Performance Optimization Principles

## Table of Contents

- [Why Performance Optimization Matters](#why-performance-optimization-matters)
- [1. Use Memoization for Expensive Work](#1-use-memoization-for-expensive-work)
- [2. Use `useCallback` for Stable Functions](#2-use-usecallback-for-stable-functions)
- [3. Use `React.memo` to Prevent Unneeded Renders](#3-use-reactmemo-to-prevent-unneeded-renders)
- [4. Lazy Load Components](#4-lazy-load-components)
- [5. Split the Code into Bundles](#5-split-the-code-into-bundles)
- [6. Virtualize Large Lists](#6-virtualize-large-lists)
- [7. Optimize Images](#7-optimize-images)
- [8. Reduce Bundle Size](#8-reduce-bundle-size)
- [9. Cache API Responses](#9-cache-api-responses)
- [10. Use Web Workers for Heavy Work](#10-use-web-workers-for-heavy-work)

---

## Why Performance Optimization Matters

| Technique                      | Benefit                                            |
| ------------------------------ | -------------------------------------------------- |
| Memoization                    | Avoids expensive recomputations.                   |
| Lazy loading                   | Reduces the initial bundle size.                   |
| Code splitting                 | Helps the application start faster.                |
| Virtualization                 | Handles large lists without rendering every item.  |
| Preventing unnecessary renders | Improves React performance.                        |
| Image optimization             | Helps pages load faster.                           |
| Bundle optimization            | Ships less JavaScript.                             |
| Tree shaking                   | Removes unused code.                               |
| Caching                        | Makes repeat visits faster.                        |
| CDN usage                      | Improves performance across locations.             |
| Prefetching                    | Makes navigation faster.                           |
| Web Workers                    | Move heavy computations away from the main thread. |

## 1. Use Memoization for Expensive Work

A calculation inside a component runs again when the component renders. If the calculation is expensive, `useMemo` can reuse its result until its dependencies change.

**Without memoization:**

```javascript
const filteredUsers = users.filter((user) => user.active);
```

This runs during every render.

**With memoization:**

```javascript
const filteredUsers = useMemo(() => {
  return users.filter((user) => user.active);
}, [users]);
```

## 2. Use `useCallback` for Stable Functions

A function created during render gets a new reference on the next render. `useCallback` can keep the function reference stable, which can help when passing it to a component wrapped in `React.memo`.

**New function on each render:**

```jsx
<UserCard onClick={() => handleUser(id)} />
```

**Stable function:**

```javascript
const handleUserClick = useCallback(() => {
  handleUser(id);
}, [handleUser, id]);
```

```jsx
<UserCard onClick={handleUserClick} />
```

## 3. Use `React.memo` to Prevent Unneeded Renders

`React.memo` can prevent a component from rendering again when its props have not changed. It is useful for components used in lists, tables, and dashboards.

```javascript
const UserCard = React.memo(function UserCard({ user }) {
  return <div>{user.name}</div>;
});
```

## 4. Lazy Load Components

Do not load the entire application up front when a component can be loaded later. Lazy loading can reduce the initial bundle and make the first load faster.

```javascript
const Dashboard = React.lazy(() => import("./Dashboard"));
```

## 5. Split the Code into Bundles

Split bundles by route, feature, or module so the application does not need to load all of its code at startup.

A dynamic import is one way to load a module separately:

```javascript
import("./Dashboard");
```

The lesson highlights faster startup as a benefit of code splitting.

## 6. Virtualize Large Lists

Rendering 100,000 rows at once is expensive. Virtualization renders only the rows that are visible instead of putting the entire list in the DOM.

```text
100,000 rows
      ↓
Render only visible rows
```

The lesson names these libraries:

- `react-window`
- `react-virtualized`

## 7. Optimize Images

Use image formats and loading strategies that help images load efficiently:

- WebP
- AVIF
- Responsive images
- Lazy loading

For example, an image that does not need to load immediately can use:

```html
<img src="image.webp" loading="lazy" alt="" />
```

## 8. Reduce Bundle Size

Avoid large libraries and unused dependencies when they are not needed. Use:

- Tree shaking to remove unused code
- Dynamic imports to load code when needed

A smaller bundle means less JavaScript is sent to the browser.

## 9. Cache API Responses

Caching API responses can make repeat visits faster and reduce network traffic.

The lesson names these options:

- TanStack Query
- SWR
- Browser cache

## 10. Use Web Workers for Heavy Work

Large calculations and data processing can take time on the main thread. Move heavy work to Web Workers so it does not block the main thread.
