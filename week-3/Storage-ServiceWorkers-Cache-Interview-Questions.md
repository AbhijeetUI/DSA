# Staff/Senior Engineer Interview Question Bank
### Browser Storage · Cookies & Auth · Service Workers · Web Workers · Cache Storage · Prototypal Inheritance & Copy Semantics

> Derived from `JS-Storage-ServiceWorkers-Cache-Interview-Notes.md`. Every question is written the way a staff/senior interviewer actually asks it: as a scenario, a bug report, or a snippet — not "define X." Each answer models what a **strong candidate says out loud**: the mechanism, the production trade-off, the edge case, and how they'd debug it live. Use this to rehearse *talking*, not just recalling.

**Difficulty key:** 🟡 Medium · 🔴 Hard (staff-level, multi-concept, or "no clean answer" judgment calls)

---

## Section A — Cookies & Auth

### A1. 🔴 The mystery logout
**Scenario:** Your team ships a SPA where `HttpOnly` + `Secure` + `SameSite=Lax` cookies hold the access/refresh tokens. QA reports: "Users on Safari get randomly logged out after ~7 days of inactivity, but Chrome users don't." Your refresh token is configured for 30-day expiry server-side. Walk through how you'd triage this, and name at least two plausible root causes that have nothing to do with your token expiry logic.

<details><summary>Model Answer</summary>

**Triage approach (say this first — shows methodical thinking under pressure):**
1. Confirm it's not actually a 30-day expiry — is "7 days" consistent across users, or does it correlate with something else (device, browser, private mode)?
2. Check whether the cookie is even present on the request that fails — is this a *missing cookie* problem or a *401 the client isn't handling* problem? (Network tab, not assumptions.)
3. Reproduce on Safari specifically before theorizing.

**Plausible root causes to raise:**
- **Safari's Intelligent Tracking Prevention (ITP)** caps script-writable/some cross-site storage lifetimes and has historically been more aggressive about capping cookie lifetime than Chrome for certain cookie configurations — worth checking if the cookie is being treated as "cross-site" in some flow (e.g., an iframe, a redirect chain through a different subdomain) that Chrome doesn't penalize the same way.
- **`SameSite=Lax` + a redirect-based auth flow** (OAuth-style bounce through a third-party domain) can behave differently across browsers in how the "top-level navigation" is counted.
- Non-technical but common: **the client's refresh interceptor silently fails** (e.g., it retries once, gets a network blip, doesn't retry again) and the team *assumed* it was expiry when it was actually a client bug — this is the classic trap the notes call out: *the browser never auto-refreshes; that's application code*, so first suspect the interceptor before suspecting the token TTL.

**Why this is a good staff-level answer:** it doesn't jump to "must be a cookie bug" — it separates *cookie absence* from *client logic failure* from *browser-specific storage policy*, and it explicitly avoids blaming the server's stated 30-day config without evidence.
</details>

---

### A2. 🟡 CSRF, but make it precise
**Scenario:** A junior engineer on your team says: *"We're safe from CSRF because we use `SameSite=Strict` on all our cookies."* Your PM then asks: "So if `SameSite` blocks it, why do some of our forms also send a CSRF token in the body?" How do you answer both, and is the junior engineer wrong?

<details><summary>Model Answer</summary>

The junior engineer isn't *wrong*, but they're overconfident. `SameSite=Strict`/`Lax` blocks the cookie from being **attached** on a cross-site request — the malicious form still fires, the server still receives the request, it just arrives with **no valid session cookie**, so the server rejects it as unauthenticated. That's a strong defense for browsers that correctly implement and don't misconfigure `SameSite`.

**Why the CSRF token is still there as defense-in-depth:**
- Misconfiguration risk — someone loosens `SameSite` to `None` for a legitimate cross-site use case later (e.g., an embedded widget) and silently reopens the CSRF hole on that same cookie.
- Older browsers / non-compliant clients that don't fully honor `SameSite`.
- **Belt-and-suspenders is a legitimate production posture** — you don't rely on a single control for account-takeover-class vulnerabilities; layered controls (SameSite + CSRF token + origin header checks) is the actual industry-standard pattern, not redundancy for its own sake.

**The precise mental model to state:** *"SameSite prevents the cookie from being attached; it doesn't prevent the request from being sent. The distinction matters because it tells you exactly which layer failed if something ever does slip through."*
</details>

---

### A3. 🔴 Design the "infinite session" — then break it
**Scenario:** You're asked to design the sliding-window refresh-token pattern for a consumer app (à la Facebook/Amazon) that "never" logs users out. Sketch the rule, then give the interviewer the one edge case that will make your design leak a session to an attacker if you get it wrong.

<details><summary>Model Answer</summary>

