# Async Programming Principles

## Table of Contents

- [Why Async Programming Matters](#why-async-programming-matters)
- [1. Prefer Async/Await](#1-prefer-asyncawait)
- [2. Always Handle Errors](#2-always-handle-errors)
- [3. Avoid Sequential Calls When Possible](#3-avoid-sequential-calls-when-possible)
- [4. Understand `Promise.all()`](#4-understand-promiseall)
- [5. Use `Promise.allSettled()`](#5-use-promiseallsettled)
- [6. Handle Race Conditions](#6-handle-race-conditions)
- [7. Cancel Stale Requests](#7-cancel-stale-requests)
- [8. Debounce User Input](#8-debounce-user-input)
- [9. Throttle High-Frequency Events](#9-throttle-high-frequency-events)
- [10. Show Loading States](#10-show-loading-states)
- [11. Retry Carefully](#11-retry-carefully)
- [12. Use Optimistic Updates](#12-use-optimistic-updates)
- [13. Extract Async Logic into Hooks](#13-extract-async-logic-into-hooks)
- [14. Avoid Async Logic in Render](#14-avoid-async-logic-in-render)
- [15. Separate Server State from UI State](#15-separate-server-state-from-ui-state)
- [16. Use Polling Only When Needed](#16-use-polling-only-when-needed)
- [17. Prefer WebSockets for Real-Time Updates](#17-prefer-websockets-for-real-time-updates)
- [18. Prevent Memory Leaks](#18-prevent-memory-leaks)
- [19. Use Async State Machines for Complex Flows](#19-use-async-state-machines-for-complex-flows)
- [20. Understand the Event Loop](#20-understand-the-event-loop)

---

## Why Async Programming Matters

| Principle                               | Why it matters                          |
| --------------------------------------- | --------------------------------------- |
| Prefer async/await                      | Cleaner code                            |
| Always handle errors                    | Prevent app crashes                     |
| Avoid callback hell                     | Improve maintainability                 |
| Handle race conditions                  | Keep results correct                    |
| Cancel stale requests                   | Improve the user experience             |
| Parallelize independent requests        | Improve performance                     |
| Understand the event loop               | Common interview topic                  |
| Debounce user input                     | Reduce API calls                        |
| Throttle frequent events                | Improve performance                     |
| Show loading states                     | Help users understand what is happening |
| Retry carefully                         | Improve reliability                     |
| Use optimistic updates                  | Improve the user experience             |
| Use polling or WebSockets appropriately | Support real-time applications          |
| Extract async custom hooks              | Make logic reusable                     |

## 1. Prefer Async/Await

`async` and `await` make a sequence of asynchronous operations easier to read. They also work naturally with `try` and `catch` for error handling.

**Harder to follow:**

```javascript
fetchUsers()
  .then((users) => fetchOrders(users.id))
  .then((orders) => {
    console.log(orders);
  })
  .catch(console.error);
```

**Clearer with async/await:**

```javascript
async function loadData() {
  try {
    const users = await fetchUsers();
    const orders = await fetchOrders(users.id);
    console.log(orders);
  } catch (error) {
    console.error(error);
  }
}
```

This style is readable, easier to debug, and makes error handling easier to follow.

## 2. Always Handle Errors

An API request can fail. If the error is not handled, the UI may break instead of showing the user a useful response.

```javascript
try {
  const users = await fetchUsers();
  setUsers(users);
} catch (error) {
  showError();
}
```

Handle failures as part of the async flow rather than assuming every request succeeds.

## 3. Avoid Sequential Calls When Possible

If requests do not depend on one another, waiting for each request before starting the next adds unnecessary time.

**Sequential requests:**

```javascript
const users = await fetchUsers();
const products = await fetchProducts();
const orders = await fetchOrders();
```

If each request takes about one second, the total can be about three seconds.

**Start independent requests together:**

```javascript
const [users, products, orders] = await Promise.all([
  fetchUsers(),
  fetchProducts(),
  fetchOrders(),
]);
```

When these independent requests each take about one second, they can complete in about one second overall.

## 4. Understand `Promise.all()`

Use `Promise.all()` when all the tasks are independent and the result is needed from each one.

```javascript
const [users, orders, products] = await Promise.all([
  fetchUsers(),
  fetchOrders(),
  fetchProducts(),
]);
```

This is a common interview topic. The requests start together rather than waiting for one another.

## 5. Use `Promise.allSettled()`

Use `Promise.allSettled()` when some requests may fail but you still need the outcome of every request.

```javascript
const results = await Promise.allSettled([fetchUsers(), fetchOrders()]);
```

One request failing does not prevent you from receiving the results for the other requests. Each result reports whether its task was fulfilled or rejected.

## 6. Handle Race Conditions

Race conditions can happen when a user changes a search quickly. Several requests may be running at once, and an older request may finish last.

```text
User types: r → re → rea → react
Requests:   1   2    3      4

Request 1 finishes last
             ↓
Old results may replace the latest results
```

The lesson identifies `AbortController` and TanStack Query as ways to handle this problem.

## 7. Cancel Stale Requests

Cancel a request when its result is no longer needed, such as when a search term changes or the user moves to another filter.

```javascript
const controller = new AbortController();

fetch(url, {
  signal: controller.signal,
});

// Cancel the request when it is stale.
controller.abort();
```

Cancellation is useful for search, filters, and autocomplete.

## 8. Debounce User Input

Calling an API for every keystroke can create many unnecessary requests. Debouncing waits until the user stops typing for a short time before using the latest value.

```javascript
const debouncedSearch = useDebounce(search, 300);
```

The API call happens after typing stops for the configured delay.

## 9. Throttle High-Frequency Events

Scroll, resize, and mouse-move events can fire many times in a short period. Throttling limits how often a handler runs.

```javascript
const throttledScroll = throttle(handleScroll, 200);
```

In this example, the scroll handler is limited to one call per 200 milliseconds.

## 10. Show Loading States

A blank screen does not tell users what is happening while data loads. Show a loading indicator instead.

```jsx
if (loading) {
  return <Spinner />;
}
```

A visible loading state helps users understand that the application is working.

## 11. Retry Carefully

Retry temporary failures, such as a network timeout, `503`, or another temporary failure. Do not retry errors that will not be fixed by trying the same request again.

**Retry examples:**

- Network timeout
- `503` temporary service failure

**Do not retry examples:**

- `401`
- `403`
- `404`
- Validation errors

The lesson gives `retry: 3` in TanStack Query as an example:

```javascript
retry: 3;
```

## 12. Use Optimistic Updates

With a traditional update, the UI waits for the API before showing the change. With an optimistic update, the UI changes immediately and rolls back if the request fails.

**Traditional flow:**

```text
Click Like → API request → Update UI
```

**Optimistic flow:**

```text
Click Like → Update UI → API request → Roll back if needed
```

The lesson lists Facebook, LinkedIn, and Trello as examples of products using this pattern.

## 13. Extract Async Logic into Hooks

Avoid repeating the same `useEffect` request logic throughout the application. Extract common async logic into hooks.

```javascript
const users = useUsers();
const orders = useOrders();
```

Custom hooks make async logic reusable and testable.

## 14. Avoid Async Logic in Render

Do not wait for an API request directly while rendering a component. Start the request in an effect instead.

**Avoid:**

```jsx
return <div>{await fetchUsers()}</div>;
```

**Use an effect to start the request:**

```javascript
useEffect(() => {
  loadUsers();
}, []);
```

## 15. Separate Server State from UI State

**UI state** describes the current interface. Examples include:

- Whether a modal is open
- Which tab is selected
- The selected theme

Use `useState` for UI state.

**Server state** contains data from the server. Examples include:

- Users
- Products
- Orders

Use TanStack Query for server state.

## 16. Use Polling Only When Needed

Polling asks the server for updates at a regular interval. It can be useful for dashboards and monitoring.

```javascript
setInterval(fetchNotifications, 5000);
```

Polling is not ideal for chat, trading, and live games according to the lesson.

## 17. Prefer WebSockets for Real-Time Updates

With polling, the client asks for updates repeatedly. With a WebSocket, the server pushes updates to the client.

The lesson identifies these as WebSocket use cases:

- Chat apps
- Google Docs
- Trading systems

## 18. Prevent Memory Leaks

A request can still finish after a component has unmounted. Use an `AbortController` and abort the request during effect cleanup.

```javascript
useEffect(() => {
  const controller = new AbortController();

  fetch(url, {
    signal: controller.signal,
  });

  return () => controller.abort();
}, []);
```

Cleanup cancels the request when the component is removed.

## 19. Use Async State Machines for Complex Flows

For a complex async flow, separate states such as loading, success, and error can be represented as named states:

```text
IDLE → LOADING → SUCCESS
                 ↘ ERROR
```

The lesson also names XState as an option for async state machines.

## 20. Understand the Event Loop

The event loop is a common interview topic. Know the roles of the call stack, Web APIs, callback queue, and microtask queue.

```text
Call Stack
    ↓
Web APIs
    ↓
Callback Queue and Microtask Queue
    ↓
Event Loop
```

A common interview exercise asks you to predict the output when a promise callback and a timer callback are both scheduled:

```javascript
Promise.resolve().then(() => console.log("Promise"));
setTimeout(() => console.log("Timer"), 0);
```

After the current synchronous code finishes, the promise callback runs from the microtask queue before the timer callback from the callback queue. The output is:

```text
Promise
Timer
```
