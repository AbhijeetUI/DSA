# API Integration Principles

## Table of Contents

- [Module Goal](#module-goal)
- [Learning Outcomes](#learning-outcomes)
- [Suggested Time Split](#suggested-time-split)
- [Why API Integration Matters](#why-api-integration-matters)
- [1. Separate the API Layer from the UI](#1-separate-the-api-layer-from-the-ui)
- [2. Handle Loading, Error, and Success States](#2-handle-loading-error-and-success-states)
- [3. Prefer Async/Await](#3-prefer-asyncawait)
- [4. Use a Single API Client](#4-use-a-single-api-client)
- [5. Separate Server State from Client State](#5-separate-server-state-from-client-state)
- [6. Use TanStack Query for Server State](#6-use-tanstack-query-for-server-state)
- [7. Cancel Requests](#7-cancel-requests)
- [8. Prevent Race Conditions](#8-prevent-race-conditions)
- [9. Debounce Search Requests](#9-debounce-search-requests)
- [10. Implement Optimistic Updates](#10-implement-optimistic-updates)
- [11. Transform API Data Before the UI](#11-transform-api-data-before-the-ui)
- [12. Centralize Error Handling](#12-centralize-error-handling)
- [13. Use Pagination for Large Data](#13-use-pagination-for-large-data)
- [14. Use Infinite Scroll Carefully](#14-use-infinite-scroll-carefully)
- [15. Cache API Responses](#15-cache-api-responses)
- [16. Retry Failed Requests Carefully](#16-retry-failed-requests-carefully)
- [17. Poll for Near Real-Time Data](#17-poll-for-near-real-time-data)
- [18. Prefer WebSockets for Real-Time Data](#18-prefer-websockets-for-real-time-data)
- [19. Secure API Requests](#19-secure-api-requests)
- [20. Design Reusable API Hooks](#20-design-reusable-api-hooks)
- [Hands-on Problem: Product Search and Inventory Dashboard](#hands-on-problem-product-search-and-inventory-dashboard)

---

## Module Goal

Learn how to build reliable frontend data flows with clean API architecture, proper state handling, caching, cancellation, and real-time updates.

## Learning Outcomes

After this lesson, you should be able to:

- Separate API logic from UI components.
- Handle loading, error, and success states.
- Use TanStack Query for server state.
- Prevent race conditions and duplicate requests.
- Implement caching, pagination, and optimistic updates.
- Handle retries, cancellation, and real-time data.
- Build reusable API hooks.

## Suggested Time Split

| Topic                                            |        Time |
| ------------------------------------------------ | ----------: |
| API layer and request architecture               |      25 min |
| Loading, error, and async handling               |      20 min |
| Server state and TanStack Query                  |      30 min |
| Cancellation, deduplication, and race conditions |      25 min |
| Caching, pagination, and optimistic updates      |      25 min |
| Polling, WebSockets, and real-time data          |      15 min |
| Reusable API hooks and data transformation       |      10 min |
| **Total**                                        | **150 min** |

## Why API Integration Matters

| Principle                                 | Why it matters                            |
| ----------------------------------------- | ----------------------------------------- |
| Separate the API layer from the UI        | Maintainability                           |
| Handle loading, error, and success states | Better user experience                    |
| Use async/await                           | Readability                               |
| Centralize API calls                      | Reusability                               |
| Use server-state libraries                | Caching and synchronization               |
| Cancel requests                           | Avoid stale responses and race conditions |
| Retry failed requests carefully           | Reliability                               |
| Use optimistic updates                    | Better user experience                    |
| Use pagination and lazy loading           | Performance                               |
| Cache responses                           | Reduce network requests                   |
| Transform API data                        | Keep UI code clean                        |
| Use error boundaries and fallbacks        | Resilience                                |
| Deduplicate requests                      | Performance                               |
| Poll or use real-time updates             | Keep live data current                    |

## 1. Separate the API Layer from the UI

Keep request logic outside the component that displays the data. A separate API function is easier to reuse, test, and maintain.

**Avoid:** Mixing the request and UI state directly into the component.

```jsx
function Users() {
  useEffect(() => {
    fetch("/api/users")
      .then((response) => response.json())
      .then(setUsers);
  }, []);
}
```

**Prefer:**

```javascript
// api/userApi.js
export async function getUsers() {
  const response = await fetch("/api/users");
  return response.json();
}
```

The component can call `getUsers()` without owning the details of how the request is made.

## 2. Handle Loading, Error, and Success States

A request does not have only a success state. The UI should handle the time while data is loading, a request error, and the result when the request succeeds.

```jsx
if (loading) {
  return <Spinner />;
}

if (error) {
  return <Error />;
}

return <Users />;
```

Trying to render `users` before the request has completed can fail. Show the state that matches the request instead.

## 3. Prefer Async/Await

Use `async` and `await` to write asynchronous request handling in a direct, readable order.

```javascript
try {
  const users = await getUsers();
  setUsers(users);
} catch (error) {
  showError();
}
```

This is often easier to read and debug than a long chain of `.then()` calls.

## 4. Use a Single API Client

Instead of configuring requests separately throughout the application, create one API client.

```javascript
const api = axios.create({
  baseURL: "/api",
});
```

A shared client can provide common headers, interceptors, and authentication handling.

## 5. Separate Server State from Client State

**Client state** belongs to the interface. Examples include:

- Whether a modal is open
- The selected theme
- The selected tab

Use `useState`, Context, or Zustand for client state.

**Server state** comes from the API. Examples include:

- Users
- Products
- Orders

Use TanStack Query, SWR, or Apollo for server state.

## 6. Use TanStack Query for Server State

Manually handling fetching, loading, errors, retries, and caching takes repeated work. TanStack Query can manage common server-state behavior.

```javascript
const { data, isLoading } = useQuery({
  queryKey: ["users"],
  queryFn: getUsers,
});
```

The lesson highlights these benefits:

- Caching
- Retries
- Background refresh
- Request deduplication

## 7. Cancel Requests

A request can become outdated while it is in progress. For example, a user can start searching for `A`, then search for `B`; the first request might finish last and show old results.

Use an `AbortController` to cancel the older request:

```javascript
const controller = new AbortController();

fetch("/api/users", { signal: controller.signal });

// Cancel this request when it is no longer needed.
controller.abort();
```

Cancellation helps prevent an outdated response from replacing newer results.

## 8. Prevent Race Conditions

Race conditions are common in search, autocomplete, and filters. A slower earlier request can finish after a newer request and display stale data.

The lesson identifies these approaches:

- Cancel outdated requests with `AbortController`.
- Use TanStack Query to manage server-state requests.

## 9. Debounce Search Requests

Calling the API for every keystroke can create many unnecessary requests. Debounce the search value so the request happens after the user pauses typing.

```javascript
const debouncedSearch = useDebounce(search, 300);
```

Use the debounced value when calling the API.

## 10. Implement Optimistic Updates

With a traditional update, the UI waits for the API response before showing the change. An optimistic update changes the UI immediately, then rolls back if the request fails.

```text
User clicks Like
       ↓
UI updates immediately
       ↓
API request
       ↓
If the request fails, roll back the UI
```

The lesson lists Facebook, LinkedIn, and Trello as examples of products using this pattern.

## 11. Transform API Data Before the UI

Avoid spreading API field names and formatting logic throughout the UI. Transform the response into a shape the UI can use.

**Avoid:** Using `user.first_name` and `user.last_name` everywhere.

**Prefer:**

```javascript
function mapUser(user) {
  return {
    name: `${user.first_name} ${user.last_name}`,
  };
}
```

Now the UI can use the clean `name` field.

## 12. Centralize Error Handling

Put shared error handling in one place instead of repeating it for every API call.

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    showToast(error.message);
    return Promise.reject(error);
  },
);
```

Centralized handling avoids duplicated error code.

## 13. Use Pagination for Large Data

Do not load a very large result set all at once. Load a smaller page and let the user request the next one.

```text
Load 20 results
      ↓
Load the next 20
```

Pagination supports faster loading and a better user experience.

## 14. Use Infinite Scroll Carefully

Infinite scroll can fit feeds where users naturally keep moving through content, such as:

- Social feeds
- News feeds

It is not always a good fit for:

- Search results
- Admin tables

## 15. Cache API Responses

Refetching every time a user opens a page can make the experience slower and increase network requests. Use TanStack Query or SWR to cache API responses.

**Benefits:** faster user experience and fewer requests.

## 16. Retry Failed Requests Carefully

Retry a request when the failure is temporary, such as a network timeout. Do not retry every kind of failure.

- **Good retry case:** Network timeout
- **Do not retry:** `401 Unauthorized`

The lesson gives `retry: 3` in TanStack Query as an example setting.

## 17. Poll for Near Real-Time Data

Polling asks for fresh data at a regular interval. It can fit data such as stock prices, dashboards, and notifications.

```javascript
refetchInterval: 5000;
```

This example requests a refresh every 5,000 milliseconds.

## 18. Prefer WebSockets for Real-Time Data

Polling has the client ask repeatedly for updates. With a WebSocket, the server pushes updates to the client.

The lesson lists these WebSocket use cases:

- Chat
- Trading
- Live dashboards

## 19. Secure API Requests

**Never store access tokens or API keys in source code.** The lesson identifies environment variables and HTTP-only cookies as alternatives.

## 20. Design Reusable API Hooks

Avoid repeating the same `useEffect` request logic throughout the application. Create reusable hooks for common data needs.

```javascript
useUsers();
useProducts();
useOrders();
```

Reusable hooks keep components cleaner and make API behavior reusable.

## Hands-on Problem: Product Search and Inventory Dashboard

Build a dashboard that:

- Fetches products from an API.
- Supports search, filters, and pagination.
- Debounces search requests.
- Caches previously fetched results.
- Cancels stale requests.
- Handles loading, error, and empty states.
- Updates inventory optimistically.
- Supports periodic stock updates.
- Prevents duplicate API requests.

### Desired Outcome

Build a production-style data layer with this flow:

```text
UI → API Layer → Server State → Cache → UI
```

The implementation should handle stale requests, failures, caching, pagination, optimistic updates, and real-time updates cleanly.