**The rule:** short-lived access token (e.g., 1 min–15 min) on every request; long-lived refresh token (e.g., 10–30 days). Whenever `/refresh` is called and the refresh token has less than some threshold left before its own expiry, issue a **brand-new refresh token** alongside the new access token — this resets the clock, so any user active at least once per window never sees a forced logout.

**The edge case that breaks it if mishandled — refresh token reuse detection:**
If you don't invalidate the *old* refresh token the moment a new one is issued, an attacker who stole an old refresh token (e.g., via a leaked log, a compromised device, a MITM before you added `Secure`) can keep using it **indefinitely in parallel with the legitimate user**, because both tokens "work." The fix: refresh tokens must be **single-use** — issuing a new one immediately revokes the old one server-side, and if the *old* (already-rotated) token is ever presented again, that's a strong signal of theft, and the correct response is to **revoke the entire token family**, not just deny that one request, and force a real re-login.

**Second edge case worth naming:** the "user hasn't opened the app in 6 months" case — both tokens are truly expired, and the notes are explicit that this is a **product decision, not a technical one**: force logout (secure default) vs. device-trust re-issuance (usability-first, deliberately trading some security). A staff engineer should be able to articulate that trade-off rather than pretending there's one universally correct answer.
</details>

---

## Section B — Session / Local Storage

### B1. 🟡 Debug this from a bug report
**Scenario:** A user files a bug: *"I filled out your multi-step signup form, opened a second tab to check something, came back to tab 1, and all my progress in the second tab was gone — but tab 1 was fine."* The engineer who built this used `sessionStorage`. Is this a bug? What would you tell the user, and what would you change (if anything)?

<details><summary>Model Answer</summary>

**This is not a bug — it's `sessionStorage` working exactly as specified.** `sessionStorage` is **per-tab**, not shared across tabs of the same origin (unlike `localStorage` or cookies). Opening a second tab starts a fresh, independent `sessionStorage` bucket, even on the same site.

**What to tell the user:** frame it as expected behavior, not broken software — "each browser tab keeps its own separate progress for this form by design."

**What I'd actually change, if this is a recurring complaint:** it depends on the *product* requirement, not the technical one:
- If cross-tab continuity matters, switch the draft-persistence key to `localStorage` (persists across tabs, same origin) — but now you own manual cleanup/expiry, since `localStorage` has no built-in TTL.
- If it's specifically "resume where I left off after reopening the browser entirely," you need `localStorage` *plus* an explicit staleness check (the TTL pattern: store `lastUpdated`, check `Date.now() - lastUpdated > TTL` on read) so a 3-month-old abandoned draft doesn't silently reappear and confuse the user.

**The staff-level framing:** *"sessionStorage is tab-scoped by design — the fix isn't a bug fix, it's picking the storage whose lifetime actually matches the UX we want, and each swap has its own cleanup burden."*
</details>

---

### B2. 🔴 The silent storage-quota outage
**Scenario:** Your app caches non-sensitive API responses in `localStorage` with no expiry policy. Six months post-launch, support tickets spike: some long-time users report the app "freezes for a few seconds on load" and, in rare cases, `localStorage.setItem` throws in production logs. Diagnose the failure chain and propose a fix that doesn't just paper over the symptom.

<details><summary>Model Answer</summary>

**Failure chain:**
1. No expiry policy → the app has been writing to `localStorage` on every session for six months → data silently accumulates.
2. The browser allocates a **per-origin storage budget**; approaching or exceeding it causes visible jank (the "freeze on load" — likely from a large synchronous read/parse of a bloated `localStorage` blob, since local/session storage are **synchronous** and block the main thread).
3. Eventually `setItem` **throws a `QuotaExceededError`** once the origin's budget is exhausted — and if that throw isn't caught, it can break app initialization for the affected users entirely (worse than "slow," now "broken").

**This is exactly the failure mode the notes warn about:** *"apps that ship without an explicit expiry/versioning strategy for local storage... silently accumulate stale data across app versions."*

**The real fix (not a band-aid):**
- Implement the TTL pattern **per-entry**, not as one blanket flag — `{ value, lastUpdated }`, check staleness on read, overwrite instead of accumulate.
- Wrap every `setItem` call in try/catch and treat `QuotaExceededError` as a **prunable event**, not a crash — evict oldest/stale entries first, then retry the write once.
- Add a **schema version key** so that when the app's cached-data shape changes across a deploy, you can detect a version mismatch and wipe rather than trying to parse an old shape against new code (the notes flag this exact "old cached shapes don't match new expected schema" bug pattern).
- Longer-term: this workload (large, needs pruning, ideally non-blocking) is arguably **IndexedDB's job**, not `localStorage`'s — if the dataset is genuinely this large, migrate it rather than keep patching a storage type chosen for a different size class.

