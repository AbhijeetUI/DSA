# Quick Revision Guide — Storage · Auth · Service Workers · Cache · Copy Semantics
*(Staff-level interview cram sheet — read top to bottom in ~10 minutes)*

---

## 1. Mental Model (say this first)
> Pick a storage by answering 3 questions: **how long should it live, who needs to read it (server vs JS), and how big is it.** Never pick by habit.

---

## 2. The Storages at a Glance

| Storage | Size | Lifetime | Auto-sent to server? | Sync/Async |
|---|---|---|---|---|
| Cookies | ~4KB | Configurable | **Yes** | Sync |
| Session Storage | ~5MB | Tab close | No | Sync |
| Local Storage | ~5–10MB | Until cleared | No | Sync |
| IndexedDB | 100s of MB | Until cleared | No | Async |
| Cache Storage | Large | Until cleared | No | Async |

**Decision table:**
- Server-owned, must survive XSS → **Cookie (`HttpOnly`)**
- Tab-scoped draft (multi-step form) → **Session Storage**
- Cross-tab preference (theme/lang) → **Local Storage**
- Large structured/offline data → **IndexedDB**
- Caching HTTP req/res pairs for a SW → **Cache Storage**

---

## 3. Cookies & Auth

- **Why cookies exist at all:** the only storage the *server* can set that JS can be locked out of. `HttpOnly` → JS structurally cannot read/write it (survives XSS token theft).
- **Flags:**
  - `HttpOnly` — blocks JS access entirely.
  - `Secure` — HTTPS only.
  - `SameSite` — CSRF defense (see below).
  - `Max-Age`/`Expires` — only storage the *browser* auto-expires.
- **SameSite:**
  - `Strict` — cookie never sent on cross-site nav (banking).
  - `Lax` (default for most apps) — sent on top-level cross-site nav, **not** on cross-site POST/PUT/DELETE → blocks classic hidden-form CSRF.
  - `None` — always sent (public/no-session content).
  - Key nuance: the browser doesn't reject the CSRF request — it just withholds the cookie; the **server** rejects with 401/403.
- **Access/refresh token flow:**
  - Login → server sets `HttpOnly` short-lived access token + long-lived refresh token cookies.
  - Access token expires → next request gets 401.
  - **Browser never auto-refreshes** — client code (interceptor) must catch 401, call `/refresh`, retry.
  - "Infinite session" (Facebook/Amazon style): sliding-window — each refresh issues a *new* refresh token if the old one is close to expiry, as long as the user stays active. Backend is always the source of truth; never trust client-only expiry tracking.
