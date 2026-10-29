# Search Optimization Principles

## Table of Contents

- [Why Search Optimization Matters](#why-search-optimization-matters)
- [1. Debounce Search Input](#1-debounce-search-input)
- [2. Cancel Previous Requests](#2-cancel-previous-requests)
- [3. Handle Race Conditions](#3-handle-race-conditions)
- [4. Cache Search Results](#4-cache-search-results)
- [5. Use Pagination](#5-use-pagination)
- [6. Use Infinite Scroll Carefully](#6-use-infinite-scroll-carefully)
- [7. Search on the Server](#7-search-on-the-server)
- [8. Use Search Indexes](#8-use-search-indexes)
- [9. Prefetch Common Searches](#9-prefetch-common-searches)
- [10. Show Search Skeletons](#10-show-search-skeletons)

---

## Why Search Optimization Matters

Search optimization helps reduce unnecessary requests, prevent stale results, support larger data sets, and make the interface feel faster.

| Principle                   | Why it matters                                    |
| --------------------------- | ------------------------------------------------- |
| Debouncing                  | Reduces unnecessary API calls.                    |
| Request cancellation        | Prevents stale results.                           |
| Race-condition handling     | Keeps results correct.                            |
| Server-side search          | Supports scale.                                   |
| Search-result caching       | Makes repeated searches faster.                   |
| Pagination                  | Improves performance with large result sets.      |
| Lazy loading results        | Reduces rendering cost.                           |
| Search indexes              | Make lookups faster.                              |
| Prefetching popular results | Improves perceived performance.                   |
| Search skeletons            | Improve perceived performance while results load. |

## 1. Debounce Search Input

When a user types, the application can send a request after every character. Five typed characters can lead to five API calls.

Debouncing waits until the user pauses typing, then uses the latest search value.

```javascript
const debouncedSearch = useDebounce(search, 300);
```

Only the final request runs after the typing pause.

**Benefits:**

- Less server load
- Better user experience
- Better performance

## 2. Cancel Previous Requests

A previous search request may still be running after the user enters a new search. Cancel the old request so it cannot return stale results.

```javascript
const controller = new AbortController();

fetch(url, {
  signal: controller.signal,
});

// Cancel the previous request when it is no longer needed.
controller.abort();
```

TanStack Query is another option mentioned in the lesson.

**Benefits:**

- Prevents stale results
- Improves correctness

## 3. Handle Race Conditions

Search requests can finish in a different order than they started. For example, an earlier search for “Apple” may finish after a later request and show the wrong results.

```text
Search A starts
      ↓
Search B starts
      ↓
Search B finishes
      ↓
Search A finishes later and could replace B's results
```

The lesson identifies these solutions:

- `AbortController`
- Request ID tracking
- TanStack Query

## 4. Cache Search Results

Without a cache, searching for the same term again sends another request. Cache results so a repeated search can return them faster and reduce network traffic.

```javascript
const cache = {};

cache["react"] = results;
```

For example, the results for `react` can be reused when the user searches for `react` again.

## 5. Use Pagination

Do not load thousands of products in one request. Load a smaller page and let the user move to the next page of results.

```text
Load 20 results
      ↓
Load the next 20
```

Pagination can provide:

- Faster load time
- Lower memory usage

## 6. Use Infinite Scroll Carefully

Infinite scroll can work well for social feeds, such as Instagram and LinkedIn.

It is not always a good fit for:

- Search results
- Admin panels

Choose the result-loading pattern that fits how users need to browse and find information.

## 7. Search on the Server

For a large catalog, do not download all the records to the browser and search locally. Send the search query to the backend instead.

```text
Frontend → Query → Backend Search
```

For example, downloading 100,000 products just to search through them is not the preferred approach in the lesson.

**Benefits:**

- Scalability
- Reduced bandwidth

## 8. Use Search Indexes

Search speed can depend on how the backend looks up data. The lesson identifies these backend options:

- Database indexes
- Elasticsearch
- Algolia

Frontend engineers should understand this trade-off when working on search performance.

## 9. Prefetch Common Searches

Some searches are popular or predictable. The lesson gives these examples:

- Popular products
- Trending searches

Prefetching these results before the user types can improve perceived performance.

## 10. Show Search Skeletons

A blank interface gives no indication that results are loading. Show a loading skeleton while the search results are being fetched.

```text
Blank UI → Loading skeleton → Search results
```

A skeleton improves perceived performance by showing users that content is on its way.