**Debugging-under-pressure angle to mention out loud:** you'd confirm the theory with real data before proposing a fix — check `navigator.storage.estimate()` for affected-profile origins, and correlate ticket timing with account age (older accounts = more accumulated writes) to prove causality rather than assume it.
</details>

---

### B3. 🟡 Output-based — origin scoping
```js
// Page is served from https://app.example.com
localStorage.setItem('theme', 'dark');

// Later, an <iframe> on the SAME page loads https://api.example.com/widget
// Inside that iframe's own script:
console.log(localStorage.getItem('theme'));
```
What does the iframe's script log? Explain precisely why, citing the exact scoping rule.

<details><summary>Model Answer</summary>

**Output: `null`.**

`localStorage` (and `sessionStorage`) is scoped to the **full origin tuple**: protocol + domain (including subdomain) + port. `app.example.com` and `api.example.com` are **different origins** even though they share the root domain `example.com` — the Same-Origin Policy does not consider subdomains equivalent. The iframe runs its own execution context scoped to `api.example.com`'s origin, which has never had `setItem('theme', ...)` called against it, so the read returns `null`.

**Follow-up trap to be ready for:** "What if I add `document.domain = 'example.com'` in both?" — historically this relaxed some same-origin restrictions for DOM access between same-parent-domain frames, but it does **not** merge `localStorage` buckets; storage partitioning is independent of that legacy mechanism, and browsers have been actively deprecating `document.domain` mutation entirely. The reliable fix for intentional cross-subdomain sharing is a shared backend/cookie-based mechanism (with correct `Domain` attribute) or explicit `postMessage` relaying — not relying on storage APIs to merge on their own.
</details>

---

## Section C — IndexedDB & Storage Decision-Making

### C1. 🔴 Pick the storage, defend the pick
**Scenario (rapid-fire, as asked live in a loop):** For each of the following, name the storage you'd reach for **and** the one specific reason that rules out the two next-best options. Answer in under 15 seconds each — this is how staff interviews test instinct, not just knowledge.

1. An offline-first note-taking app that must sync thousands of notes with rich text and attachments.
2. A "remember my dismissed banner" flag that's low-stakes if lost.
3. A checkout flow's multi-step shipping form.
4. Pre-caching the app shell (HTML/JS/CSS) so a repeat visit loads instantly, even offline.
5. The user's auth session.

<details><summary>Model Answer</summary>

1. **IndexedDB** — large, structured, async data. Rules out `localStorage`/`sessionStorage` (too small, sync = would block the main thread for a bulk sync operation) and Cache Storage (that's for HTTP req/res pairs, not arbitrary structured app objects like note metadata).
2. **`localStorage`** — persists across sessions/tabs, tiny payload, no security sensitivity, no need for the complexity of IndexedDB.
3. **`sessionStorage`** — tab-scoped is *correct* here (starting fresh in a new tab is acceptable/expected for a checkout flow), and it avoids the "stale draft resurfaces weeks later" problem that `localStorage` would introduce without extra TTL logic.
4. **Cache Storage** — it's the one storage built specifically for HTTP request/response pairs, and it's the one storage a Service Worker can natively reach without going through IndexedDB workarounds — this is the exact "pre-cache in the `install` event" use case.
5. **Cookie (`HttpOnly`, `Secure`, appropriate `SameSite`)** — it's the only storage the server fully controls and the only one structurally unreadable by page JS, which matters because auth tokens are the highest-value XSS target.

**What separates a strong answer here:** not just naming the storage, but naming *the other storage someone might wrongly pick* and the specific axis (size, sync/async, JS-readability, HTTP-pair-shaped-ness) that disqualifies it.
</details>

---

### C2. 🟡 Debug: "IndexedDB write succeeded but data is gone"
**Scenario:** A teammate says: *"I call `store.put(record)` inside a transaction, log a success callback, but when I reload the page and query for that record, it's not there. No errors anywhere."* Give two concrete, specific causes (not "check your code") and how you'd confirm each.

<details><summary>Model Answer</summary>

1. **Transaction auto-commit / scope mismatch** — if the `put()` happens *after* the transaction's task has already yielded back to the event loop (e.g., inside a `then()` continuation that runs after other microtask/macrotask work), the transaction may have already auto-committed or been considered "done," and the write silently targets a transaction that's no longer active or throws in a way that's easy to miss if the catch isn't wired up. **Confirm:** log the transaction's `oncomplete`/`onerror` events explicitly (not just the request's success callback) — `oncomplete` firing is the real "the data is durable" signal, not the individual request succeeding.
2. **Reading from a different `objectStore` version/name than expected**, e.g., an `onupgradeneeded` handler that's recreating the store (and wiping it) on every page load because the version-bump logic is off, or the read query is scoped to the wrong index/key path. **Confirm:** open the DB in DevTools' Application tab and manually inspect the store's contents right after the "successful" write, before any reload — if it's empty there too, it's a write-scope bug, not a reload/persistence bug.

