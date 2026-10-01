# React & JavaScript Core Concepts Study Guide for Product-Based Interviews

## Table of Contents

1. [What this guide is for](#what-this-guide-is-for)
2. [1. Referential Equality in JavaScript and React](#1-referential-equality-in-javascript-and-react)
3. [2. Stale Closures in JavaScript and React](#2-stale-closures-in-javascript-and-react)
4. [3. How `useState` Works Under the Hood](#3-how-usestate-works-under-the-hood)
5. [4. React Rendering and Re-render Optimization](#4-react-rendering-and-rerender-optimization)
6. [5. State Management and Architecture](#5-state-management-and-architecture)
7. [6. JavaScript Execution Model and Scope Fundamentals](#6-javascript-execution-model-and-scope-fundamentals)
8. [7. Async JavaScript, Event Loop, and Production Bugs](#7-async-javascript-event-loop-and-production-bugs)
9. [8. Common JavaScript Interview Patterns](#8-common-javascript-interview-patterns)
10. [9. Final Revision Checklist](#9-final-revision-checklist)

---

## What this guide is for

This guide is not a theory dump. It is designed for real interview preparation and real production understanding.

The goal is simple:

- Understand the concept deeply
- Know when it shows up in a product
- Know how to explain it clearly in an interview
- Know the production trade-offs, edge cases, and bad patterns

A strong principal-engineer answer is not just “I know the concept.” It is:

- definition
- bookish example
- real-world example
- why it matters
- where to use it
- what breaks if misused
- how to fix or optimize it

---

## 1. Referential Equality in JavaScript and React

### Definition

Referential equality means two variables point to the same object instance in memory, not merely that they contain similar values.

In JavaScript:

- primitives are compared by value
- objects, arrays, and functions are compared by reference

### Bookish example

```js
const a = { id: 1 };
const b = { id: 1 };
console.log(a === b); // false

const c = a;
console.log(a === c); // true
```

Even though `a` and `b` have the same shape, they are different objects.

### Practical production example

Imagine an e-commerce product grid showing 200 product cards.

```jsx
function ProductGrid({ products }) {
  return products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ));
}
```

If the parent recreates a fresh object for each product on every render, then `React.memo` may treat it as changed even when the logic is same.

That means the child component rerenders unnecessarily.

### Why it matters in React

React relies heavily on referential equality to decide:

- whether to re-render a child
- whether a memoized value is stale
- whether an effect should rerun
- whether a callback identity changed

### Why, How, Where to use

- Why: React optimization depends on stable references.
- How: Keep static objects outside render, or memoize derived values.
- Where: large lists, expensive computation, filter data, child components with lots of props, callbacks passed to memoized children

### Code examples

#### Problem pattern

```jsx
function Parent() {
  const filters = { category: "electronics", price: "low" };
  return <ProductList filters={filters} />;
}
```

Every render creates a new object. That can trigger unnecessary rerenders in memoized children.

#### Fix

```jsx
const DEFAULT_FILTERS = { category: "electronics", price: "low" };

function Parent() {
  return <ProductList filters={DEFAULT_FILTERS} />;
}
```

or

```jsx
const filteredProducts = useMemo(() => {
  return products.filter((p) => p.category === "electronics");
}, [products]);
```

### Common pitfalls

- recreating objects or arrays inline in render
- using array index as key in list reordering
- using `useMemo` without correct dependencies
- using stale references in callbacks

### Deep-dive questions

1. Why does `{ a: 1 } === { a: 1 }` return false?
2. What is the difference between value equality and reference equality?
3. How does referential equality affect `React.memo` and `useCallback`?
4. When is memoization a win, and when is it a trap?
5. Why does array index as a key cause bugs in reorder operations?

### Review checklist

- [ ] I understand the difference between reference and value comparison.
- [ ] I can explain why React.memo depends on stable references.
- [ ] I know when to use `useMemo`, `useCallback`, and `useRef`.
- [ ] I know when not to use memoization.

---

## 2. Stale Closures in JavaScript and React

### Definition

A stale closure is a function that keeps referencing old values from an earlier render or earlier scope instead of the latest values.

### Bookish example

```js
let count = 0;

setTimeout(() => {
  console.log(count);
}, 1000);

count = 5;
```

The callback uses the latest value of `count` at execution time, not the value from creation time, because it closes over the variable binding.

### Practical production example

#### E-commerce search bug

A user searches for “laptop”, then quickly types “gaming laptop”.

```jsx
function SearchPage() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`/api/search?q=${query}`);
  }, []);
}
```

The effect captures stale `query`, so the user may see outdated search results after the newer query was entered.

#### Food app order poll bug

A food app polls order status every 5 seconds. If the effect uses stale order ID or stale restaurant data, it may keep checking an old order and show wrong delivery status.

#### Ticket booking bug

A booking page starts a timer to expire the payment session. If the timer uses stale selected seats or stale showtime, the app may show the wrong countdown or wrong booking context.

### Why it happens in React

React re-renders components. Each render creates new function scope and new closure values.

### Why, How, Where to use

- Why: stale closures cause outdated UI, wrong API calls, and race conditions
- How: use functional state updates, correct dependencies, or refs for latest values
- Where: timers, polling, async APIs, debounced searches, event handlers, long-lived callbacks

### Fix patterns

#### Functional state update

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    setCount((prev) => prev + 1);
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

#### Dependency-driven effect

```jsx
useEffect(() => {
  fetchData(query);
}, [query]);
```

#### Use ref when you need latest value without rerendering

```jsx
const latestQueryRef = useRef(query);
latestQueryRef.current = query;
```

### Common pitfalls

- empty dependency array while reading changing values
- stale callback passed to child component
- async requests replacing newer results
- effects that do not clean up properly

### Deep-dive questions

1. What is the difference between stale state and stale closure?
2. Why can missing dependencies in `useEffect` create a bug?
3. When is `useRef` a better alternative than adding a dependency?
4. How do you solve stale API search results in a production app?
5. Why does functional state update help with stale closure bugs?

### Review checklist

- [ ] I can explain dirty closure with a real app scenario.
- [ ] I understand why dependency arrays matter.
- [ ] I know when to use `useRef` instead of rerendering.
- [ ] I can design an async flow that prevents stale result overwrites.

---

## 3. How `useState` Works Under the Hood

### Definition

React does not keep state in an ordinary local variable. It stores hook state in a linked structure internally and reuses it across renders.

### Internal data structure (conceptual)

```text
Fiber Node
└── memoizedState -> Hook 1
                   -> Hook 2
                   -> Hook 3
```

Each hook stores:

- current value
- queue of pending updates
- pointer to next hook

### Bookish example

```jsx
const [count, setCount] = useState(0);
```

On first render, React sets up state. When you later call `setCount`, React queues an update and rerenders with the new value.

### Practical production example

#### E-commerce cart

User clicks “+” repeatedly on a product quantity in the cart.

```jsx
setQty((prev) => prev + 1);
```

This is important because multiple updates may happen in one event cycle; functional updates ensure correctness.

### Three phases of `useState`

#### 1. Mount phase

- React creates a hook entry
- sets initial value
- attaches to fiber linked list
- creates dispatch function

#### 2. Update invocation phase

- setter is called
- new update is queued
- React schedules re-render

#### 3. Re-render phase

- React walks hooks in order
- processes queue
- computes next state
- stores updated value

### Why the Rules of Hooks matter

React matches hooks by call order. If hooks move inside conditionals or loops, the order changes and state is mismatched.

### Code example of a bad pattern

```jsx
function MyComponent({ isOpen }) {
  if (isOpen) {
    const [value, setValue] = useState("");
  }
}
```

This breaks the hook order and can create serious bugs.

### Why, How, Where to use

- Why: state must remain stable and predictable across renders
- How: keep hooks at the top level and use functional updates when needed
- Where: forms, carts, toggles, wizards, booking flows, filters

### Best practices

- keep hooks at the top level
- avoid conditions around hooks
- prefer `setState(prev => prev + 1)` when previous value matters
- understand batched updates

### Deep-dive questions

1. Why does hook order matter?
2. What is batching in React?
3. Why is `setState(prev => prev + 1)` safer than `setState(count + 1)`?
4. What happens if hooks are conditionally called?
5. What is the role of the Fiber in hook state storage?

### Review checklist

- [ ] I understand why hook order is important.
- [ ] I can explain how batching works.
- [ ] I know when to use functional updates.
- [ ] I know the difference between local variables and persistent hook state.

---

## 4. React Rendering and Re-render Optimization

### Definition

A rerender means React calls the component function again to recalculate the UI from the current state and props.

### Practical production examples

#### E-commerce example

A category panel filters products. If the parent recreates a new object on every render, the child product list may rerender even though data is same.

#### Food app example

Restaurant cards re-render when the page state changes even though the card data is unchanged. Large lists become sluggish.

#### Ticket booking example

Seat map rerenders when the selected date changes, even if most rows are unc hanged. Memoizing or grouping updates reduces waste.

### What triggers rerenders

- state change
- prop change
- parent rerender
- context value changes
- forced update

### Why, How, Where to use

- Why: render cost matters; every unnecessary render creates CPU and DOM work
- How: keep state local, split components, optimize expensive paths
- Where: large lists, tables, dashboards, modal forms, charts, seat maps

### Tooling and patterns

#### `React.memo`

```jsx
const ProductCard = React.memo(({ product }) => {
  return <div>{product.name}</div>;
});
```

Use when values are stable enough to skip rerender.

#### `useMemo`

```jsx
const filteredProducts = useMemo(() => {
  return products.filter((p) => p.category === selectedCategory);
}, [products, selectedCategory]);
```

Use for expensive derived calculations.

#### `useCallback`

```jsx
const addToCart = useCallback(
  (id) => {
    dispatch({ type: "ADD_TO_CART", payload: id });
  },
  [dispatch],
);
```

Use for functions passed to memoized children.

### Common pitfalls

- overusing memoization without measuring
- unstable object props breaking memoization
- using context too broadly
- storing too much state at root level

### Production realities

> Do not optimize blindly. Profile first.

Use React DevTools Profiler to confirm the hot path before adding memoization.

### Deep-dive questions

1. When does `React.memo` fail to prevent a rerender?
2. What is the difference between `useMemo` and `useCallback`?
3. Why can a provider update cause many consumer rerenders?
4. How do you decide whether virtualization is needed?
5. What is the difference between App-level state and UI-local state?

### Review checklist

- [ ] I know what causes rerenders.
- [ ] I can explain when to use memoization.
- [ ] I know how to profile and verify optimization.
- [ ] I can justify local vs global state placement.

---

## 5. State Management and Architecture

### Definition

State management is the way an app organizes and shares state across components and screens.

### Categories

#### Client state

- modal open/close
- selected filters
- theme
- local form draft
- cart drawer state

#### Server state

- product list from backend
- user profile
- order status
- booking availability

### Practical scenarios

#### E-commerce

Cart, wishlist, auth, checkout, and product catalog all need to coexist.

Good fit:

- local UI state: Zustand or Context
- server data: React Query or RTK Query
- global shared flows: Redux Toolkit

#### Food app

- current user
- selected address
- cart items
- restaurant selection
- order status

This crosses multiple screens and should be structured carefully.

#### Ticket booking app

- selected movie
- selected seats
- user info
- payment flow
- booking history

This is a classic place for a structured state layer.

### Why, How, Where to use

- Why: state should match the product’s real data flow, not just component convenience
- How: separate local UI state from server data and shared app state
- Where: global flows, multi-step workflows, cached server responses, forms, auth, checkout

### Context API vs Redux Toolkit

#### Context API

Best for:

- theme
- auth tokens
- small app-wide state
- simple non-frequent updates

Risk:

- too much context causes broad rerenders

#### Redux Toolkit

Best for:

- large state graphs
- predictable centralized updates
- complex async workflows
- multiple consumers and strict architecture

### Best practices

- keep state close to the component that owns it
- do not store server data in local component state if it is shared
- use query caches for server state
- use context for small app-wide data only

### Deep-dive questions

1. What is the difference between server state and client state?
2. When should we use Context and when should we use Redux Toolkit?
3. Why is mixing server state into local state a problem?
4. How do you decide where state should live in a large application?
5. What trade-off does Redux impose in exchange for predictability?

### Review checklist

- [ ] I can explain the difference between local, shared, and server state.
- [ ] I know when Context is enough and when Redux is needed.
- [ ] I understand the cost of broad provider value changes.

---

## 6. JavaScript Execution Model and Scope Fundamentals

### Definition

JavaScript uses a single-threaded event loop, lexical scoping, closures, and execution contexts to manage code execution.

### Core concepts

#### Scope

- global scope
- function scope
- block scope (`let` and `const`)

#### Execution context

Every function call gets an execution context with:

- variable environment
- scope chain
- `this`
- arguments

#### Closures

A function can access variables from outer scopes even after the outer function has returned.

### Bookish example

```js
function outer() {
  const name = "Alice";
  return function inner() {
    console.log(name);
  };
}
```

This works because `inner` closes over `name`.

### Practical production example

A checkout page may create a modal callback that uses selected cart items or pricing. The callback must still access the correct values even after the parent renders again.

### Why, How, Where to use

- Why: closures and scope determine correctness in callbacks, sessions, and async flows
- How: understand lexical scope, function lifetimes, and closure traps
- Where: event handlers, async code, timers, auth guards, memoization, data privacy patterns

### Common pitfalls

- using `var` in loops
- assuming closure captures current value instead of current binding
- missing `this` binding in class methods or callbacks

### Deep-dive questions

1. What is the difference between lexical scope and dynamic scope?
2. Why do closures matter in React callbacks?
3. Why is `var` dangerous in loops?
4. How do execution contexts and the call stack work together?

### Review checklist

- [ ] I know what a closure is and why it matters.
- [ ] I can explain lexical scope and execution contexts.
- [ ] I understand why `var` is tricky in loops.

---

## 7. Async JavaScript, Event Loop, and Production Bugs

### Definition

JavaScript executes one task at a time, while asynchronous work is queued and run later by the event loop.

### Execution flow

```text
Call Stack -> Web APIs -> Task Queue -> Event Loop -> Call Stack
```

### Practical example

#### E-commerce payments

- user clicks pay
- payment request is sent
- UI shows spinner
- response returns later
- state updates after completion

If callbacks or race conditions are mishandled, stale orders, double charges, or duplicate actions occur.

### Why, How, Where to use

- Why: async behavior determines how data arrives and races in apps
- How: use promises, async/await, and cancellation strategies correctly
- Where: network requests, polling, background sync, timers, real-time order updates

### Common patterns

- `Promise.all` for independent parallel calls
- `Promise.race` for timeout-like behavior
- `AbortController` to cancel stale requests
- `async/await` for readability and sequential control

### Deep-dive questions

1. Why do async operations not block the main thread?
2. What is the event loop?
3. How do you handle stale responses in real-time product apps?
4. Why does `Promise.all` not protect against request ordering issues?

### Review checklist

- [ ] I understand event loop basics.
- [ ] I know how to prevent stale async results.
- [ ] I know when to cancel or ignore a request.

---

## 8. Common JavaScript Interview Patterns

### `||` vs `??`

```js
console.log(0 || 10); // 10
console.log(0 ?? 10); // 0
```

Use `??` for values like zero, empty string, or false when they are valid values.

### Controlled vs uncontrolled components

- controlled: React owns the state
- uncontrolled: DOM owns the value until you read it

### Must-know patterns for interviews

- closures
- hoisting
- var vs let vs const
- object/reference behavior
- async/await
- event loop basics
- shallow vs deep comparison

### Interview-style medium/hard questions

1. Why does `setState` with object mutation fail to update React properly?
2. How do you avoid stale data when multiple async requests overlap?
3. Explain why a modal with `role="button"` is not enough for keyboard accessibility.
4. How would you design a high-traffic ticket booking seat selection flow?
5. When should a component be local state vs global state?

---

## 9. Final Revision Checklist

### Must-know for product-based company interviews

- [ ] referential equality and why it matters in React
- [ ] stale closure patterns and fixes
- [ ] how `useState` works under the hood
- [ ] rerender triggers and optimization patterns
- [ ] when to use state management tools
- [ ] event loop and async patterns
- [ ] accessibility fundamentals
- [ ] production performance mindset and profiling

### Interview answer structure

Use this structure in product-company interviews:

1. Define the concept simply
2. Show a small bookish example
3. Explain a real product scenario
4. Give a production insight or failure mode
5. Show the best practice or optimization
6. End with trade-offs and edge cases

### Final mindset

A strong interview answer is not just theoretical. It must sound like a real engineer discussing production problems, trade-offs, and user impact.

---

# Practice Prompt

Prepare a 2-minute answer for each of these:

- Why does referential equality matter in React?
- How would you debug a stale closure bug in a production app?
- Explain how `useState` works under the hood and why hook order matters.
- When should a component be memoized or split into smaller pieces?
- How do you decide between Context, Redux, or server cache?
- How do you avoid stale async search results in a large e-commerce app?

This guide is intentionally designed so you can revise quickly before interviews without rebuilding your notes every time.
