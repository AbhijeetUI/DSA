# Data Rendering Principles

## Table of Contents

- [Why Data Rendering Matters](#why-data-rendering-matters)
- [1. Always Use Stable Keys](#1-always-use-stable-keys)
- [2. Separate Data from UI](#2-separate-data-from-ui)
- [3. Handle Loading, Error, and Empty States](#3-handle-loading-error-and-empty-states)
- [4. Derive State Instead of Storing It](#4-derive-state-instead-of-storing-it)
- [5. Memoize Expensive Computations](#5-memoize-expensive-computations)
- [6. Paginate Large Data Sets](#6-paginate-large-data-sets)
- [7. Virtualize Large Lists](#7-virtualize-large-lists)
- [8. Normalize Complex Data](#8-normalize-complex-data)
- [9. Render Small Components](#9-render-small-components)
- [10. Memoize Rows](#10-memoize-rows)
- [11. Use Skeleton Loaders](#11-use-skeleton-loaders)
- [12. Lazy Render Expensive Sections](#12-lazy-render-expensive-sections)
- [13. Avoid Heavy Logic Inside JSX](#13-avoid-heavy-logic-inside-jsx)
- [14. Cache API Data](#14-cache-api-data)
- [15. Use Empty States](#15-use-empty-states)

---

## Why Data Rendering Matters

| Principle                               | Why it matters                  |
| --------------------------------------- | ------------------------------- |
| Use stable keys                         | Supports correct rendering.     |
| Separate data and presentation          | Improves maintainability.       |
| Handle loading, error, and empty states | Improves the user experience.   |
| Memoize expensive computations          | Improves performance.           |
| Paginate large data sets                | Supports scalability.           |
| Virtualize large lists                  | Improves performance.           |
| Normalize data                          | Makes updates easier.           |
| Derive UI state                         | Avoids duplicated state.        |
| Lazy render expensive sections          | Improves performance.           |
| Use skeleton loaders                    | Improves perceived performance. |
| Componentize row rendering              | Improves reuse.                 |
| Cache rendered or API data              | Improves performance.           |

## 1. Always Use Stable Keys

Use a unique identifier for each item. Do not use the array index as a key when the list can be sorted, filtered, or changed.

**Avoid:**

```jsx
users.map((user, index) => <UserCard key={index} user={user} />);
```

Sorting, filtering, insertion, or deletion can lead to incorrect rendering when keys are based on position.

**Prefer:**

```jsx
users.map((user) => <UserCard key={user.id} user={user} />);
```

**Rule:** Use unique identifiers, not array indexes.

## 2. Separate Data from UI

Keep fetching, sorting, and filtering logic separate from the component that displays the list.

**Avoid:** Combining data fetching, sorting, filtering, and rendering inside `UserList`.

**Prefer:**

```jsx
const users = useUsers();

<UserList users={users} />;
```

This supports reusable UI, easier testing, and cleaner code.

## 3. Handle Loading, Error, and Empty States

Every data-rendering component should handle the state of its data.

```jsx
if (loading) {
  return <Skeleton />;
}

if (error) {
  return <ErrorMessage />;
}

if (!users.length) {
  return <EmptyState />;
}

return <UserList users={users} />;
```

The component should clearly handle loading, error, empty, and success states instead of trying to render data before it is ready.

## 4. Derive State Instead of Storing It

If a value can be calculated from existing state, do not store a second copy of it. Duplicate state can get out of sync.

**Avoid:**

```javascript
const [users, setUsers] = useState([]);
const [userCount, setUserCount] = useState(0);
```

**Prefer:**

```javascript
const userCount = users.length;
```

**Rule:** If it can be calculated, do not store it separately.

## 5. Memoize Expensive Computations

Filtering, sorting, searching, and grouping can be expensive. If the computation runs on every render, use `useMemo` to reuse the result until its dependencies change.

**Without memoization:**

```javascript
const filteredUsers = users.filter((user) => user.active);
```

**With memoization:**

```javascript
const filteredUsers = useMemo(() => {
  return users.filter((user) => user.active);
}, [users]);
```

## 6. Paginate Large Data Sets

Rendering 10,000 records at once can be expensive. Show a smaller page of records at a time.

```text
Page 1: 20 rows

Page 2: 20 rows
```

Pagination can improve rendering speed and memory usage.

## 7. Virtualize Large Lists

A list with 100,000 rows can make the browser slow if every row is rendered. Virtualization renders only the visible rows.

The lesson names these libraries:

- `react-window`
- `react-virtualized`

## 8. Normalize Complex Data

Deeply nested data can be harder to look up and update. Keep records in maps keyed by ID instead.

**Nested data:**

```javascript
const data = {
  users: [
    {
      id: 1,
      posts: [
        /* ... */
      ],
    },
  ],
};
```

**Normalized data:**

```javascript
const data = {
  usersById: {},
  postsById: {},
};
```

Normalization supports faster lookup and easier updates.

## 9. Render Small Components

Break a large component into smaller components with clear responsibilities.

**Instead of one large table component:**

```jsx
<Table>
  <TableHeader />
  <TableBody>
    <TableRow />
  </TableBody>
</Table>
```

Smaller components improve reuse and make testing easier.

## 10. Memoize Rows

Rows in tables, dashboards, and large lists can be memoized to help prevent unnecessary rerenders.

```javascript
const UserRow = React.memo(function UserRow({ user }) {
  return <div>{user.name}</div>;
});
```

## 11. Use Skeleton Loaders

A blank screen gives users no feedback while data is loading. Use a skeleton to show the shape of the content that is on its way.

```text
Blank screen
    ↓
Loading skeleton
    ↓
Rendered data
```

Skeleton loaders can make loading feel faster to users.

## 12. Lazy Render Expensive Sections

Load an expensive section only when it is needed. The lesson gives an analytics chart as an example.

```javascript
const AnalyticsChart = React.lazy(() => import("./AnalyticsChart"));
```

Loading it only when needed can make startup faster.

## 13. Avoid Heavy Logic Inside JSX

Do not put a long chain of filtering, sorting, and mapping directly inside JSX. Prepare the data before rendering.

**Avoid:**

```jsx
return users
  .filter((user) => user.active)
  .sort((first, second) => first.name.localeCompare(second.name))
  .map((user) => <UserRow key={user.id} user={user} />);
```

**Prefer:**

```javascript
const visibleUsers = useMemo(() => {
  return users
    .filter((user) => user.active)
    .sort((first, second) => first.name.localeCompare(second.name));
}, [users]);
```

```jsx
return visibleUsers.map((user) => <UserRow key={user.id} user={user} />);
```

Separating the logic keeps rendering cleaner and faster.

## 14. Cache API Data

Use a data-fetching library to cache API data. The lesson names:

- TanStack Query
- SWR

The listed benefits are caching, refetching, request deduplication, and fewer unnecessary renders.

## 15. Use Empty States

Do not leave the interface blank when there are no results. Show a useful empty state.

```text
No Users Found
[Create User]
```

A clear empty state can improve the user experience.