**Debugging instinct to voice:** *"Success at the request level isn't the same guarantee as success at the transaction level — I'd want to see the transaction's own completion event before trusting that write."*
</details>

---

## Section D — Service Workers & Web Workers

### D1. 🔴 The flagship question, asked as a scenario
**Scenario:** Your PM, non-technical, asks: *"Wait, I thought JavaScript could only do one thing at a time. How can this service worker be checking for push notifications while the user is actively typing in the app?"* Answer as you would to them, then answer the deeper follow-up an interviewer would ask next: *"So is the service worker running on a separate OS thread?"*

<details><summary>Model Answer</summary>

**To the PM:** JavaScript is single-threaded **within one running script**, but a browser tab can host multiple independent scripts, each with its own private "single thread." The main app and the service worker are two separate ones running side by side — think of the service worker as an invisible extra tab that only talks to the real page by passing notes back and forth, never by directly touching what's on screen. Neither one is ever doing two things at once *internally*, but the browser lets several of these "single-threaded workers" run concurrently.

**The deeper, technically precise follow-up answer:** JavaScript's single-threaded guarantee is **per execution context** (its own call stack + its own event loop), not per OS thread and not per tab. Whether the browser implementation happens to schedule that execution context on a separate OS thread/process under the hood is an **implementation detail the spec doesn't mandate** — what the spec guarantees is that within a given context, code still runs to completion one task at a time, there's no shared memory between contexts, and all coordination is via message-passing (`postMessage`). So the honest answer is: *"probably yes, in most modern browser implementations, for performance isolation — but that's an implementation detail, not something JavaScript's execution model requires. What the model requires is no shared memory and no synchronous cross-context calls."*

**Why this two-layer answer matters at staff level:** it shows you can translate a concept for a non-technical stakeholder *and* hold the more rigorous, spec-accurate version in reserve for a technical follow-up — conflating "no shared memory / message-passing" with "definitely on a separate OS thread" is a subtle overclaim some candidates make.
</details>

---

### D2. 🟡 Spot the bug
```js
// Inside sw.js
self.addEventListener('fetch', (event) => {
  const button = document.querySelector('#refresh-btn');
  button.classList.add('loading');
  event.respondWith(fetch(event.request));
});
```
This code was submitted in a PR titled "show a loading spinner during fetch interception." What's wrong, and what's the correct pattern to achieve the intended UX?

<details><summary>Model Answer</summary>

**The bug:** a service worker **cannot access the DOM at all** — no `document`, no `window`. This isn't a permissions restriction that throws a friendly error; `document` is simply `undefined` in that execution context, so `document.querySelector` throws a `ReferenceError`/`TypeError` immediately, likely breaking the entire `fetch` event handler (and therefore breaking network requests for anything that hits this listener) rather than just failing to show a spinner.

**The correct pattern — message-passing back to the main thread:**
```js
// sw.js
self.addEventListener('fetch', (event) => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage({ type: 'FETCH_START' }));
  });
  event.respondWith(fetch(event.request));
});
```
```js
// main thread (React/app code)
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'FETCH_START') {
    document.querySelector('#refresh-btn').classList.add('loading');
  }
});
```
The service worker only ever **asks** the main thread to do the DOM update via the publisher/subscriber pattern over `postMessage` — it never performs the mutation itself. Anything not explicitly exposed to service workers (like `clients.openWindow()`, which *is* granted) must be relayed this way.

**What this tests:** whether the candidate has internalized "no DOM access" as a hard architectural constraint, not a "best practice," and whether they know the *specific* mechanism (not just "workers can't do that") to route around it correctly.
</details>

---

### D3. 🔴 Design under a constraint
**Scenario:** Product wants: "when the app has a new version deployed, active users should get the update **immediately** on their next interaction, not after they've closed every tab." You're using a service worker for asset caching with a cache-first strategy. What two lifecycle mechanisms do you need, and what's the risk if you only implement one of them?

<details><summary>Model Answer</summary>

**Mechanism 1 — `self.skipWaiting()`** in the new service worker's `install` handler: normally a new service worker sits in the "waiting" state until every tab controlled by the old worker closes, specifically to avoid a half-old/half-new app running simultaneously. `skipWaiting()` forces immediate activation instead.

