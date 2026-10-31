# Offline-First & Progressive Web Apps

## Module Goal

Design frontend applications that remain useful under unreliable networks, recover safely from failures, synchronize local and remote state, and deliver app-like experiences without sacrificing correctness, security, or maintainability.

Offline-first is not simply “make the website installable” or “cache everything.” It is a client architecture that may accept durable changes while disconnected, queue them, retry safely, and resolve concurrent updates. Once the client accepts offline mutations, it becomes a node in a distributed system.

## Table of Contents

- [1. Offline Architecture Fundamentals](#1-offline-architecture-fundamentals)
- [2. Progressive Web Apps](#2-progressive-web-apps)
- [3. Service Workers](#3-service-workers)
- [4. Caching Strategies](#4-caching-strategies)
- [5. Durable Offline Data](#5-durable-offline-data)
- [6. Synchronization and Retry](#6-synchronization-and-retry)
- [7. Conflict Detection and Resolution](#7-conflict-detection-and-resolution)
- [8. Offline User Experience](#8-offline-user-experience)
- [9. Reliability and Operational Concerns](#9-reliability-and-operational-concerns)
- [10. Design Exercise: Offline-First Notes](#10-design-exercise-offline-first-notes)
- [11. Architecture Decision Summary](#11-architecture-decision-summary)
- [12. Interview Takeaways](#12-interview-takeaways)

---

## 1. Offline Architecture Fundamentals

### 1.1 Online-First and Offline-First

In an online-first application, a user action usually waits for a server response before the UI considers it complete:

```text
User action → Request → Server → Response → UI update
```

That is appropriate for many operations, especially when a server must authorize or validate each action. If the network fails, the operation may fail.

In an offline-first application, local durable state is the primary interaction path:

```text
User action → Local durable write → Immediate UI update → Queue for synchronization
```

The network becomes a synchronization mechanism. Notes, drafts, field inspections, and task lists can be good candidates. Payments, live auctions, and other actions that must be authorized or settled centrally should not be represented as successfully completed while offline.

| Dimension | Online-first | Offline-first |
| --------- | ------------ | ------------- |
| Primary dependency | Server | Local store |
| Write latency | Network-bound | Local |
| Offline behavior | Fallback | Core operating mode |
| Data freshness | Usually current after a response | May be stale |
| Conflict handling | Often server-side | Required for concurrent edits |
| Complexity | Lower | Higher |

Adopt offline-first when the value of continuing work during unreliable connectivity outweighs the synchronization and conflict complexity.

### 1.2 Connectivity Is Not a Boolean

Real network conditions include high latency, packet loss, intermittent connectivity, captive portals, DNS failures, timeouts, mobile network switching, background suspension, and temporary server outages.

`navigator.onLine` is only a hint: a device can be connected to Wi-Fi while the API is unreachable. Treat connectivity as an observed capability based on browser signals and recent request outcomes, not as a guarantee.

### 1.3 Offline-Capable vs. Offline-First

- **Offline-capable:** The application provides some fallback behavior when disconnected; the network remains its normal execution path.
- **Offline-first:** Local data and local operations are the primary execution path; synchronization happens when possible.

A robust design makes explicit what is available offline, what may be stale, whether a change is saved locally, and what must still synchronize.

### 1.4 Layered Architecture

A mature design commonly includes:

```text
UI and sync status
    ↓
Application commands and queries
    ↓
Local repository and durable database
    ↓
Mutation queue and sync engine
    ↓
Service worker for app shell and request caching
    ↓
Remote synchronization API and server data store
```

The service worker handles request and asset strategies; it is not the application database or the synchronization engine.

## 2. Progressive Web Apps

A Progressive Web App (PWA) uses web capabilities to provide reliable, installable, app-like experiences while remaining accessible through the web.

### 2.1 Web App Manifest

The manifest describes application metadata and launch behavior. Common properties include:

- `name` and `short_name`.
- `start_url`.
- `display`, such as `browser` or `standalone`.
- `scope`.
- Icons and their sizes.

For example:

```json
{
  "name": "Offline Notes",
  "short_name": "Notes",
  "start_url": "/app",
  "display": "standalone",
  "scope": "/app/"
}
```

Standalone display can reduce browser chrome, but changes navigation expectations and requires careful deep-link behavior.

### 2.2 Installation and App-Like Experience

Installability depends on browser-specific rules, application metadata, and a secure context. Availability and behavior vary across browsers and platforms.

An app-like experience is about reducing user friction through reliable startup, persistent sessions, offline resilience, responsive interactions, and predictable navigation—not merely copying native UI.

**Benefits** include URL-based distribution, installability, a shared web stack, and no mandatory app-store distribution. **Costs** include browser capability differences, service-worker and update complexity, cache invalidation risks, platform limitations, and debugging effort.

## 3. Service Workers

A service worker is a browser-managed worker that can intercept requests and coordinate caching or background-oriented tasks. It runs separately from the page and can act as a programmable network layer:

```text
Page → Service Worker → Cache and/or Network
```

### 3.1 Lifecycle

The lifecycle is approximately:

```text
Download → Install → Waiting → Activate → Control pages
```

During installation, a worker may precache a critical application shell. During activation, it may clean up obsolete caches. Fetch events allow it to apply a strategy appropriate to each request.

### 3.2 Precache and Runtime Cache

Precache only the assets required for reliable startup. Aggressive precaching can cause large installation downloads, storage pressure, install failures, and stale assets. A common approach is:

```text
Critical application shell → Precache
Other assets and responses → Runtime caching by resource semantics
```

### 3.3 Updates and Versioning

An updated worker may wait while pages controlled by the previous version remain open. Decide whether to let the new worker activate safely after old clients close or prompt users to refresh. Immediate activation can pair an old page with new caching behavior or incompatible assets.

Cache cleanup and deployment strategy must account for open tabs that may still request old chunks. Coordinate service-worker versions, immutable asset names, and server retention policies to avoid breaking active clients.

## 4. Caching Strategies

Choose a strategy by resource semantics and freshness requirements, not only URL patterns.

| Strategy | Behavior | Suitable examples | Main risk |
| -------- | -------- | ----------------- | --------- |
| Cache First | Return cached response; fetch and cache on miss | Hashed JS/CSS, fonts, versioned images | Stale content if cache invalidation is wrong |
| Network First | Try network; use cache on failure | User profile or news feed where freshness matters | Slow fallback unless the request is bounded |
| Stale While Revalidate | Return cache immediately and refresh in background | Article lists, avatars, semi-dynamic catalogs | User may initially see stale data |
| Network Only | Always use network | Payment submission, authorization, sync mutations | No offline fallback |
| Cache Only | Return only a precached response | Offline shell or bundled tutorial assets | Fails if the requested resource was not cached |

For Network First, consider a bounded timeout before falling back to cache; a long network wait can make an otherwise resilient experience feel broken.

### 4.1 Hybrid Strategy Example

An e-commerce PWA may use:

- Application shell and hashed assets: Cache First.
- Product images: Cache First.
- Product catalog: Stale While Revalidate.
- Inventory: Network First with clearly labeled fallback where appropriate.
- Checkout and payment: Network Only.
- Static help documentation: Cache First.

Application data such as notes generally belongs in IndexedDB, not merely in Cache Storage.

## 5. Durable Offline Data

Caching responses is not sufficient for offline-first applications. User-generated data, pending mutations, and synchronization metadata need durable structured storage.

### 5.1 Why IndexedDB

`localStorage` is synchronous, has a simple key-value model, lacks indexing and transactions, and is not a good fit for large structured data. IndexedDB provides asynchronous structured storage, indexes, and transactions for data such as:

- Notes or tasks.
- Pending mutations.
- Sync cursors and metadata.
- Entity versions and conflict state.

### 5.2 Local-First Write Path

Persist the local change and its pending mutation before showing it as saved:

```text
User edit
  → IndexedDB transaction: update entity + append mutation
  → UI reflects locally saved state
  → Sync engine sends mutation when possible
```

Use a transaction so the visible local entity and its queued operation cannot diverge if only one write succeeds.

### 5.3 Mutation Queue Design

A durable mutation entry may include:

```json
{
  "id": "mutation-123",
  "type": "UPDATE_NOTE",
  "entityId": "note-123",
  "baseVersion": 4,
  "payload": {
    "title": "Updated title"
  },
  "createdAt": 1720000000000,
  "retryCount": 0,
  "status": "pending"
}
```

Mutation IDs support idempotency; entity IDs support ordering; `baseVersion` supports conflict detection. Avoid deleting queued data merely because synchronization or authentication fails.

### 5.4 Queue Ordering and Compaction

Operations on one entity may depend on one another: create, update, then delete. Preserve per-entity ordering while allowing independent entities to synchronize concurrently.

Queue compaction can reduce work. Multiple updates to a not-yet-synchronized created entity may become one create with the latest state. A create followed by delete before synchronization may be removed entirely if the server never knew the entity.

For deletions of entities that already exist remotely, preserve a tombstone until the delete has synchronized; otherwise the server may never learn that the record should be removed.

## 6. Synchronization and Retry

The synchronization engine sends pending local changes, incorporates remote changes, updates cursors, and exposes progress to the UI.

### 6.1 Incremental Synchronization

Do not refetch an entire large dataset after every reconnect. Use a cursor or version token to fetch changes since the last successful synchronization, including deletion records:

```text
Push pending mutations
  → Pull changes since cursor
  → Apply accepted changes
  → Resolve conflicts
  → Persist new cursor and local state
```

A sync API may batch mutations and return accepted IDs, conflicts, remote changes, and a next cursor.

### 6.2 Retry Classification and Backoff

Classify errors before retrying:

- **Often retryable:** temporary network errors, `502`, `503`, and some `429` responses (respect server guidance).
- **Requires intervention or resolution:** validation errors, `400`, authentication expiry (`401`), authorization failure (`403`), and conflicts.

Retrying every failure forever can drain battery, overload the server, and duplicate operations. Use exponential backoff with jitter for transient failures:

```text
delay = min(maxDelay, baseDelay × 2^retryCount) + random jitter
```

Jitter spreads retries after a large outage so clients do not all retry simultaneously.

### 6.3 Idempotency

A request can succeed on the server while its response is lost. Retrying a create without idempotency may create duplicates. Give each mutation a stable idempotency key and have the server safely recognize a repeated operation.

This is especially important for orders, bookings, payments, and resource creation. A retry is safe only when the operation is designed for duplicate delivery.

### 6.4 Background Sync

The Background Sync API can be used as an enhancement where supported, but browser scheduling is not universal or guaranteed. Keep an application-managed sync engine as the primary mechanism, triggered by startup, user action, visibility/network signals, and appropriate retry logic.

## 7. Conflict Detection and Resolution

Two devices can edit the same entity while disconnected. Silently overwriting one edit can lose user data.

### 7.1 Version-Based Detection

The client sends the version it edited, such as `baseVersion: 4`. If the server is already at version 6, it can reject or flag the mutation as a conflict rather than blindly overwriting newer state.

### 7.2 Resolution Strategies

| Strategy | Rule | Benefits | Risks |
| -------- | ---- | -------- | ----- |
| Last Write Wins | The latest timestamp wins | Simple and automatic | Clock skew and silent data loss |
| Server Wins | Keep the server copy | Clear central authority | Can discard offline work |
| Client Wins | Overwrite server with local copy | Preserves local intent | Can overwrite newer remote state |
| Field-level merge | Merge independent fields | Preserves non-overlapping edits | More metadata and merge complexity |
| Manual resolution | User chooses or combines versions | Appropriate for valuable content | Adds UX friction |

Use domain-specific policies. A simple preference may use Last Write Wins; document content may need a manual merge or a specialized collaboration model.

### 7.3 Operation-Based Sync and CRDTs

Some systems synchronize operations (for example, increments) rather than replacing complete state. Collaborative editors may use conflict-free replicated data types (CRDTs) to merge concurrent operations deterministically.

These approaches can enable convergence but add specialized data models, metadata, testing, and debugging complexity. Do not introduce CRDTs merely because an application supports offline mode.

## 8. Offline User Experience

The UI must explain what is available, how current the data is, what is saved, what is pending, and what failed.

### 8.1 Connectivity and Stale Data

Do not rely only on `navigator.onLine`. Combine browser signals with recent API outcomes. Show the data timestamp and clarify when cached data is displayed:

```text
Offline — showing saved data. Last synced 10:42 AM.
```

Staleness has domain-specific consequences: an old note may be acceptable, while stale inventory or financial data may be unsafe to treat as current.

### 8.2 Explicit Sync States

Represent sync state explicitly, for example:

```text
Local → Pending → Syncing → Synced
                    ↘ Failed
                    ↘ Conflict
```

“Saved on this device” is different from “Synced.” Do not claim synchronization succeeded before the server confirms it.

### 8.3 Failures and Authentication Expiry

If authentication expires while changes are queued:

1. Pause synchronization.
2. Preserve all local mutations.
3. Ask the user to reauthenticate.
4. Resume the queue after authentication succeeds.

Communicate that work remains saved locally and explain what is needed to sync it. Never silently discard pending user data because a retry failed.

### 8.4 Conflict UX

For conflicts, show the local and server versions and offer actions such as keeping one version or merging changes. Use automatic resolution where safe; do not force manual resolution for every field.

## 9. Reliability and Operational Concerns

### 9.1 Multiple Tabs

Several tabs may start synchronization simultaneously and submit the same mutation. Coordinate a sync leader with mechanisms such as Web Locks or BroadcastChannel where appropriate, and retain server-side idempotency because browser coordination alone is not sufficient.

### 9.2 Storage Pressure

Browser storage is limited and may be evicted. Prioritize data according to business value:

1. Unsynced user-generated data.
2. Synced user data and essential metadata.
3. API cache.
4. Regenerable images and temporary assets.

Use TTL or LRU cleanup for disposable cache data, but do not silently evict unsynced work. Handle quota failures explicitly and give users a way to protect or export critical data when needed.

### 9.3 Deletion and Tombstones

Keep a deletion marker until the server has acknowledged the delete. Remove the tombstone only when it is safe to do so, such as after the relevant synchronization cursor confirms the remote change.

## 10. Design Exercise: Offline-First Notes

### 10.1 Requirements

**Functional**

- Create, edit, delete, list, and search notes.
- Read and write notes offline.
- Synchronize across devices.
- Handle conflicts and recover from failures.

**Non-functional**

- Fast startup and immediate local writes.
- No silent loss of unsynced work.
- Eventual consistency across devices.
- Resilient retries and observable sync state.

### 10.2 High-Level Architecture

```text
UI: Notes, search, connectivity and sync indicators
  ↓
Application layer: Commands and queries
  ↓
IndexedDB: Notes, pending mutations, sync metadata
  ↓
Sync engine: Ordering, retry, backoff, idempotency, conflicts
  ↓
Remote sync API: Mutation acceptance, versions, incremental cursor
  ↓
Server database

Service worker: App shell, static assets, request caching
```

### 10.3 Startup and Reconnection

**Offline startup:**

```text
Launch → Cached app shell → Read IndexedDB → Render local notes
```

**When connectivity is available:**

```text
Observe network/API availability
  → Push pending mutations in order
  → Pull remote changes since cursor
  → Resolve conflicts
  → Persist results and cursor
  → Refresh reactive UI state
```

### 10.4 Design Choices

- Store notes and mutations in IndexedDB.
- Use client-generated IDs so notes can be created offline.
- Make writes transactional and show “Saved locally.”
- Use idempotency keys and per-entity ordering.
- Use incremental sync rather than downloading every note on reconnect.
- Detect conflicts with versions and choose resolution by field semantics.
- Keep authentication and payment operations network-dependent.
- Use Background Sync only as progressive enhancement.
- Coordinate tabs while retaining server-side duplicate protection.

## 11. Architecture Decision Summary

| Decision | Recommended approach | Why |
| -------- | -------------------- | --- |
| Primary storage for structured offline data | IndexedDB | Durable structured data and transactions |
| App shell | Cache First | Reliable startup without network |
| Immutable hashed assets | Cache First | Assets change by version |
| User writes | Local-first, persisted transactionally | Immediate interaction and durable intent |
| Mutations | Durable queue with stable IDs | Survives reloads and supports retry |
| Synchronization | Incremental cursor | Scales with data size |
| Retry | Failure classification, exponential backoff, jitter | Avoids retry storms and permanent retry loops |
| Duplicate prevention | Idempotency keys | Safe replay after ambiguous failures |
| Ordering | Per-entity ordering | Preserves dependent operations |
| Deletion | Tombstones until acknowledged | Ensures remote deletion is delivered |
| Conflict detection | Version-based optimistic concurrency | Prevents silent overwrite |
| Conflict resolution | Hybrid, domain-specific policy | Matches business semantics |
| Background sync | Progressive enhancement | Browser support and scheduling vary |
| Multi-tab sync | Leader coordination plus idempotency | Reduces duplicate work safely |

## 12. Interview Takeaways

A strong system-design answer should distinguish:

- Offline-first from “cache everything.”
- PWA installability from offline-first data architecture.
- Service Worker from application database.
- Cache Storage from IndexedDB.
- Retry from safe retry.
- “Saved locally” from “synced.”

Safe synchronization requires durable mutations, ordering, idempotency, backoff, failure classification, and an explicit conflict strategy.

The central principle is: once a frontend accepts durable mutations while disconnected, it becomes part of a distributed system.
