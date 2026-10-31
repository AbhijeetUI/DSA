# Frontend Data, Storage & Caching

## Module Goal

Design frontend data systems that remain fast, consistent, resilient, secure, and maintainable as applications scale across users, devices, tabs, teams, APIs, and unreliable networks.

The central questions are: where should data live, how long should it live, who owns it, and when should it be refreshed or invalidated? Production applications often use component memory, shared state, URLs, HTTP caches, service-worker caches, query caches, browser storage, and backend caches at the same time. The key is to assign each layer a clear responsibility.

## Table of Contents

- [1. Data Architecture and Ownership](#1-data-architecture-and-ownership)
- [2. HTTP Caching](#2-http-caching)
- [3. Browser Cache](#3-browser-cache)
- [4. Service Worker Caching](#4-service-worker-caching)
- [5. API and Query Caching](#5-api-and-query-caching)
- [6. Frontend State Management](#6-frontend-state-management)
- [7. localStorage](#7-localstorage)
- [8. sessionStorage](#8-sessionstorage)
- [9. Cookies](#9-cookies)
- [10. IndexedDB](#10-indexeddb)
- [11. Data Consistency and Mutation Strategies](#11-data-consistency-and-mutation-strategies)
- [12. Cross-Layer Cache Architecture](#12-cross-layer-cache-architecture)
- [13. Design Exercise: Infinite Social Feed](#13-design-exercise-infinite-social-feed)
- [14. Architecture Decision Summary](#14-architecture-decision-summary)

---

## 1. Data Architecture and Ownership

Do not treat every value as generic “state.” Classify data by authority, lifecycle, persistence, synchronization, and sensitivity before selecting a library or storage API.

### 1.1 Data Categories

| Category | Typical owner | Examples | Persistence and synchronization |
| -------- | ------------- | -------- | ------------------------------- |
| Server state | Backend | Products, orders, profiles, permissions | Revalidated from server; may be cached |
| Client state | Frontend | Open modal, selected tab, temporary UI state | Usually in memory |
| URL state | Router/browser | Search query, filters, page, selected resource | Shareable and history-aware |
| Form state | Form or feature | Inputs, touched fields, validation errors | Usually temporary; drafts may persist |
| Persistent state | Browser, device, or backend | Theme, drafts, offline data | Duration and sync depend on semantics |

Server state is authoritative outside the frontend and usually needs fetching, caching, invalidation, and synchronization. Client state is created by interaction and often has no reason to survive a reload.

URL state is valuable when users should be able to bookmark, share, or navigate backward to a view. Form state has its own lifecycle: a shipping draft may be recoverable, while payment security codes must never be persisted.

### 1.2 Data Ownership Questions

Before storing data, ask:

- Who is authoritative and who can modify it?
- Who reads it and how widely is it shared?
- Must it survive a refresh, tab close, browser restart, or device change?
- Must it synchronize across tabs or devices?
- Can stale data be tolerated, and how is freshness communicated?
- Is the data sensitive, and how will it be protected?
- How will it be invalidated, merged, or deleted?

Match persistence duration to meaning: a modal state may last seconds, a checkout step minutes, a preference months, and offline documents much longer.

## 2. HTTP Caching

HTTP caching lets browsers and intermediary caches reuse responses according to server-defined freshness and validation rules.

### 2.1 Cache-Control

`Cache-Control` is the primary modern mechanism for specifying how a response may be cached and reused. Choose directives and lifetimes based on whether a response is public, private, immutable, or sensitive.

Examples of design intent:

- Versioned static assets can often be cached for a long time when their URL changes with content.
- User-specific responses need private cache behavior and careful shared-cache handling.
- Frequently changing data may use shorter freshness and conditional revalidation.
- Sensitive responses should not be stored in inappropriate shared caches.

Caching is a correctness and privacy decision, not just a performance toggle.

### 2.2 Validators and Conditional Requests

- **ETag** identifies a representation version.
- **Last-Modified** communicates a modification time.
- **Conditional requests** let a client ask whether its cached copy is still current, avoiding retransmission of an unchanged body.
- **Expires** is an older expiration mechanism; modern designs generally prefer explicit cache control.

Validators reduce bandwidth but still require correct server behavior and cache policy.

## 3. Browser Cache

Browsers commonly maintain memory and disk caches:

- **Memory cache** is fast and tied to the current process or browsing context.
- **Disk cache** can survive longer and support repeat visits.

The browser decides what to retain based on response headers, resource type, available space, and internal policies. Application code should not assume that a resource is permanently available simply because it was cached once.

Use immutable, versioned asset URLs for long-lived static resources. Keep cache lifetimes and deployment behavior coordinated so clients do not receive HTML that references assets already removed from the server.

## 4. Service Worker Caching

A service worker is a programmable network intermediary that can precache critical assets and apply runtime caching strategies.

### 4.1 Precache and Runtime Cache

- **Precache** critical resources during service-worker installation to support reliable startup.
- **Runtime cache** resources as they are requested and reuse them according to their semantics.

Do not precache an entire product indiscriminately. Large installation downloads, storage pressure, install failures, and stale assets can outweigh offline benefits.

### 4.2 Versioning and Updates

Version caches deliberately and remove obsolete entries when safe. Immediate cleanup can break an older open tab that still needs a previous chunk. Coordinate cache versions, HTML, and asset retention; use a compatibility period or atomic application-shell update where needed.

### 4.3 Service Worker vs. Application Data

Cache Storage and service workers are appropriate for request and asset caching. Structured application data, offline edits, and mutation queues generally belong in IndexedDB. A cache entry alone does not provide application-level ownership, query semantics, or conflict handling.

## 5. API and Query Caching

API caching is application-level caching of fetched data. It can reuse responses, deduplicate concurrent requests, and keep stale data visible while refreshing.

### 5.1 In-Memory Cache

An in-memory cache is simple and fast, with no serialization. It is lost on reload, usually scoped to a tab, can grow without bounds, and requires explicit invalidation.

### 5.2 Request Deduplication

If multiple components request the same data at once, cache the in-flight promise so they share one request:

```text
Component A ─┐
Component B ─┼─→ Shared request → API
Component C ─┘
```

Define a deduplication window and key carefully. Reusing an old promise or response indefinitely prevents data from refreshing.

### 5.3 Query Caches

Query-cache libraries organize server data around stable query keys and can provide request deduplication, freshness policies, background revalidation, retries, and mutation integration.

Keys must represent all inputs that affect the response, such as user, filters, pagination, and locale. Incomplete keys can return the wrong cached data; overly granular keys can fragment the cache.

### 5.4 Stale While Revalidate

For data where responsiveness is important and temporary staleness is acceptable:

```text
Show cached result immediately
  → Fetch current result in background
  → Update cache and UI
```

This works well for some profiles, feeds, or catalogs. It is not appropriate for correctness-sensitive data such as an account balance unless stale data is clearly labeled and safe for the user.

## 6. Frontend State Management

State management begins with classifying state and assigning ownership.

### 6.1 Local, Shared, and Global State

- **Local component state:** Owned by one component or small subtree; keep it close to where it is used.
- **Shared feature state:** Used by sibling components or a feature boundary; expose a scoped store or context when appropriate.
- **Global state:** Cross-cutting state needed by many parts of the application; keep the surface area small and ownership explicit.

Global state is not a default destination for every value. Broad shared state can cause unnecessary coupling, updates, and debugging complexity.

### 6.2 Server State

Server state has separate lifecycle concerns from client state: loading, errors, freshness, retries, deduplication, pagination, and invalidation. A query cache is often a better fit than manually copying server responses into a generic global store.

### 6.3 Event-Driven State

Large applications may use events to communicate changes across feature boundaries. Events can reduce direct coupling, but require clear schemas, ownership, ordering expectations, duplicate handling, and observability.

## 7. localStorage

`localStorage` provides synchronous, string-based key-value persistence scoped to an origin.

### 7.1 Appropriate Uses and Limitations

Good candidates include small preferences such as theme, language, or dismissed banners. It is a poor fit for large payloads, complex queries, and structured offline databases.

Limitations include:

- Synchronous reads and writes can block the main thread.
- Values require serialization.
- It has no indexes or rich query model.
- Quota varies by browser and environment.
- Data may be shared across same-origin tabs.

### 7.2 Security

Any JavaScript executing in the origin can potentially read `localStorage`. Do not store authentication secrets or sensitive personal data there. Secure cookie-based session designs can reduce direct credential access by JavaScript, but introduce cookie and CSRF considerations of their own.

## 8. sessionStorage

`sessionStorage` is typically scoped to a tab's page session. It survives navigation and refresh within that tab but is generally cleared when the tab closes.

Possible uses include a multi-step checkout's current step, temporary filters, and short-lived per-tab workflow state. It is also synchronous and string-based, so it is not suitable for large or complex storage.

| Property | `localStorage` | `sessionStorage` |
| -------- | -------------- | ---------------- |
| Survives refresh | Yes | Yes |
| Survives tab close | Usually | No |
| Scope | Same-origin storage | Generally tab-scoped |
| API | Synchronous | Synchronous |
| Values | Strings | Strings |

## 9. Cookies

Cookies are small pieces of data associated with browser requests according to domain, path, and security rules. The browser may attach matching cookies automatically to requests.

### 9.1 Session and Persistent Cookies

Cookies without explicit persistence attributes are generally session-scoped. `Max-Age` or `Expires` can define a persistent lifetime. Set the lifetime according to session policy and data purpose.

### 9.2 Security Attributes

- **Secure:** Send only over secure transport.
- **HttpOnly:** Prevent JavaScript access through APIs such as `document.cookie`; this reduces direct credential theft but does not stop malicious scripts from acting as the user.
- **SameSite:** Controls when cookies are sent in cross-site contexts. `Strict`, `Lax`, and `None` have different integration and cross-site request trade-offs; `None` requires `Secure`.

Authentication cookies commonly use HTTPS with `Secure`, `HttpOnly`, and an appropriate `SameSite` policy. Cookie-based authentication still requires a deliberate CSRF defense and server-side validation.

## 10. IndexedDB

IndexedDB is an asynchronous browser database for structured client-side data. It supports object stores, indexes, and transactions, making it appropriate for larger datasets and offline-capable applications.

### 10.1 Structured Data and Indexes

Store structured records such as documents, posts, metadata, and pending operations. Indexes support queries such as records by user, pending sync jobs, or documents ordered by update time without scanning every record.

### 10.2 Transactions

Transactions keep related changes consistent. For an offline document edit, updating the document and appending its pending synchronization job should occur atomically: both commit or neither does.

### 10.3 Trade-Offs

**Benefits**

- Asynchronous access.
- Structured data and indexes.
- Transactions.
- Large local datasets and offline support.

**Costs**

- More complex APIs and schema migrations.
- Browser quota and storage-pressure handling.
- Additional synchronization and debugging complexity.

Use IndexedDB when the application needs durable structured data, indexing, transactional writes, or offline workflows. Do not introduce it merely to persist trivial UI state.

## 11. Data Consistency and Mutation Strategies

Caching creates copies. A single logical entity may exist in the backend, HTTP cache, query cache, IndexedDB, and rendered UI. Decide how changes propagate and which copy is authoritative.

### 11.1 Optimistic Updates

Optimistic updates change the UI before the server confirms the mutation:

```text
User action → Update UI immediately → Send request
                                  ├─ Success: keep
                                  └─ Failure: rollback
```

They work well for frequent, low-risk actions such as likes or simple preferences. Risks include rollback complexity, concurrent mutations, duplicate requests, and out-of-order responses.

Use mutation IDs, sequence numbers, idempotency, or desired-state APIs to avoid stale responses corrupting the visible state. For example, setting `liked: true` is often safer than replaying “like” and “unlike” transitions without ordering.

### 11.2 Pessimistic Updates

Pessimistic updates wait for server confirmation before reflecting success. They are often preferable for payments, financial transfers, critical permissions, and destructive operations where correctness is more important than immediate visual response.

| Optimistic | Pessimistic |
| ---------- | ----------- |
| Faster perceived interaction | Stronger confirmation |
| Rollback and race complexity | Simpler consistency model |
| Good for low-risk frequent actions | Good for high-risk actions |

### 11.3 Cache Invalidation

After updating an entity, related copies may exist in detail, list, feed, and user-specific queries.

- **Broad invalidation** is simple but may cause extra requests.
- **Targeted updates** are efficient but can miss a dependent cache.
- **Normalized entities** let multiple queries reference a shared entity, improving consistency at the cost of normalization complexity.

Choose a strategy that the team can apply consistently and test. Explicitly document which queries are invalidated or updated by each mutation.

### 11.4 Conflict Resolution

Concurrent edits can create conflicting versions. Options include:

- Last Write Wins, which is simple but can lose data and depend on clock assumptions.
- Version checks and conflict responses, which detect stale writes.
- Field-level merge when changes are independent.
- User-assisted resolution for valuable content.
- CRDTs or other collaborative models for genuine real-time collaboration needs.

Do not introduce a complex conflict model without a product requirement that justifies it.

## 12. Cross-Layer Cache Architecture

A production application may use multiple cache layers, each with a distinct responsibility:

| Layer | Responsibility |
| ----- | -------------- |
| CDN or edge cache | Geographic delivery and shared response reuse |
| HTTP cache | Protocol-level response reuse and validation |
| Service worker | Programmable request and offline asset strategies |
| Query cache | Server-state reuse and revalidation for UI consumers |
| IndexedDB | Durable structured client data and offline records |
| Component/shared state | Current UI state |
| Backend cache | Reduce server-side data-store work |
| Database | Authoritative durable server state |

Avoid accidental duplication. For every layer, define ownership, freshness, invalidation, quota, and failure behavior. A cache is not a source of truth unless the product explicitly makes it one.

## 13. Design Exercise: Infinite Social Feed

An infinite feed combines server state, pagination, local interaction state, media, offline behavior, scroll restoration, and cross-tab updates.

### 13.1 Data and Pagination

Use cursor-based pagination for a changing feed. Store shared entities separately from page membership when normalization provides useful cross-view consistency. Avoid downloading the entire feed on every refresh; refresh the newest segment and preserve older pages.

Deduplicate concurrent requests and use query keys that include feed identity, filters, and cursor. Apply stale-while-revalidate only when showing temporarily stale content is acceptable.

### 13.2 Offline Startup and Storage

Persist selected posts, feed-page metadata, and pending mutations in IndexedDB. On startup, render cached content promptly, then revalidate when the network is available. Bound the amount and age of stored media and evict least-recently-used disposable entries under storage pressure.

### 13.3 Likes and Ordering

Likes can use optimistic updates with rollback, but rapid like/unlike actions can produce out-of-order responses. Use mutation identifiers, sequencing, and idempotent desired-state operations to preserve the intended final state.

Prefer pessimistic confirmation for high-risk operations where an incorrect optimistic display would mislead users.

### 13.4 Memory, Virtualization, and Scroll

Infinite feeds should not retain every rendered component and DOM node. Virtualize or window the visible items with a small overscan region.

Virtualization introduces accessibility, dynamic-height, media-resizing, and anchor-stability concerns. For navigation back to the feed, restore an anchor post and its offset rather than relying only on a pixel scroll position, since content may have changed.

### 13.5 Cross-Tab Consistency

Use mechanisms such as BroadcastChannel or storage events when tabs need prompt updates. Account for message ordering, duplicate processing, and lifecycle changes; cross-tab messaging complements rather than replaces server authority.

## 14. Architecture Decision Summary

| Concern | Candidate decision | Rationale |
| ------- | ------------------ | --------- |
| Shareable filters and pagination | URL state | Supports deep links and browser history |
| Temporary component interaction | Local component state | Keeps ownership close to use |
| Backend-owned data | Query cache | Reuse, deduplication, and revalidation |
| Small non-sensitive preferences | `localStorage` | Simple persistence |
| Per-tab workflow state | `sessionStorage` or URL | Short-lived and scoped |
| Authentication session | Secure cookie architecture where appropriate | Avoids exposing session credential to ordinary JavaScript |
| Structured offline data | IndexedDB | Transactions, indexes, and durable records |
| Immutable static assets | Long-lived HTTP/CDN cache with versioned URLs | Efficient repeat delivery |
| Critical app shell | Service-worker precache where offline startup is required | Reliable startup |
| Feed pagination | Cursor-based | Better behavior as data changes |
| Low-risk like action | Optimistic update with sequencing/idempotency | Responsive UX with race protection |
| Payment or critical mutation | Pessimistic confirmation | Avoids misleading success state |
| Media cache | CDN/browser plus bounded runtime cache | Fast delivery with storage limits |
| Cross-tab changes | BroadcastChannel or equivalent where required | Keeps active tabs more consistent |

The right choice depends on data authority, freshness, sensitivity, lifecycle, and recovery requirements. Avoid selecting storage or caching technology before answering those questions.