**Mechanism 2 — `clients.claim()`** in the `activate` handler: `skipWaiting()` alone only affects *future* navigations/requests for tabs that reload after activation — it doesn't retroactively take control of **already-open** tabs that are still being served by the old worker. `clients.claim()` makes the newly activated worker take control of all currently open clients immediately.

**The risk of implementing only `skipWaiting()`:** you can end up with the classic "half-updated app" bug — the new service worker is active and serving *new* cached assets for new requests, but an already-open tab that was mid-session might have some resources (e.g., a JS chunk it hasn't fetched yet) served from the new cache while its already-loaded runtime state assumes the old code — version-skew bugs, broken lazy-loaded chunks, or a UI that partially updates. This is exactly the kind of "silently accumulate stale/mismatched state" failure mode the notes warn about for storage without a versioning strategy, applied to the service-worker-cache context instead.

**What I'd add on top, realistically:** a cache **versioning/naming scheme** (e.g., `cache-v3`) so the `activate` handler can explicitly delete old-version caches — otherwise you accumulate orphaned caches across deploys even with `skipWaiting`/`clients.claim` correctly wired.
</details>

---

### D4. 🟡 Web Worker or Service Worker?
**Scenario:** Your analytics dashboard needs to parse and aggregate a 200,000-row CSV client-side without freezing the UI while the user keeps scrolling/filtering. A teammate proposes doing this inside a service worker "since we already have one registered for caching." Agree or push back — and justify with the actual distinction between the two worker types.

<details><summary>Model Answer</summary>

**Push back.** A service worker is a **specialized** tool purpose-built for network interception, asset caching, and push — it has a defined lifecycle (`install`/`activate`/`fetch`/`push`) oriented around those events, and piggybacking unrelated heavy CPU work onto it conflates two different architectural concerns and makes the service worker's lifecycle harder to reason about (e.g., does a long CPU task block it from handling `fetch` events for other requests in a timely way? It's still a single execution context with its own event loop — a long synchronous computation there can delay it responding to legitimate network-interception events).

**The right tool is a Web Worker** — the general-purpose background execution context designed specifically for offloading CPU-bound work like this. It has no DOM access either, and it's tied to the page that spawned it (dies when the page closes, which is fine here — this isn't work that needs to survive the tab closing, unlike push notifications).

**The one-line distinction to lead with:** *"Web Worker is the superset — general-purpose background thread for heavy computation. Service Worker is a specific flavor of that same underlying idea, purpose-built for the network/caching/push lifecycle. 'We already have a worker' isn't the same as 'this is the right worker for this job.'"*
</details>

---

## Section E — Cache Storage

### E1. 🔴 Pick the strategy, then break your own pick
**Scenario:** You're building the offline experience for a news app. There are three distinct pieces of content: (a) the app shell (HTML/JS/CSS), (b) today's list of article headlines, (c) an individual article's full body once opened. Assign a caching strategy to each, and then identify the one strategy choice that will bite you in a specific realistic scenario.

<details><summary>Model Answer</summary>

- **(a) App shell → cache-first.** It rarely changes between deploys, and instant load matters more than millisecond freshness — exactly the notes' stated best-fit case ("today's article won't change tomorrow"-style static assets).
- **(b) Headlines list → stale-while-revalidate.** Serve the cached list instantly (feels fast, matches the "Facebook feed" pattern), then silently refetch in the background so the next render (or next open) has fresh headlines — this is a feed-shaped, "must feel instant but should stay reasonably fresh" case.
- **(c) Individual article body → network-first with cache fallback.** Once a user opens an article, correctness/freshness matters more (a live news story might get corrections/updates), but it should still work offline if they've read it before — network-first gives freshness when online and graceful degradation when not.

**Where this bites you:** the app-shell cache-first choice is dangerous specifically **without a versioning/invalidation strategy**. If you deploy a breaking change to the JS bundle and the service worker's cache-first strategy keeps serving the old shell indefinitely (because "cache-first" never even checks the network unless there's a miss), users can get stuck on stale JS talking to a new backend API — the classic version-skew failure. The fix ties back to D3: cache-first for the shell **only works safely paired with** a cache-versioning scheme and `skipWaiting`/`clients.claim` so stale shells get evicted promptly on deploy, not "cache-first" in isolation as a permanent decision.
</details>

---

### E2. 🟡 Output/behavior-based
```js
// Inside the service worker
const CACHE_NAME = 'v1';

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
```
A teammate says "great, this app now works fully offline for every route." Is that true? What's missing, and why does it matter that the fetch's *result* here is never written back into the cache?

<details><summary>Model Answer</summary>

