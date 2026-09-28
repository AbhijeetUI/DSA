# React & JavaScript Core Concepts Guide

## Table of Contents

1. [Referential Equality in JavaScript & React](#1-referential-equality-in-javascript--react)
   - [What Is Referential Equality?](#what-is-referential-equality)
   - [Why It Matters in React](#why-it-matters-in-react)
   - [How to Preserve Referential Equality](#how-to-preserve-referential-equality)
   - [Common Pitfalls](#common-pitfalls)
   - [Deep Dive Questions](#deep-dive-questions)
   - [Review Checklist](#review-checklist)
2. [Stale Closures in JavaScript & React](#2-stale-closures-in-javascript--react)
   - [What Is a Stale Closure?](#what-is-a-stale-closure)
   - [Why It Happens in React](#why-it-happens-in-react)
   - [How to Fix It](#how-to-fix-it)
   - [Common Pitfalls](#common-pitfalls-1)
   - [Deep Dive Questions](#deep-dive-questions-1)
   - [Review Checklist](#review-checklist-1)
3. [How `useState` Works Under the Hood](#3-how-usestate-works-under-the-hood)
   - [Internal Data Structure](#internal-data-structure)
   - [Three Phases of `useState`](#three-phases-of-usestate)
   - [Why the Rules of Hooks Matter](#why-the-rules-of-hooks-matter)
   - [Best Practices](#best-practices)
   - [Deep Dive Questions](#deep-dive-questions-2)
   - [Review Checklist](#review-checklist-2)
4. [React Rendering and Re-render Optimization](#4-react-rendering-and-rerender-optimization)
   - [Why React Rerenders](#why-react-rerenders)
   - [What Triggers Re-renders](#what-triggers-re-renders)
   - [How to Avoid Unnecessary Re-renders](#how-to-avoid-unnecessary-rerenders)
   - [When to Use `React.memo`, `useMemo`, and `useCallback`](#when-to-use-reactmemo-usememo-and-usecallback)
   - [Production Realities](#production-realities)
   - [Deep Dive Questions](#deep-dive-questions-3)
   - [Review Checklist](#review-checklist-3)
5. [State Management and Architectural Thinking](#5-state-management-and-architectural-thinking)
   - [Client State vs Server State](#client-state-vs-server-state)
   - [Context API vs Redux Toolkit](#context-api-vs-redux-toolkit)
   - [Where Each Fits in Production](#where-each-fits-in-production)
   - [Trade-offs and Decision Framework](#trade-offs-and-decision-framework)
   - [Deep Dive Questions](#deep-dive-questions-4)
   - [Review Checklist](#review-checklist-4)
6. [JavaScript Execution Model and Scope Fundamentals](#6-javascript-execution-model-and-scope-fundamentals)
   - [Memory Model and Reference Semantics](#memory-model-and-reference-semantics)
   - [Closures](#closures)
   - [Execution Context and Event Loop](#execution-context-and-event-loop)
   - [Why This Matters in React](#why-this-matters-in-react)
   - [Deep Dive Questions](#deep-dive-questions-5)
   - [Review Checklist](#review-checklist-5)
7. [Frontend System Design Lens for Interviews](#7-frontend-system-design-lens-for-interviews)
   - [Production Scalability Questions](#production-scalability-questions)
   - [Common Architecture Trade-offs](#common-architecture-trade-offs)
   - [Must-Know Patterns](#must-know-patterns)
   - [System Design Checklist](#system-design-checklist)
8. [Interview Preparation Playbook](#8-interview-preparation-playbook)
   - [How to Answer Product-Based Company Questions](#how-to-answer-product-based-company-questions)
   - [What Strong Answers Include](#what-strong-answers-include)
   - [Final Revision Plan](#final-revision-plan)

---

# 1. Referential Equality in JavaScript & React

## What Is Referential Equality?

In JavaScript, referential equality means two variables point to the exact same location in memory, rather than merely sharing equal values.

JavaScript divides data into two major categories:

1. Primitive types: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`
   - Compared by value
2. Reference types: `Object`, `Array`, `Function`
   - Compared by memory address

### Example: Primitive comparison

```javascript
const a = "hello";
const b = "hello";

console.log(a === b); // true
```

This works because both values are equal by content.

### Example: Reference comparison

```javascript
const obj1 = { name: "Alice" };
const obj2 = { name: "Alice" };
const obj3 = obj1;

console.log(obj1 === obj2); // false
console.log(obj1 === obj3); // true
```

Even though `obj1` and `obj2` look identical, they are different objects in memory. `===` checks whether the memory reference is the same.

### Why this matters

The strict equality operator does not compare object contents. It compares reference identity.

```javascript
const arr1 = [1, 2, 3];
const arr2 = [1, 2, 3];

console.log(arr1 === arr2); // false
```

Even with the same data, the references differ.

---

## Why It Matters in React

React relies heavily on shallow comparisons to decide whether to re-render, recompute memoized values, and re-run effects.

### A. Component re-renders

When a component renders, objects, arrays, and functions created inside that render are created again with new references.

```javascript
function Parent() {
  const settings = { theme: "dark" };
  return <Child settings={settings} />;
}
```

On every render, `settings` is created again. That means even if `Child` is wrapped in `React.memo`, a new prop reference is passed, and React may decide to re-render.

### B. Hook dependency triggers

`useEffect`, `useMemo`, and `useCallback` evaluate dependency arrays using referential equality.

```javascript
function UserProfile({ userId }) {
  const filters = ["active", "verified"];

  useEffect(() => {
    fetchUserData(userId, filters);
  }, [filters]); // Re-runs every render
}
```

Because `filters` is a new array every render, the effect runs again unnecessarily.

### Why, How, Where to use

- Why: React optimization depends on stable references.
- How: Keep static data outside the component or memoize values.
- Where: In large forms, lists, expensive calculations, callbacks passed to child components.

---

## How to Preserve Referential Equality

### 1. Move static values outside the component

If the data does not depend on props or state, keep it outside the component so it is created once.

```javascript
const FILTERS = ["active", "verified"];

function UserProfile({ userId }) {
  useEffect(() => {
    fetchUserData(userId, FILTERS);
  }, [userId]);
}
```

This creates a stable reference across renders.

### 2. Use `useMemo` for computed objects or arrays

```javascript
function Profile({ user, preferences }) {
  const settings = useMemo(() => ({
    theme: preferences.theme,
    compact: preferences.compact,
  }), [preferences.theme, preferences.compact]);

  return <Dashboard settings={settings} />;
}
```

`useMemo` keeps the same object reference unless relevant dependencies change.

### 3. Use `useCallback` for function props

```javascript
const handleClick = useCallback(() => {
  console.log("Clicked");
}, []);
```

This avoids passing a fresh function reference on every render, which matters when a child is memoized.

### 4. Use `useRef` for persistent references

```javascript
const latestValueRef = useRef(null);
latestValueRef.current = value;
```

`useRef` holds a stable object identity across renders.

---

## Common Pitfalls

### Pitfall 1: Memoizing without understanding dependencies

```javascript
const data = useMemo(() => {
  return computeData(input);
}, []); // Risky if input changes
```

This results in stale values if dependencies are missing.

### Pitfall 2: Overusing `useMemo`

Memoization has cost. It increases memory usage and object lifetime. Use it only when the cost of recomputing or rerendering is real.

### Pitfall 3: Creating objects inline in render

```javascript
const props = { id: user.id };
```

This is okay once, but repeated inside render can trigger unnecessary re-renders in memoized trees.

### Pitfall 4: Using array index as a key in lists

```javascript
items.map((item, index) => <Row key={index} />)
```

This causes bugs during insertions, deletions, and reordering. Prefer stable IDs.

---

## Deep Dive Questions

1. Why does `{ name: "A" } === { name: "A" }` return false even when they look identical?
2. How does referential equality affect `React.memo`? Explain with an example.
3. What is the difference between value equality and reference equality?
4. When should you avoid `useMemo` and `useCallback`?
5. How would you design a memoized list of expensive rows in a production table component?

---

## Review Checklist

- [ ] I can explain value vs reference equality clearly.
- [ ] I know why new references cause React re-renders.
- [ ] I can explain the effect of `useMemo` and `useCallback` on reference stability.
- [ ] I understand when memoization helps and when it hurts.
- [ ] I can identify common reference bugs in production React apps.

---

# 2. Stale Closures in JavaScript & React

## What Is a Stale Closure?

A stale closure happens when a function captures variables from an older render or an outer lexical scope and continues using those old values even after the environment changed.

### Example in JavaScript

```javascript
let count = 0;

setTimeout(() => {
  console.log(count); // logs the value at the time the closure was created
}, 1000);

count = 5;
```

The callback closes over the value of `count` as it existed when the function was created.

---

## Why It Happens in React

React components are functions that rerun on each render. Each render creates a new scope with its own state and props.

### Example 1: `useEffect` with empty dependency array

```javascript
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <h1>{count}</h1>;
}
```

### Execution Flow

1. Render 1: `count = 0`
2. `useEffect` runs once and captures `count = 0`
3. Timer callback keeps using that stale `0`
4. State never updates correctly

This leads to the interval always setting `1`, not incrementing properly.

### Example 2: Async event callback

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  const handleAlert = () => {
    setTimeout(() => {
      alert(`Count is: ${count}`);
    }, 3000);
  };

  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={handleAlert}>Alert Count in 3s</button>
    </>
  );
}
```

If the user clicks increment multiple times before the timeout resolves, the alert shows the old value from the render where the callback was created.

---

## How to Fix It

### 1. Use functional state updates

```javascript
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prevCount => prevCount + 1);
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

This ensures every update uses the latest state.

### 2. Include correct dependencies

```javascript
useEffect(() => {
  const timer = setInterval(() => {
    console.log(`Count is ${count}`);
  }, 1000);

  return () => clearInterval(timer);
}, [count]);
```

This recreates the closure whenever `count` changes.

### 3. Use `useRef` to store the latest value

```javascript
const countRef = useRef(count);
countRef.current = count;

useEffect(() => {
  const timer = setInterval(() => {
    console.log(`Latest count: ${countRef.current}`);
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

This is useful when you need access to the latest state without re-registering effects.

### Why, How, Where to use

- Why: State in React is re-created per render, so closures can become stale.
- How: Use functional updates, maintain dependency arrays, and keep latest values in refs.
- Where: Timers, event handlers, async APIs, polling logic, debounced search handlers.

---

## Common Pitfalls

### Pitfall 1: Empty dependency arrays when using external state

```javascript
useEffect(() => {
  fetchData(query);
}, []);
```

If `query` changes, the effect still uses stale data.

### Pitfall 2: Using stale values inside callbacks passed to child props

```javascript
const onSelect = () => {
  console.log(selectedId);
};
```

If `selectedId` changes but the callback is not refreshed, stale data persists.

### Pitfall 3: Relying on object identity instead of value truth

```javascript
const user = { id: 1 };
const prevUser = user;
```

Old object references can be reused unexpectedly if not treated carefully.

---

## Deep Dive Questions

1. Why does React re-run the component function on every render?
2. What is the difference between stale closure and stale state?
3. Why do missing dependencies in `useEffect` produce bugs?
4. How do functional updates protect against stale closures?
5. When is `useRef` a better fix than including dependencies in a hook?

---

## Review Checklist

- [ ] I understand how closures capture old values.
- [ ] I know when missing dependencies create stale bugs.
- [ ] I can explain `useRef` as a stable value holder.
- [ ] I can fix stale closure issues with functional updates.
- [ ] I follow the pattern of keeping logic reactive and consistent with actual state.

---

# 3. How `useState` Works Under the Hood

## Internal Data Structure

React does not keep state in local function variables permanently. Component state is stored in internal React structures called fibers.

### Fiber structure

```text
Fiber Node
└── memoizedState ──► Hook 1
                    ├── memoizedState: current value
                    ├── queue: pending updates
                    └── next ──► Hook 2
                                      └── next ──► null
```

Each hook stored in a linked list contains:

- `memoizedState`: current state value
- `queue`: pending updates
- `next`: next hook in the linked list

This linked list preserves hook order across renders.

---

## Three Phases of `useState`

### Phase 1: Mount phase (`mountState`)

On first render:

1. React allocates a new hook object.
2. It initializes `memoizedState` with the initial state.
3. It attaches the hook to the Fiber linked list.
4. It creates a dispatch function for updating state.

```javascript
const [count, setCount] = useState(0);
```

During mount, React sets the hook up with an internal queue and a dispatcher.

### Phase 2: Update invocation (`dispatchSetState`)

When an updater is called:

```javascript
setCount(1);
setCount(prev => prev + 1);
```

React:

1. Creates an internal update object.
2. Pushes it into the hook queue.
3. Checks whether the next state is actually different.
4. If changed, marks the Fiber as dirty and schedules a render.

### Phase 3: Re-render phase (`updateState`)

When React re-renders:

1. It walks the hook linked list.
2. It processes all queued updates in order.
3. It recomputes the next state.
4. It updates `memoizedState`.

This is why state updates are predictable and sequenced.

---

## Why the Rules of Hooks Matter

Hooks are matched by their order of execution, not by name.

```javascript
function Component() {
  const [count, setCount] = useState(0);

  if (condition) {
    const [value, setValue] = useState(1); // Wrong
  }
}
```

This breaks the linked-list order. React expects the sequence of hooks to remain stable across renders.

### Must-know principle

- Hooks must run in the same order on every render.
- Never call hooks in loops, conditions, or nested functions.

---

## Best Practices

### Use state updates functionally when dependent on previous state

```javascript
setCount(prev => prev + 1);
```

This is safer than `setCount(count + 1)` when multiple updates happen in the same event cycle.

### Keep hook order stable

- Put all hook calls at top level.
- Do not hide them behind `if` statements.

### Understand batching

React batches multiple state updates in a single event.

```javascript
setCount(1);
setCount(2);
```

The final state may be processed together, depending on the update pattern.

---

## Deep Dive Questions

1. Why are hooks stored in a linked list instead of a plain object?
2. How does React maintain state across renders without keeping local variables alive?
3. What happens if the order of hook calls changes between renders?
4. Why does `setState` run asynchronously in some cases?
5. Explain batching and why it matters for performance.

---

## Review Checklist

- [ ] I understand how hooks are stored in a linked list.
- [ ] I can explain mount, update, and re-render phases.
- [ ] I know why hook order must remain stable.
- [ ] I can describe how batching works.
- [ ] I know how to avoid stale or incorrect state updates.

---

# 4. React Rendering and Re-render Optimization

## Why React Rerenders

A component rerenders when:

- its state changes,
- its props change,
- a parent rerenders,
- a context value changes,
- a forced update happens.

React is not “smart” in the sense of selectively recalculating everything. It renders the tree from the changed node upward.

---

## What Triggers Re-renders

### State changes

```javascript
const [count, setCount] = useState(0);
```

Any update to `count` triggers a rerender of the component.

### Parent rerenders

```javascript
function Parent() {
  const [value, setValue] = useState(0);
  return <Child value={value} />;
}
```

Even if `Child` is memoized, it may still rerender because the parent rerender created new props.

### Context changes

```javascript
const ThemeContext = createContext();
```

Context value updates notify all consumers and can trigger a broad rerender cascade.

---

## How to Avoid Unnecessary Re-renders

### 1. Keep state as local as possible

State should live closest to the component that uses it. Avoid putting all app state at the top unless necessary.

### 2. Split components responsibly

If a child does not need parent state, keep it separate from the parent component tree.

### 3. Use `React.memo`

```javascript
const ExpensiveCard = React.memo(function ExpensiveCard({ user }) {
  return <div>{user.name}</div>;
});
```

This prevents rerender when props are shallow-equal.

### 4. Use immutable updates

React depends on reference changes to detect updates. Mutating objects in place breaks this model.

```javascript
// bad
items.push(newItem);

// good
setItems(prev => [...prev, newItem]);
```

### 5. Avoid unnecessary context providers

A big provider update can cause many components to rerender even if they don’t need the changed value.

---

## When to Use `React.memo`, `useMemo`, and `useCallback`

### `React.memo`

Use for components that render frequently but receive stable props.

```javascript
const Row = React.memo(({ item }) => <div>{item.name}</div>);
```

Best for large lists, expensive dashboard components, and child components with stable props.

### `useMemo`

Use for expensive calculations or object creation that depend on inputs.

```javascript
const filteredItems = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);
```

Avoid overuse. The cost of memoization may exceed the cost of recomputation.

### `useCallback`

Use when passing functions to memoized children.

```javascript
const handleDelete = useCallback((id) => {
  deleteItem(id);
}, [deleteItem]);
```

This preserves function identity when children rely on referential equality.

---

## Production Realities

A common mistake is optimizing prematurely without measuring.

### Good principle

- Profile first.
- Use React DevTools profiler.
- Identify actual bottlenecks.
- Optimize the hot path only.

### Example: A huge table

Rendering 10,000 rows in the DOM is expensive. The real fix is virtualization.

```text
Viewport
+--------------------------+
| visible rows only        |
| +----+                   |
| |row |                   |
| +----+                   |
+--------------------------+
```

Only a small visible subset of rows is rendered at a time.

---

## Deep Dive Questions

1. Why can `React.memo` still fail to prevent re-renders?
2. What is the difference between `useMemo` and `useCallback` in practice?
3. How do you detect expensive rerenders in a real app?
4. Why is context update propagation a risk for large apps?
5. When would virtualization be necessary in a production table?

---

## Review Checklist

- [ ] I know what triggers a React re-render.
- [ ] I can explain memoization trade-offs.
- [ ] I understand when to use `memo`, `useMemo`, and `useCallback`.
- [ ] I know how to avoid unnecessary rerender cascades.
- [ ] I understand the importance of profiling before optimization.

---

# 5. State Management and Architectural Thinking

## Client State vs Server State

### Client state

Examples:

- modal visibility
- dark mode
- form drafts
- current filter selection

This usually changes in the UI and is local to the app experience.

### Server state

Examples:

- API response data
- user profiles
- product lists
- orders

This is fetched, cached, invalidated, and synced over time.

### Production strategy

Do not mix both in the same state model.

- Use React Query / TanStack Query / RTK Query for server data.
- Use Redux Toolkit, Zustand, or Context for client UI state.

---

## Context API vs Redux Toolkit

### Context API

Best for:

- theme
- auth state
- UI preference settings
- dependency injection patterns

#### Pros

- simple
- low setup cost
- good for app-level settings

#### Cons

- re-renders all consumers on provider update
- not ideal for high-frequency updates

### Redux Toolkit

Best for:

- large data models
- complex state transitions
- high-frequency updates
- predictable state evolution

#### Pros

- centralized state logic
- consistent patterns
- good for large-scale frontend apps

#### Cons

- more boilerplate than Context
- can be overkill for simple apps

### Must-know principle

Context is not a full state management system. It is mainly a way to avoid prop drilling.

---

## Where Each Fits in Production

### Use Context when

- you need a theme or locale
- you need auth info to be globally available
- the value changes infrequently

### Use Redux Toolkit when

- the app has large shared data
- multiple components react to the same state changes
- your state needs predictable reducer-based transitions

### Use React Query when

- data is server-driven
- you need caching, pagination, background refetch, retries
- multiple components show the same API result

---

## Trade-offs and Decision Framework

When designing app architecture, ask:

1. Is this data from the backend or local UI?
2. Does it update frequently?
3. Does many components depend on it?
4. Does it need caching and retry logic?
5. Is the state part of business logic or purely UI behavior?

### Decision matrix

```text
Local UI state          -> useState / Context / Zustand
Shared app state        -> Redux Toolkit / Zustand
Server data             -> React Query / RTK Query / SWR
```

---

## Deep Dive Questions

1. Why is mixing server state and client state harmful?
2. When would you choose Context over Redux?
3. What does Redux do well that Context does not?
4. How do you design state architecture for a large dashboard app?
5. What are the signs an app is overusing global state?

---

## Review Checklist

- [ ] I can distinguish client state from server state.
- [ ] I can state when to use Context vs Redux.
- [ ] I know when to use server-data caching libraries.
- [ ] I can describe architectural trade-offs in real systems.
- [ ] I understand that app architecture is about fit, not preference.

---

# 6. JavaScript Execution Model and Scope Fundamentals

## Memory Model and Reference Semantics

JavaScript has two memory behaviors:

- primitive values are copied by value
- object values are copied by reference

### Example

```javascript
let a = 10;
let b = a;
b = 20;
console.log(a); // 10

let obj1 = { x: 1 };
let obj2 = obj1;
obj2.x = 2;
console.log(obj1.x); // 2
```

This is why mutation of objects has cross-cutting effects.

---

## Closures

A closure is created when a function retains access to variables from its outer lexical scope even after the outer function returns.

```javascript
function outer() {
  const message = "Hello";

  return function inner() {
    console.log(message);
  };
}

const fn = outer();
fn(); // Hello
```

Closures are powerful but can also lead to stale references if not handled carefully.

---

## Execution Context and Event Loop

JavaScript runs in a single-threaded event loop.

### Basic model

```text
Call Stack        -> currently executing function calls
Web APIs          -> timers, network, click handlers
Task Queue        -> callbacks waiting to run
Event Loop        -> moves tasks from queue to stack when free
```

This is why asynchronous code is handled via promises, timers, and event handlers.

### Why that matters in React

React state updates and effects often depend on asynchronous callback timing, rendering async tasks, or scheduled work. If your understanding of the event loop is weak, stale closures and timing bugs become likely.

---

## Why This Matters in React

React uses closure semantics heavily.

- state values are captured per render
- effects depend on closure values
- asynchronous callbacks may read stale data
- event handlers should be careful with latest state access

This is why functional updates and dependency arrays are so important.

---

## Deep Dive Questions

1. Explain the difference between by-value and by-reference assignment.
2. Why do closures capture variables instead of copies?
3. How does the event loop interact with React state updates?
4. Why can asynchronous code show stale values in React?
5. What is the relationship between closures and stale state bugs?

---

## Review Checklist

- [ ] I know the difference between primitive and reference semantics.
- [ ] I can explain closures with a concrete example.
- [ ] I understand the event loop and why async code behaves the way it does.
- [ ] I know how these fundamentals show up in React components.
- [ ] I can identify stale data bugs caused by closure capture.

---

# 7. Frontend System Design Lens for Interviews

## Production Scalability Questions

Strong frontend engineers do not just know APIs. They reason about architecture under load:

- How many users?
- How much data is rendered?
- Is the app doing client-side heavy work?
- Is the backend the limiting factor or the browser?

### Example production concerns

- large dashboards
- infinite scroll feeds
- analytics-heavy UIs
- multi-region latency
- API cache invalidation problem

---

## Common Architecture Trade-offs

### Monolith vs micro-frontends

- Monolith: simpler coordination, easier deployment
- Micro-frontends: independent teams, but more integration complexity

### CSR vs SSR vs SSG

- CSR: good for interactive apps
- SSR: better for SEO and initial load
- SSG: best for static content with low change frequency

### Feature-based vs type-based folders

- Feature-based scales better in medium / large apps
- Type-based structure works for small or early teams

---

## Must-Know Patterns

- keep UI state local
- use server-data caching libraries
- separate concerns by feature domain
- use controlled state in forms when validation matters
- prefer native semantic HTML for accessibility
- keep critical rendering path fast
- use virtualization for large lists

---

## System Design Checklist

- [ ] I can explain why a feature-based folder structure helps in large apps.
- [ ] I know the difference between server and client state.
- [ ] I understand when to use SSR, CSR, or SSG.
- [ ] I can reason about API caching and invalidation strategies.
- [ ] I know what production bottlenecks to look for first.

---

# 8. Interview Preparation Playbook

## How to Answer Product-Based Company Questions

A strong answer is not just “I built X”. It should include:

- context
- business problem
- architecture decision
- trade-offs
- measurable outcomes

### Example answer structure

1. Situation: what problem existed?
2. Task: what was your responsibility?
3. Action: what did you design or implement?
4. Result: what impact did it have?

### Example

> We had a product dashboard with heavy API load and poor initial render speed. I redesigned the data-loading layer using server-state caching and split heavy UI into lazy-loaded chunks. This reduced initial JS weight and improved the user wait time for key actions.

This answer is better than pure implementation detail because it includes business value.

---

## What Strong Answers Include

- actual numbers or measurable improvements where possible
- trade-offs and constraints
- awareness of performance, accessibility, and maintainability
- decisions based on real production needs
- clear reasoning for why a pattern was chosen

---

## Final Revision Plan

### Before interviews

1. Review all key concepts with examples.
2. Practice explaining them out loud.
3. Link theory to production scenarios.
4. Prepare at least 5 medium-hard questions for each major area.
5. Be ready to discuss trade-offs and caveats.

### Weekly cycle

- Monday: JavaScript fundamentals and closures
- Tuesday: React rendering and memoization
- Wednesday: hooks and state internals
- Thursday: accessibility and performance
- Friday: architecture and system design discussion

---

# Final Must-Know Points

## High-value concepts to memorize

- Referential equality decides whether React thinks something changed.
- Stale closures happen when older values are captured by async callbacks or effect closures.
- `useState` is implemented using internal Fiber hook objects.
- Hook order must stay stable for React to map state correctly.
- Client state and server state should be separated architecturally.
- Rendering performance is often improved by reducing DOM work and avoiding unnecessary re-renders.
- Semantic HTML and accessibility are not optional—they are core engineering quality.

## Interview mindset

The best frontend candidates explain not just what they know, but why a solution fits a production environment. Good answers show practical judgment, performance awareness, and deep understanding of browser and React internals.

---

# Appendix: Quick Example Summary

```javascript
const items = [1, 2, 3];
const memoized = useMemo(() => items.filter(Boolean), [items]);
const handleClick = useCallback(() => console.log("click"), []);
```

- `useMemo` stabilizes derived data references.
- `useCallback` stabilizes function references.
- Both help when passing values to memoized child components.

```javascript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setCount(prev => prev + 1);
  }, 1000);

  return () => clearTimeout(timeoutId);
}, []);
```

This pattern is safe because it uses the latest state via functional update and avoids stale closure issues.

---

This document is designed to be directly used for revision before product-based company interviews. It combines deep conceptual understanding, production-level reasoning, and practical interview preparation in a single study guide.