- **Cons:** sent on every request (perf cost), hard 4KB cap, misconfigured `SameSite` still allows CSRF even with `HttpOnly` set (XSS can still *trigger* requests, just can't *read* the cookie).

---

## 4. Session Storage vs Local Storage

| | Session Storage | Local Storage |
|---|---|---|
| Scope | Per-tab | Per-origin, all tabs |
| Lifetime | Tab close | Until explicitly cleared |
| Good for | Multi-step form drafts | Theme/lang/UI prefs, non-sensitive cache |
| Never for | Auth tokens | Auth tokens, PII |

- **Same-Origin trap:** scoped by full tuple (protocol + domain + port). `app.example.com` ≠ `api.example.com`. Subdomains do **not** share storage.

---

## 5. IndexedDB

- Fills the gap: large, structured, **non-blocking** storage (session/local storage are sync + capped small on purpose; IndexedDB is async *because* of its size).
- Structure: Database → Object Store (table) → Records → Indexes.
- Callback lands on the **macrotask queue** (same as `setTimeout`).
- Use for: offline-first data, large datasets, structured/queryable client data. Avoid for: tiny prefs, temp UI state, auth tokens.

---

## 6. Expiry Is Manual (except cookies)
Local Storage / IndexedDB have **no built-in TTL** — you must implement it yourself (per-entry `lastUpdated` timestamp + staleness check on read). Skipping this → silent stale-data accumulation, storage bloat, schema-mismatch bugs across app versions.

---

## 7. Service Workers

- **Definition (memorize):** *"A background JS script that runs separately from the main UI thread, and can intercept network requests, cache resources, and handle background tasks like push notifications."*
- Built-in Web Platform API. **Cannot touch the DOM.** Can run even when the tab is closed (e.g., push notifications).
- **Lifecycle:** Register → Install (pre-cache assets, not yet controlling page) → Activate (old SW discarded, new one takes control) → Idle (handles fetch/push/message). `self.skipWaiting()` = activate immediately instead of waiting for old tabs to close.
- **Talking to the main thread:** pub/sub via `postMessage` — SW can't touch DOM directly, it asks the main thread to. Exception: APIs explicitly granted to SW (e.g. `clients.openWindow()`).
- **What a SW can access:** Cache Storage (its native tool) and IndexedDB (async-compatible). **Cannot** access `localStorage`/`sessionStorage` (sync, window-bound).
- **What SWs are NOT:** not a DOM tool, not a backend replacement, not a security boundary.

### 🚩 THE flagship question: "JS is single-threaded — how do SWs run in parallel?"
> **Answer:** JS is single-threaded **per execution context**, not per tab/browser. Main thread and SW each get their own call stack + event loop, communicate only via message-passing, **no shared memory**. The browser runs multiple single-threaded contexts side-by-side — the single-threaded rule is never broken *within* a context.

---

## 8. Web Worker vs Service Worker

| | Web Worker | Service Worker |
|---|---|---|
| Relationship | General-purpose superset | Specialized subtype |
| Use case | Heavy CPU work (offload from main thread) | Offline, caching, push |
| DOM access | No | No |
| Persistence | Dies with the page | Can outlive the page |

---

## 9. Cache Storage

- **Definition:** browser storage for **HTTP request/response pairs** (HTML, JS, CSS, images, API GETs) — not arbitrary objects like IndexedDB.
- The **one** storage a SW can natively/idiomatically use for network-layer caching (IndexedDB is reachable too, but Cache Storage is purpose-built).
- **Interview signal:** Cache Storage itself is low-priority to know deeply; Service Worker concepts (esp. the single-threaded question) are asked far more.

### Three caching strategies (know when to use each)
1. **Cache-first** (fallback network) — static assets, content that rarely changes.
2. **Network-first** (fallback cache) — needs freshness, but must survive offline.
3. **Stale-while-revalidate** — serve cache instantly, refresh in background — the Facebook-feed pattern.

### Cache Storage vs IndexedDB vs Browser (HTTP) Cache
| | Cache Storage | IndexedDB | Browser Cache |
|---|---|---|---|
| Stores | HTTP req/res pairs | Structured JS data | Whatever browser decides |
| Controlled by | You | You | Browser only — no dev API |
| SW primary consumer? | Yes | Not typically | N/A |

- **Client vs backend (Redis) caching:** no universal answer — layer both. Backend caches canonical latest data; client caches a working set for instant load, reconciled via stale-while-revalidate. **Never cache client-side anything damaging if leaked** (secrets, PII, mutable business-critical state).

---

## 10. Copy Semantics & Prototypes — Rapid Rules

- **Instance property vs `.prototype` property:**
  - Set on instance → **shadows** (own property, isolated to that instance).
  - Set on `.prototype` → **true override** (visible to all instances, current + future).
- **Shallow copy (`{...obj}`, `Object.assign`):** primitives copied independently; nested objects/arrays only copy the **reference** — mutating nested data affects both copies.
- **`JSON.parse(JSON.stringify(x))` pitfalls:** silently drops `undefined` and functions, converts `Date` → string, **throws** on circular references. Use `structuredClone()` or a real deep-clone (e.g. lodash `cloneDeep`) instead.
- **Passing an object into a constructor is passing a reference** — two instances holding "the same" nested object are actually sharing one object in memory; mutate through either, both see it.
- **`Object.create(parent)`:** child has no own property until explicitly set; `delete` only removes an *own* property, never reaches into the prototype.
- **`super.method()`:** explicitly invokes the parent class's method (not just constructor chaining).

---

## 11. Elevator Pitches (say out loud)

- *"I pick storage by lifetime, ownership (server vs JS), and size — cookies for server-owned auth, session/local for small client UI state, IndexedDB/Cache Storage once size or offline needs grow."*
- *"HttpOnly cookies exist so that even a successful XSS payload structurally cannot read the auth token — that's a stronger guarantee than anything enforced purely in app code."*
- *"The browser never auto-refreshes tokens — that's my interceptor's job: catch 401, hit refresh, retry."*
- *"Service workers don't break single-threaded JS — they prove 'single-threaded' is per execution context, not per tab. Each context has its own call stack and event loop, coordinated only via message-passing."*
- *"A shallow copy only truly copies primitives — nested references are shared, which is the root cause of most 'my state mysteriously changed' bugs."*
- *"I avoid JSON stringify/parse for cloning beyond flat primitive data — it silently drops functions/undefined, mangles Dates, and throws on cycles. `structuredClone` is the safer default."*

---

## 12. Last-Minute Self-Test (cover the answers, quiz yourself)

1. Why can't page JS read an `HttpOnly` cookie?
2. `SameSite=Strict` vs `Lax` — practical difference?
3. Does the browser refresh expired tokens automatically?
4. Is local storage shared across subdomains?
5. Why is IndexedDB async but local/session storage sync?
6. Can a Service Worker read `localStorage`? What *can* it read?
7. How do SWs run "in the background" without breaking single-threaded JS?
8. Web Worker vs Service Worker — one line each?
9. What does a shallow copy actually copy?
10. Three failure modes of `JSON.parse(JSON.stringify(x))`?
11. Instance property vs `.prototype` property — shadow or override?
12. Client vs backend caching — how do you decide?

*(Full explanations for all of these are in the source notes if you need to double back.)*