**Not true, and there's a real bug.** This is cache-first, but notice: on a cache **miss**, it calls `fetch(event.request)` and returns that response directly — it never calls `caches.put()` to store that fresh response back into the cache. That means only assets that were explicitly pre-cached during `install` will ever be served offline; anything the user visits for the first time (a cache miss that falls through to network) is fetched once and then **never becomes available offline**, because it was never persisted to Cache Storage. Next time the user is offline and requests that same URL, it's a cache miss again → `fetch` fails (no network) → the whole thing rejects, likely surfacing as a broken page/asset.

**The fix:**
```js
event.respondWith(
  caches.match(event.request).then((cached) => {
    if (cached) return cached;
    return fetch(event.request).then((response) => {
      const clone = response.clone(); // response body can only be read once
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      return response;
    });
  })
);
```
**Why the `.clone()` matters, worth mentioning proactively:** a `Response` body is a stream that can only be consumed once — you can't both return it to the page *and* store it in the cache from the same object, so you clone before either consumer reads it, or you'll get a runtime error on the second read attempt.

**What this question tests:** whether the candidate reads cache-first code carefully enough to notice a *missing write-back*, not just whether they can define "cache-first" from memory.
</details>

---

### E3. 🟡 Cache Storage vs IndexedDB vs Browser Cache — the trap question
**Scenario:** A candidate on your own interview loop says: *"We don't need Cache Storage, we can just rely on the browser's HTTP cache with the right `Cache-Control` headers."* Is this a red flag? When would this actually be a reasonable position, and when is it a real gap?

<details><summary>Model Answer</summary>

**Not automatically a red flag** — it depends on what's actually being asked for. `Cache-Control` headers driving the browser's own internal HTTP cache is a completely legitimate, lower-effort way to get "repeat visits load faster" for simple cases, and it requires zero service worker code.

**Where it becomes a real gap:** the browser's HTTP cache is **not developer-controlled at runtime** — you can't programmatically decide "serve this specific cached response right now regardless of headers," you can't guarantee **offline** support with it (different browsers implement heuristics differently and it's not something you can query/inspect via a stable API), and you can't implement strategies like stale-while-revalidate with fine-grained control (serve cached instantly *and* explicitly trigger a background refresh) — that requires the service worker intercepting the request and making an explicit decision, which is precisely the gap Cache Storage fills. If the actual requirement includes "must work with no network at all" or "we need custom per-route caching logic," relying solely on HTTP headers is a genuine miss, not a valid simplification.

**The one-line test to apply:** *"Do we need offline support or programmatic control over what's served and when? If yes, headers alone aren't enough — that's exactly the problem Cache Storage was built to solve, at the HTTP layer, which IndexedDB was never designed for either."*
</details>

---

## Section F — Prototypal Inheritance & Copy Semantics (Scenario/Debugging Style)

### F1. 🔴 Find the production bug (React state mutation)
```js
function ArticleEditor({ article }) {
  const [draft, setDraft] = useState({ ...article, tags: article.tags });

  function addTag(tag) {
    draft.tags.push(tag);           // (1)
    setDraft({ ...draft });         // (2)
  }
  // ...
}
```
A teammate reports: "tags show up in the UI fine, but our undo/redo history is broken — every history snapshot shows the *current* tag list, not what it was at that point in time." Explain exactly why, tying it back to shallow-copy semantics, and fix it.

<details><summary>Model Answer</summary>

**Root cause:** `{ ...article, tags: article.tags }` (and later `{ ...draft }`) is a **shallow copy** — the top-level `draft` object is new each time `setDraft` is called, but `draft.tags` is never a new array; it's the *same* array reference being mutated in place at line (1) via `push`. If undo/redo history stores previous `draft` objects/snapshots by reference (e.g., pushing `draft` into a history array), **every stored snapshot's `.tags` points at the exact same array**, so mutating it via `push` retroactively "changes the past" for every snapshot simultaneously — this is the exact bug pattern the notes call "half of all 'my state mysteriously changed' issues in React."

**Fix — never mutate, always produce a new array:**
```js
function addTag(tag) {
  setDraft((prev) => ({ ...prev, tags: [...prev.tags, tag] })); // new array, not push
}
```
`[...prev.tags, tag]` creates a genuinely new array; the old array (and therefore every historical snapshot that still references it) is left untouched.

**The deeper principle to state explicitly, because it's what the interviewer is really testing:** *"Shallow copy only gives you an independent top-level object — nested arrays/objects are still shared references. If any history/undo system holds onto old state by reference, in-place mutation of nested structures corrupts history retroactively, even though the top-level object identity looks 'immutable' at first glance."*
</details>

---

