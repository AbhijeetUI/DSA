# Component Design

**Course:** Chakde Frontend System Design - Machine Coding (LLD)  
**Duration:** 2 hours  
**Difficulty:** Intermediate → Advanced

## Module Goal

Learn how to design React components that are reusable, maintainable, scalable, and production-ready instead of creating large, tightly coupled components.

## Learning Outcomes

- Build small, reusable components.
- Use composition and clear component APIs.
- Separate UI from business logic.
- Extract reusable logic with custom hooks.
- Apply controlled and compound component patterns.
- Avoid prop drilling with Context and Providers.
- Design accessible and resilient components.
- Optimize performance without premature memoization.

## Suggested Time Split

| Concept                                        |   Time |
| ---------------------------------------------- | -----: |
| Reusable Components & Composition              | 20 min |
| Component Responsibility & UI/Logic Separation | 20 min |
| Custom Hooks & Controlled Components           | 25 min |
| Component APIs & Compound Components           | 20 min |
| Context, Providers & Architecture              | 15 min |
| Accessibility & Error Boundaries               | 10 min |
| Memoization & Performance                      | 10 min |

## 12 Core Component Design Principles

### 1. Build Small, Reusable Components

**Avoid:** Creating separate components for every variation.

```jsx
<UserProfileCard />
<UserProfileCardForAdmin />
<UserProfileCardForGuest />
```

**Prefer:** Generic components customized through props.

```jsx
<UserCard name="Chirag" role="Admin" />
```

### 2. Prefer Composition Over Configuration

**Avoid:** Passing numerous boolean flags that become unmaintainable.

```jsx
<Card showHeader showFooter showAvatar showActions />
```

**Prefer:** Sub-components and composition.

```jsx
<Card>
  <Card.Header content="" />
  <Card.Body />
  <Card.Footer />
</Card>
```

### 3. Keep Components Focused (Single Responsibility)

**Avoid:** A single 1,000+ line component handling data fetching, form validation, chart rendering, modals, and authentication.

**Prefer:** Break the interface into focused components.

```text
Dashboard
├── ChartSection
├── UserList
├── Filters
└── Modal
```

### 4. Extract Logic into Custom Hooks

**Avoid:** Repeating the same `useEffect` logic across multiple components.

**Prefer:** Extract clean, testable hooks.

```jsx
const users = useUsers({ page, size });
const userById = useUserById(id);
const isOnline = useOnlineStatus();
```

### 5. Prefer Controlled Components

**Avoid:** Over-relying on uncontrolled elements (`useRef`) everywhere.

```jsx
<input ref={inputRef} />
```

**Prefer:** Controlled state for predictability, validation, and testing.

```jsx
<Input value={value} onChange={setValue} />
```

### 6. Separate UI from Business Logic

**Avoid:** Putting `fetchData()`, `transformData()`, and UI rendering all inside a `<UserTable>` component.

**Prefer:** Keep UI presentational while hooks handle data and state.

```jsx
const users = useUsers(filter);

const handleFilter = () => {
  // Update state.
};

return (
  <>
    <UserFilter onFilterChange={handleFilter} />
    <UserTable users={users} />
  </>
);
```

### 7. Design Clear Component APIs

**Avoid:** Vague or inconsistent prop names.

```jsx
<Button isPrimary isBig isBlue />
```

**Prefer:** Predictable and scalable APIs.

```jsx
<Button variant="primary" size="large" />
```

### 8. Use Compound Components for Related UI

Compound components work well for tabs, accordions, dropdowns, and selects.

```jsx
<Tabs>
  <Tabs.List>
    <Tabs.Tab />
  </Tabs.List>
  <Tabs.Panel />
</Tabs>
```

### 9. Avoid Deep Prop Drilling

**Avoid:** Passing props through many layers of components (for example, `App → Layout → Sidebar → Menu → Button`).

**Prefer:** Use Context Providers when appropriate.

```jsx
<ThemeProvider>
  <App />
</ThemeProvider>;

// Inside a descendant component:
const theme = useTheme();
```

### 10. Optimize Only When Needed

Use `React.memo()`, `useMemo()`, and `useCallback()` strategically for cases such as large tables, dashboards, and infinite scroll. Avoid premature optimization.

### 11. Build Accessible Components

Ensure reusable components support appropriate ARIA attributes (such as `aria-label`, `role`, and `tabIndex`) and keyboard navigation (Tab, Enter, Escape, and arrow keys).

### 12. Handle Errors Gracefully

Wrap feature sections in Error Boundary components so an error in one section does not crash the entire application.

```jsx
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
```

## Recommended Component Architecture

```text
src/
├── components/
│   └── ui/
│       ├── Button
│       ├── Modal
│       └── Input
├── features/
│   ├── Auth
│   ├── Users
│   └── Dashboard
├── hooks/
│   ├── useFetch
│   └── useDebounce
├── providers/
│   ├── ThemeProvider
│   └── AuthProvider
└── pages/
```

## Hands-on Practice Problem

### Build a Reusable User Management Dashboard

Build a React dashboard that displays users with filtering, user details, and reusable UI components.

**Requirements:**

- Create reusable `Button`, `Input`, `Modal`, and `UserCard` components.
- Use props-driven APIs instead of component-specific variations.
- Extract data-fetching and UI logic into custom hooks.
- Keep business logic separate from presentation.
- Use composition for the user details modal.
- Avoid unnecessary prop drilling.
- Handle loading and error states.
- Make the components keyboard accessible.