### F2. 🔴 Predict the output, then extend it
```js
function Base() {}
Base.prototype.getConfig = function () {
  return { retries: 3 };
};

function Client() {}
Client.prototype = Object.create(Base.prototype);

const c1 = new Client();
const c2 = new Client();

const cfg = c1.getConfig();
cfg.retries = 99;

console.log(c2.getConfig().retries); // ?
```
What logs, and why is this *different* from the classic "shallow copy shares references" bug even though it looks similar at first glance?

<details><summary>Model Answer</summary>

**Output: `3`.**

This is subtly different from Quiz-style reference-sharing bugs: `getConfig` is a **method that returns a brand-new object literal every time it's called** — there's no shared reference between `c1`'s and `c2`'s calls, because each call to `getConfig()` independently constructs `{ retries: 3 }` from scratch. `c1.getConfig()` and `c2.getConfig()` are two entirely separate objects that happen to have identical shape/values, not two references to the same object. Mutating the one returned to `c1` (`cfg.retries = 99`) has zero effect on any object `c2` might get, because `c2` never touched that object — its own call to `getConfig()` runs the function body again and builds a fresh `{ retries: 3 }`.

**Why this is worth asking as a follow-up to the classic shared-reference quizzes:** it tests whether the candidate has internalized the *actual* rule (references are shared only when the *same object* is being pointed at by multiple bindings) rather than a shallow heuristic like "prototype methods share state" — they don't, unless the method explicitly closes over or returns a reference to something defined **outside** its own function body (e.g., a shared object on the prototype itself, or a closure variable), which this example deliberately avoids.

**Good follow-up to pose back:** "How would you rewrite this so `c1` and `c2` *do* share a mutable config object on purpose, and what's the risk of doing that?" — Answer: put the object directly on `Base.prototype` (`Base.prototype.config = { retries: 3 }`) instead of returning a fresh one from a method; now every instance shares one object, and mutating it via any instance affects all of them — useful for genuinely shared config, dangerous if a consumer expects instance-level isolation.
</details>

---

### F3. 🟡 Rapid diagnostic — deep clone under time pressure
**Scenario (say this is a live pairing round):** You're handed this failing test and 3 minutes to explain root cause and fix, no running the code yet — just read it.
```js
const original = {
  id: 1,
  createdAt: new Date('2026-01-01'),
  onSave: () => console.log('saved'),
  metadata: undefined,
  tags: new Set(['a', 'b']),
};

const clone = JSON.parse(JSON.stringify(original));

expect(clone.createdAt instanceof Date).toBe(true);   // fails
expect(clone.tags.size).toBe(2);                        // fails
expect('onSave' in clone).toBe(false);                  // passes
```

<details><summary>Model Answer</summary>

**Root cause, stated fast and precisely:** `JSON.stringify`/`JSON.parse` is not a real deep-clone — it's a lossy serialization round-trip through JSON's type system, which only understands strings, numbers, booleans, null, plain objects, and arrays.
- `createdAt`: `Date` objects get serialized via their `toJSON()` (ISO string) during `stringify`, and `JSON.parse` has no way to know it should reconstruct a `Date` — it comes back as a **plain string**, so `instanceof Date` fails.
- `tags`: a `Set` has no meaningful JSON representation by spec default — it serializes to `{}` (an empty object, since `Set` isn't array-like to `JSON.stringify`), so `.size` doesn't even exist on the result — this assertion fails for a different reason than expected (property doesn't exist / isn't a Set at all).
- `onSave`/`metadata` (`undefined`): correctly dropped silently, which is *why* that third assertion passes — but that's still worth flagging as a silent-data-loss risk if this were a case where the function reference actually mattered downstream.

**The fix — reach for `structuredClone`:**
```js
const clone = structuredClone(original);
```
`structuredClone` is native, explicitly designed to correctly handle `Date`, `Map`, `Set`, and circular references (unlike `JSON.stringify`, which throws on circular refs entirely) — though note it **still can't clone functions** (they'll throw a `DataCloneError`), so `onSave` would need to be stripped or handled separately before cloning if it must survive on the object (usually it shouldn't be on a data object being cloned in the first place).

**Why this is a good 3-minute pressure question:** it forces prioritizing — naming the *two different failure mechanisms* (silent type-downgrade for `Date` vs. total representation loss for `Set`) rather than a vague "JSON.stringify is bad for cloning," and proposing the fix without needing to run the code to confirm suspicions.
</details>

---

## Section G — Cross-Cutting / Staff-Level Synthesis

### G1. 🔴 The system-design-adjacent one
**Scenario:** You're the staff engineer reviewing a design doc for a social feed app's offline strategy. The doc proposes: Redis on the backend caches the latest 50 posts per user; the client also caches the last 50 posts the user has scrolled past, in IndexedDB, refreshed via stale-while-revalidate through a service worker and Cache Storage for the underlying HTTP responses. What questions do you ask in review, and what's the one thing you'd insist gets called out explicitly in the doc regardless of the rest of the design?

<details><summary>Model Answer</summary>

**Questions to ask:**
- "What's the reconciliation strategy when a post is deleted/edited server-side after it's already cached client-side — does stale-while-revalidate's background refresh actually *remove* stale entries, or only add new ones?" (Feeds often under-design the deletion/edit case, only designing for "new content appears.")
- "Which layer is authoritative if Redis and the client cache disagree — and does the client ever need to *distrust* its own cache proactively (e.g., a moderation takedown), or only passively refresh on next load?"
- "Is anything in that cached-50-posts set something that would matter if leaked — e.g., posts with restricted visibility, or posts from a since-blocked user that should disappear immediately rather than on next background refresh?"

**The one non-negotiable to insist on, regardless of the rest:** an explicit statement of **what is never allowed to be cached client-side** — the notes are explicit that the hard constraint across all client-caching decisions is *"never cache client-side anything that would be damaging if leaked (auth secrets, PII, business-critical mutable state)."* A design doc that specifies caching strategy and layering without an explicit "here's what's excluded and why" section is incomplete at review time, even if the caching mechanics themselves are sound — this is the kind of thing that's easy to omit when everyone's focused on performance, and it's exactly the gap a staff reviewer should catch before it ships.

**Why this question matters for the role:** it's not really testing cache-strategy trivia at this point — it's testing whether the candidate reviews designs the way a staff engineer should: asking about failure/edge cases and security boundaries *before* signing off on the happy-path architecture, not after.
</details>

---

### G2. 🟡 The "there's no universally correct answer" question
**Scenario:** In a design review, two engineers disagree: one says "all caching logic should live in the backend (Redis) — the client should always ask the server," the other says "we should cache aggressively client-side to minimize load." As the tie-breaker, what's your answer, and how do you avoid just picking a side?

<details><summary>Model Answer</summary>

**Avoid picking a side — reframe the question.** There's no universally correct answer here; it depends on the product's freshness requirements and usability goals, and the strongest real-world pattern is usually **layering both**, not choosing one: backend caches the canonical latest data for fast, consistent serving across all clients, while the client separately caches a working set for instant perceived load on that specific device, reconciled via a background refresh (stale-while-revalidate) rather than either side being the sole source of truth.

**The tie-breaking questions I'd actually ask the room, live:**
- "How stale is acceptable, and for which specific piece of data — is 'all of it' actually true, or does that vary by field?" (Headlines vs. account balance are not the same freshness requirement.)
- "What's the cost of a cache-invalidation bug in each direction — showing stale-but-harmless content vs. a client caching something it shouldn't hold onto at all?"

**Meta-point worth voicing to the room:** don't copy a pattern just because "everyone does it that way" — reason about the actual threat model and usability trade-off for *this* product. Two engineers arguing "always X" vs. "always Y" are both making the same mistake: treating a context-dependent trade-off as a universal rule.
</details>

---

## Appendix — 30-Second Answers for Warm-Up / Screening Rounds

Use these as quick-fire warm-ups before diving into the scenario questions above — they check baseline recall fast.

| # | Question | 30-second answer |
|---|---|---|
| 1 | Why is IndexedDB async but localStorage sync? | Size — IndexedDB targets large datasets where sync reads would block the main thread unacceptably; local/session storage stay sync because their small cap makes brief blocking an acceptable trade-off. |
| 2 | Can a service worker read `localStorage`? | No — separate execution context, and `localStorage`/`sessionStorage` are synchronous and window-bound. It can reach IndexedDB (also async), but Cache Storage is the idiomatic tool for HTTP asset caching. |
| 3 | What queue does an IndexedDB callback land in? | The macrotask queue — same bucket as `setTimeout`. |
| 4 | Difference between Cache Storage and the browser's HTTP cache? | Cache Storage is developer-opened and controlled explicitly; the browser's HTTP cache is internal, not exposed via any developer API, and behavior varies by browser. |
| 5 | Does `SameSite=Lax` block a cross-site link click from keeping you logged in? | No — `Lax` allows the cookie on top-level cross-site *navigation* (clicking a link), it only blocks it on cross-site `POST`/`PUT`/`DELETE`, which is what actually stops classic form-based CSRF. |
| 6 | Instance property vs `.prototype` property — what's the real difference? | Instance property creates an own property that shadows the prototype for that instance only; a `.prototype` property is a shared object every instance reads from, so mutating it is a true override visible to all instances. |
| 7 | One thing `JSON.parse(JSON.stringify(x))` will silently break? | Any of: drops `undefined`/functions with no error, converts `Date` to a string, or throws outright on circular references. |
