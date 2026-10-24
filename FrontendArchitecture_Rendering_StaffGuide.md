# Frontend Architecture, Rendering, AuthZ & Release-Safety: Staff-Level Interview Guide

*Source: Week-6 Day-1 session (Frontend System Design fundamentals). Instructor claims are attributed; places where the session was loose, incomplete or wrong are marked **[Correction]**; material beyond the session is marked **[Staff+]**.*

---

## 1. System-Design Interview Taxonomy and Interview Conduct

### The "Why" (First Principles Rationale)
- **Three formats exist because they probe different signals.** A single-system deep dive measures breadth-to-depth navigation; scenario rounds measure pattern recall under ambiguity; "fix this broken system" rounds measure diagnostic method. Interviewers pick the cheapest format that discriminates at the target level.
- **Seniority shifts the mix (instructor's experience, not a rule):** around 6 years → mostly formats 2 and 3; 10+ years / premium companies → format 1. **Why the trend:** as code generation commoditizes implementation, design judgment became the differentiating signal and moved down to ~5 YOE.
- **"Do not mimic how Company X built it" exists because** (a) you cannot verify it, (b) it signals recall instead of reasoning, (c) a wrong claim about their stack is an instant credibility hit. Solve it as the architect; cite a published engineering blog only if you actually know it.
- **"Be open to amending your design"** mirrors design review in a real org: the artefact that ships is the negotiated one. Arguing a point you cannot defend with a metric is scored as low collaboration; conceding with a reasoned trade-off is scored as seniority.
- **Trade-off:** time. 40-45 min of design plus 15-20 min of pseudocode (the instructor's Microsoft type-ahead round) leaves no room for exploring dead ends; commit early, revisit explicitly.

### Deep-Dive Engineering Mechanics
| Format | Shape | Typical signals | Seen at (per instructor) |
|---|---|---|---|
| 1. Single-system deep dive | One system (YouTube, Docs, Instagram, Netflix) for the full hour: FRs, NFRs, architecture, trade-offs, scaling; interviewer steers toward what *you* flagged as important (caching strategy, API efficiency...) | Prioritization, depth, handling counter-proposals | Adobe, Microsoft |
| 2. Scenario-driven | A series of unrelated situations; technical *and* non-technical (React vs Vue vs Angular decision; branching strategy for staggered releases; Gmail-style cross-device draft with metadata + image) | Real-project scar tissue, decision-making | Razorpay, Apollo.io |
| 3. Debug / improve existing | Interviewer *already knows* the defects (excess re-renders, bundle too large, messy app layer, broken state management, 5 s page load) and wants your step-by-step remediation | Diagnostic method, measurement-first thinking | Mixed |

- **HLD vs LLD in frontend:** there is no separate LLD round; the *machine-coding round is the LLD equivalent*. In an HLD round the artefacts are diagrams, then **pseudocode** (not compilable; shows structure, responsibilities, edge-case handling), and in a 90-minute slot sometimes a minimal working prototype.
- **Pseudocode** means function boundaries with responsibility comments (`onChange` → debounce → cache lookup → fetch → render), not syntactic perfection.

```
 Format-1 time budget (60 min)
 0-5    clarify scope, FR/NFR, scale numbers
 5-15   data model + API contracts + component/state boundaries
 15-25  high-level architecture diagram
 25-50  deep dives on 2-3 hard problems the interviewer picks up
 50-60  trade-offs, failure modes, metrics, what you'd build next
        (if 90 min: +15-20 min pseudocode / prototype of the hardest function)
```

### ASCII Diagram: Interview Response Loop
```
 Interviewer prompt
        |
        v
 [Clarify: users, scale, SEO?, offline?, devices]
        |
        v
 [Propose A with explicit trade-offs] ----> Interviewer counters with B
        ^                                          |
        |                                          v
        +---- amend if B wins on a stated metric <-+
        |
        v
 [Pseudocode / edge cases for the chosen path]
```

### Production-Grade Concrete Example (type-ahead pseudocode, the Microsoft question)
```ts
// Responsibilities, not syntax golf. Each block maps to a design decision you narrate.
class TypeAhead {
  private cache = new LRU<string, string[]>(500);       // WHY: repeat prefixes are the common case
  private inflight?: AbortController;                    // WHY: out-of-order responses corrupt UI
  private timer?: number;

  onChange(raw: string) {
    const q = raw.trim().toLowerCase();                  // normalize to raise cache hit rate
    if (q.length < 2) return this.render([]);            // WHY: protect backend from 1-char fan-out
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.search(q), 200); // debounce: trades 200ms latency for ~5x fewer calls
  }

  private async search(q: string) {
    const hit = this.cache.get(q);
    if (hit) return this.render(hit);
    this.inflight?.abort();                              // cancel stale request
    this.inflight = new AbortController();
    try {
      const res = await fetch(`/suggest?q=${encodeURIComponent(q)}`, { signal: this.inflight.signal });
      if (!res.ok) throw new Error(String(res.status));
      const items: string[] = await res.json();
      this.cache.set(q, items);
      this.render(items);
    } catch (e) {
      if ((e as Error).name !== "AbortError") this.renderError();  // abort is expected, not an error
    }
  }
}
```

**Scenario answers raised in the session (outline each in 60 s):**
1. **Three staggered releases (R1 → R2 → R3) with hotfixes:** *Branching.* Long-lived `release/r1`, `release/r2`, `release/r3` cut from `main`; **forward-merge policy**: every commit landing on `release/rN` is merged into `release/rN+1` and `main` automatically (CI bot opens the PR; conflicts are resolved by the author of the hotfix, not the downstream team). Hotfix path: branch from the *released tag*, cherry-pick or merge forward. **Staff+:** the lower-friction answer is **trunk-based development + feature flags** (decouple deploy from release, section 16) so R2/R3 code ships dark on `main`; mention that long-lived branches cost merge debt that grows super-linearly with divergence.
2. **Gmail-style draft synced across devices (with metadata + image):** autosave debounced (~1-2 s) + on `visibilitychange`/`beforeunload` flush; server stores `{draftId, rev, body, metadata}`; **optimistic concurrency** (`If-Match: rev` / 409 on conflict → three-way merge or last-writer-wins with a "draft changed elsewhere" prompt); local copy in **IndexedDB** for offline and crash recovery; image uploaded via the resumable/chunked path as a separate blob, the draft stores only the **blob ID** (never base64 in the draft body: write amplification on every keystroke-save).
3. **5-second page load (format 3):** *measure first* (Lighthouse/WebPageTest + RUM p75 LCP/INP/CLS), then walk the waterfall: TTFB (CDN/SSR) → render-blocking CSS/JS → bundle size (analyzer, route-level splitting, tree-shaking, drop moment/lodash-full) → images (format, dimensions, lazy, priority hints) → API waterfalls (parallelize, prefetch) → hydration/re-render cost (React Profiler, memoization, virtualization) → third-party scripts. Set **performance budgets in CI** so it does not regress.

### Interview Edge Cases & Fault Tolerances
- Never answer "Netflix does X" without a primary source; say "I'd design it as...".
- Never argue; restate the interviewer's option, evaluate it on a metric (latency, cost, team autonomy), then decide.
- State assumptions aloud and quantify (DAU, p95 budget, SEO yes/no); unquantified designs read as junior.
- For scenario rounds, answer with *"in my project we hit X, did Y, measured Z"*; the session explicitly says the interviewer is testing whether you have *really handled* the problem.
- Always close with failure modes and observability (what metric tells you it broke).

---

## 2. Monolithic Frontend Architecture

### The "Why" (First Principles Rationale)
- **Definition (session):** one frontend application, **one codebase and one build artefact, deployed as one unit** (all features shipped together). The defining property is the **deployment/runtime unit, not the repository layout** (see section 5).
- **Why it is the correct default:** zero distributed-systems cost. In-process function calls instead of network/contract boundaries; one dependency graph (one Axios/React version); shared state is a plain store; local dev is `npm start`. Google, GitHub (and Stack Overflow, per the instructor) run monoliths at enormous scale; the instructor's own site is a single SPA because early-stage products lack clarity about where boundaries belong, and a monolith keeps boundary decisions cheap to reverse.
- **Trade-off (what breaks at org scale, per session):**
  - **Release coupling:** if the Home module is not ready, Search/Cart/Checkout cannot ship even if they are. One red CI job blocks everyone (a *convoy effect*).
  - **Bundle growth and slow builds/CI** (mitigated, not eliminated, by splitting and caching).
  - **Blast radius:** a defect in one module can break the whole artefact.
  - **Stack lock-in:** a legacy Angular slice cannot be reused in a React app.
  - **Ownership ambiguity** across modules.
- **Where it shines:** small/medium apps, a single team, early-stage product, tightly coupled features, shared libraries (one Axios upgrade done once for all modules, which the instructor cites as the main DX benefit).

### Deep-Dive Engineering Mechanics
- Build: one bundler invocation produces `index.html` + hashed chunks. **Route-level code splitting** (`React.lazy` + dynamic `import()`) keeps the *initial* payload small without leaving the monolith, which is the key point candidates miss: lazy loading is **not** a micro-frontend benefit.
- Dependency management: single lockfile → deterministic dedupe; a library upgrade is one PR.
- Release: one pipeline, one version (`v2026.08.1`), one rollback unit.
- Release decoupling inside a monolith: **feature flags** let teams merge incomplete work to `main` safely.

### ASCII Architecture Diagram
```
 Single repo / single build                              Browser
 +--------------------------------------------+        +-------------------------+
 | app/                                       |  CI    | index.html              |
 |  ├─ home/      ┐                           | -----> | main.[hash].js (shell)  |
 |  ├─ search/    │ one dependency graph      |  CDN   | home.[hash].js (lazy)   |
 |  ├─ product/   │ one lockfile              |        | cart.[hash].js (lazy)   |
 |  ├─ cart/      │ one version number        |        +-------------------------+
 |  └─ checkout/  ┘                           |
 +--------------------------------------------+
      blocked-by-one-red-module  ==>  NOTHING ships  (convoy effect)
```

### Production-Grade Concrete Example
```tsx
// Route-level splitting INSIDE a monolith: initial JS stays small, deployment stays unified.
const Home     = lazy(() => import("./home/Home"));
const Checkout = lazy(() => import(/* webpackPrefetch: true */ "./checkout/Checkout"));

<Suspense fallback={<RouteSkeleton />}>
  <ErrorBoundary fallback={<RouteError />}>   {/* chunk-load failure after a deploy must not white-screen */}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  </ErrorBoundary>
</Suspense>
```
```yaml
# .size-limit / CI performance budget: prevents the "large bundle" failure mode the session lists
- path: "dist/assets/main.*.js"
  limit: "180 kB"      # gzip; fail the PR if exceeded
- path: "dist/assets/*.js"
  limit: "900 kB"
```

### Interview Edge Cases & Fault Tolerances
- **Stale-chunk 404 after deploy:** a long-lived tab references `cart.abc123.js`, which the new deploy deleted. Mitigate: keep the previous N releases' assets on the CDN, catch `ChunkLoadError` → soft reload prompt.
- **CI scaling:** monolith builds degrade linearly; use incremental builds, remote cache, test impact analysis.
- **Ownership:** fix with `CODEOWNERS` per directory and module-boundary lint rules (Nx `enforce-module-boundaries`), which gives most of the autonomy people seek from micro-frontends at a fraction of the cost.
- Say explicitly: *"I start monolithic and extract on evidence"*; this is the instructor's recommended evolution path (section 6).

---

## 3. Micro-Frontend (MFE) Architecture

### The "Why" (First Principles Rationale)
- **Definition (session):** the frontend is split into **multiple independent applications, each owned by a different team, built from its own repo and deployed separately**, assembled at **runtime** by a container (shell).
- **Why it exists:** it is an *organizational* scaling tool (Conway's law), not a performance tool. It buys team autonomy, independent release cadence, smaller per-team codebases, tech flexibility, and org scalability across time zones (instructor: Europe/US/India/Australia teams).
- **The two legitimate reasons (session):** (1) a UI module is **shared across different products** without tight logical coupling (user-app settings vs admin-app settings: build once, deploy once, consume in both); (2) **geographically distributed teams** that cannot coordinate a single release train.
- **The cost (be honest in the interview):** shared-data complexity, cross-app communication, **version compatibility** (Home 1.0 only works with Search 2.0), runtime performance overhead (duplicate libs, extra round trips), operational complexity (the instructor calls this the biggest challenge in his experience), and communication/management cost (programme management, platform team). **Default is monolith; MFE must be justified.**
- **Not an advantage on its own:** lazy loading a module only when the user taps "Electricity Bill" (Paytm example). Code splitting does that inside a monolith.

### Deep-Dive Engineering Mechanics
**Container / shell responsibilities** (the platform team's charter): routing and navigation, authentication and token lifecycle, a shared HTTP client, design tokens/theme, global store slice (user info), error boundaries, telemetry, and the **contract** for navigation params and events.

**Runtime composition options:**
| Mechanism | Isolation | Cost | Notes |
|---|---|---|---|
| Module Federation (webpack 5) / native federation | JS runtime shared; CSS leaks unless scoped | Shared-dep negotiation | Most common in React shops (section 4) |
| iframes | Strongest (separate browsing context) | Poor UX, sizing, a11y, double memory | Good for untrusted/legacy apps |
| Web Components / custom elements | DOM + style scope via Shadow DOM | Framework-agnostic | Tooling friction |
| Server/edge composition (SSI/ESI) | Per-fragment | Needs SSR infra | Best for SEO-heavy composition |
| Build-time npm packages | None | Back to a **monolith** deploy | Not micro-frontend by the session's definition |

**Cross-MFE communication (answer to Muthuraj):**
- Session: central **Redux (or equivalent) store exposed by the platform**; each MFE takes a slice; teams agree on **dispatched events/actions** as a published contract; navigation params are a contract between Home → Checkout. Muthuraj's "web events" are the framework-agnostic form (`CustomEvent` on `window`).
- **[Correction]/[Staff+]:** The session said MFEs must not simply "persist to backend and re-read." Right in spirit (the cart badge must update instantly), but the **backend remains the source of truth** and the shared store is an optimistic view. Prefer **event-based loose coupling** (pub/sub with typed, versioned payloads) over a shared mutable global store: a global store makes every team's state shape a public API.
- **Authentication (Param's question):** auth is a **container capability**. A shared HTTP library reads the token (cookie), refreshes it, and retries; every MFE uses it so token expiry logic is not re-implemented per team. Whether subdomains share a session (google.com ↔ youtube.com style SSO) is an architectural choice: cookie `Domain=.example.com` for same-site subdomains; cross-site needs OIDC/SSO.
- **How to split (Param):** by **feature/business domain** (Paytm: recharge, gas booking, bills); platform capabilities (auth, http, telemetry, design system) go to the platform team, not a feature MFE.

### ASCII Architecture Diagram
```
                         Browser
 +--------------------------------------------------------------+
 | SHELL / CONTAINER (platform team)                            |
 |  router · auth/token lib · http client v1 · design tokens    |
 |  global store slice {user} · event bus · error boundaries    |
 |                                                              |
 |   click "Orders"                                             |
 |       | dynamic import (runtime)                             |
 |       v                                                      |
 |  +-----------+  +-----------+  +-----------+  +-----------+  |
 |  | home MFE  |  | search MFE|  | cart MFE  |  | order MFE |  |
 |  | team A    |  | team B    |  | team C    |  | team D    |  |
 |  +-----+-----+  +-----+-----+  +-----+-----+  +-----+-----+  |
 |        |  publish/subscribe  CartUpdated{v:2}  |            |
 +--------|----------------------------------------|-----------+
          v                                        v
   CDN: home/remoteEntry.js (short TTL)     CDN: order/chunks (immutable, hashed)
   Each MFE: own repo · own CI · own deploy · own version
```

### Production-Grade Concrete Example
```tsx
// Shell-side remote loader with timeout, version-contract check and failure isolation.
async function loadRemote<T>(name: string, url: string, timeoutMs = 4000): Promise<T> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const manifest = await fetch(`${url}/manifest.json`, { signal: ctl.signal }).then(r => r.json());
    if (!satisfies(manifest.platformApi, SHELL_PLATFORM_API_RANGE))   // e.g. "^2.0.0"
      throw new Error(`${name} requires platform ${manifest.platformApi}`);
    return (await import(/* @vite-ignore */ `${url}/${manifest.entry}`)) as T;
  } finally { clearTimeout(t); }
}

// Blast-radius control: one failing MFE must not take down the shell.
<ErrorBoundary fallback={<MfeUnavailable name="orders" />} onError={e => telemetry.mfeFailure("orders", e)}>
  <Suspense fallback={<TileSkeleton />}><OrdersApp bus={eventBus} http={platform.http} /></Suspense>
</ErrorBoundary>
```
```ts
// Typed, versioned event contract (the "agreement" the session mentions)
export interface CartUpdatedV2 { type: "cart.updated"; v: 2; items: {sku: string; qty: number}[]; ts: number }
window.dispatchEvent(new CustomEvent<CartUpdatedV2>("mfe:cart.updated", { detail: {...} }));
```

### Interview Edge Cases & Fault Tolerances
- **Dependency duplication / version skew:** two copies of React break hooks; mark `react`, `react-dom` as **singletons** in the shared scope; enforce platform-library semver; deprecation windows (the session: backward compat sometimes, mandatory upgrades other times, with a platform-announced deadline).
- **Perf:** `remoteEntry` waterfall (shell → remote manifest → chunks); mitigate with preload hints, manifest short TTL (`max-age=60`) vs hashed chunks `immutable`.
- **Contract drift:** consumer-driven contract tests between shell and each MFE in CI; integration environment that composes *latest* of all remotes.
- **CSS bleed:** CSS Modules/Shadow DOM/prefixing; shared design tokens, not shared stylesheets.
- **Observability:** per-MFE release version in every log/trace/RUM beacon; otherwise incidents become cross-team blame games (the "chaos at scale" the instructor describes).
- **Rollback:** independent, but a bad *shared* platform release hits all; canary the shell.
- **Org precondition:** without a funded **platform team**, "you are set to fail" (instructor).

---

## 4. Module Federation (answer to the pending question)

### The "Why" (First Principles Rationale)
- **Session definition:** dividing an app into modules and **loading certain modules at runtime from independently deployed instances** (e.g., Order app served from a different URL).
- **Why it exists:** `import()` normally resolves at *build time* against one build graph. Module Federation lets a **host** resolve imports against **remotes built and deployed by someone else**, while **negotiating shared dependencies at runtime**, so you ship one copy of React rather than six.
- **Trade-off:** runtime coupling by string names, version negotiation complexity, harder static typing across remotes, and a larger failure surface (remote down = runtime import fails).

### Deep-Dive Engineering Mechanics
1. Each **remote** build emits a small **container entry** (`remoteEntry.js`) that exposes a registry: `{ "./Orders": () => import("./Orders") }` and a `shared` scope declaration.
2. The **host** loads `remoteEntry.js` (script tag or runtime API), calls `init(sharedScope)`; webpack's share-scope picks, per package, the **highest compatible version** satisfying every participant's `requiredVersion`; `singleton: true` forces exactly one instance.
3. `get("./Orders")` returns a factory; the host evaluates it, which triggers fetching the remote's chunks from the **remote's** `publicPath`.
4. **[Correction/clarity]:** `React.lazy` alone is *not* federation: lazy defers *when* a chunk loads; federation changes *where it comes from and who built it*.

### ASCII Sequence Diagram
```
 Host (shell)                    Remote CDN (order team)            Share scope
     | GET orders/remoteEntry.js ----->|                                |
     |<------ container {get, init} ---|                                |
     | init(shareScope{react@18.3.1}) ------------------------------->  | negotiate: singleton react
     | container.get("./Orders") ----->|                                |
     |<------ factory ----- chunks: orders.[hash].js ---------------   |
     | factory() -> <Orders/> rendered with HOST's React instance       |
```

### Production-Grade Concrete Example
```js
// webpack.config.js: REMOTE (order team)
new ModuleFederationPlugin({
  name: "orders",
  filename: "remoteEntry.js",
  exposes: { "./OrdersApp": "./src/OrdersApp" },
  shared: {
    react:       { singleton: true, requiredVersion: "^18.3.0" },
    "react-dom": { singleton: true, requiredVersion: "^18.3.0" },
    "@acme/http-client": { singleton: true, requiredVersion: "^1.0.0" },  // platform lib
  },
});
// HOST
new ModuleFederationPlugin({
  name: "shell",
  remotes: { orders: "orders@https://cdn.acme.com/orders/remoteEntry.js" },
  shared: { /* same singleton declarations */ },
});
// usage: const OrdersApp = lazy(() => import("orders/OrdersApp"));
```

### Interview Edge Cases & Fault Tolerances
- Version negotiation failure → fall back to a bundled nested copy (non-singleton) vs fail hard; choose fail-hard for stateful libs (React, router).
- `remoteEntry.js` must **not** be immutable-cached; hash only the chunks.
- Remote down → timeout + error boundary + degraded tile; never block shell boot on a remote.
- Security: you are executing remote-origin JS inside the host origin; lock down CSP `script-src` to known CDNs and use SRI where possible.
- Type safety: publish generated `.d.ts` for exposes; otherwise runtime-only errors.

---

## 5. Monorepo vs Polyrepo (repository topology is orthogonal to architecture)

### The "Why" (First Principles Rationale)
- **Core insight the session hammers:** *Monolith/MFE* describes **runtime and deployment** (how it is built and shipped); *monorepo/polyrepo* describes **source organization and version control**. They are **independent axes**. Many candidates conflate them.
- **Monorepo wins:** atomic cross-project refactors, single dependency source of truth, easy code sharing, consistent tooling/lint. **Loses:** repo grows, CI/build slows without tooling (a one-line change reruns lint/test everywhere); needs **Nx/Turborepo**-class tooling.
- **Polyrepo wins:** team independence, small repos, independent release, easy access control. **Loses:** shared-code updates require N PRs across N repos; version drift; cross-repo refactors are hard; consistency needs coordination (the "diamond dependency" problem).
- **Session caveat worth quoting in an interview:** "harder code sharing" is not quantifiable; *justify with an example from your own team*. There is no universally right answer.

### Deep-Dive Engineering Mechanics: the 2×2
| | **Monolithic deploy** | **Micro-frontend deploy** |
|---|---|---|
| **Monorepo** | Most common startup/big-tech default (Google, Meta style) | Possible (shared repo, separate pipelines per app); not recommended by the instructor |
| **Polyrepo** | Each module lives in its own repo and is published as a versioned package; the container pins versions in `package.json` and **bundles at build time → still a monolith** (session example: Home 1.0, Cart 3.0, Cart 3.1 hotfix → bump, rebuild) | **Usual MFE shape:** independent repos, builds, deploys |

- **Why polyrepo + build-time packages is still monolithic:** the user downloads one bundle; nothing is fetched from another deployable at runtime (instructor's explicit point).
- **Monorepo tooling mechanics:** build graph from `package.json` deps → `affected` computation (`git diff` against base → transitive dependents) → run only affected tasks → **remote cache keyed by input hash** (source + deps + env) so CI skips unchanged work.

### ASCII Diagram
```
 MONOREPO (one repo, N packages)               POLYREPO (N repos)
  repo/                                         repo-home ──publish──> @acme/home@1.0.0 ┐
   apps/shell                                   repo-cart ──publish──> @acme/cart@3.1.0 ├─> shell pins versions
   packages/home  packages/cart                 repo-lib  ──publish──> @acme/ui@5.2.0   ┘   in package.json
   packages/ui    (atomic change across all)    (changing ui = release + N bump-PRs)
```

### Production-Grade Concrete Example
```jsonc
// turbo.json: affected-only builds + remote caching
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test":  { "dependsOn": ["build"],  "outputs": [] },
    "lint":  { "outputs": [] }
  },
  "remoteCache": { "enabled": true }
}
```
```
# CODEOWNERS: restores ownership clarity that a monorepo otherwise blurs
/packages/cart/      @acme/team-cart
/packages/checkout/  @acme/team-checkout
/packages/ui/        @acme/platform
```
```yaml
# Renovate for polyrepo drift control
packageRules:
  - matchPackagePatterns: ["^@acme/"]
    groupName: "internal libs"
    automerge: true          # patch/minor only, gated by CI
```

### Interview Edge Cases & Fault Tolerances
- Monorepo CI time explosion → affected-graph + remote cache + sharded tests.
- Monorepo access control: path-scoped CODEOWNERS; sensitive code may force a separate repo.
- Polyrepo diamond deps and **version skew** → single internal-lib release train, Renovate, deprecation policy.
- Module-boundary enforcement (lint rule: `home` may not import `cart` internals) is the real source of decoupling in either topology.
- A reasonable answer to "which?" is "monorepo with enforced boundaries until team/permission needs force a split."

---

## 6. Architecture Evolution Path and Decision Framework

### The "Why" (First Principles Rationale)
- **Session's recommended path:** (1) start **monolithic in one repo**; (2) as the team grows, keep a monolithic *deploy* but move big modules to **their own repos** (Cart team → own repo, published versions); (3) only when a module is genuinely shared across verticals/products or teams are geographically split, extract that module as an **MFE**. Never adopt MFE "because you wanted to use MFE."
- **Why organic:** boundaries chosen early are guesses; wrong boundaries in a *deployed-independently* world are expensive (cross-team contract changes). Extraction after boundaries stabilize is cheaper than merging mis-cut services.
- **"There is no right or wrong in system design, only a selection that fits."** Support with counter-examples: Stack Overflow runs a monolith (the instructor cites very large single-box RAM; verify before quoting numbers); Amazon Prime Video publicly moved a video-quality-monitoring service from distributed to a monolith for cost/perf reasons.

### Deep-Dive Engineering Mechanics: decision checklist
```
 Q1 Team count > ~3 independent teams shipping to the same surface?   no -> stay monolith
 Q2 Release trains blocking each other regularly (measured)?          no -> stay monolith
 Q3 Is a UI slice reused by >1 product/vertical?                      yes -> extract that slice (MFE or shared package)
 Q4 Teams in 3+ time zones without a shared sprint cadence?           yes -> consider MFE
 Q5 Can you fund a platform team (auth, http, design system, CI)?     no -> do NOT do MFE
```

### Interview Edge Cases & Fault Tolerances
- Cite measurable triggers (CI p95 > 30 min, > X blocked releases/quarter) instead of "it feels big."
- Keep an **exit ramp**: module-boundary lint + versioned internal APIs make later extraction a mechanical step.
- Communication is a first-class cost (instructor's LinkedIn point): MFE shifts complexity from code to coordination; staff candidates price both.


---

## 7. Client-Side Rendering (CSR)

### The "Why" (First Principles Rationale)
- **Mechanism (session):** browser downloads a minimal HTML shell plus a JS bundle; JS runs, fetches data, and builds the DOM. All "pages" (login, home, settings) are produced by the client router from one bundle.
- **Why choose it:** after the initial boot, navigation is local (no server round-trip per view) → excellent for **highly interactive, logged-in, non-SEO apps** (Gmail, Trello, admin dashboards). It also offloads render CPU from your servers to the client: **cost scales with devices, not with your fleet**.
- **Trade-offs:** slow first load (download + parse + execute + fetch data = serial waterfall), poor on weak devices, **SEO is harder** (session: not "no SEO", but delayed and more fragile).

### Deep-Dive Engineering Mechanics
- **Critical rendering path (CSR):** `GET /` → tiny HTML (`<div id="root">`) → discover `main.js` → download → parse/compile → execute → React renders skeleton → `fetch('/api/...')` → render data. **FCP and LCP are gated on two serial network trips** (JS, then data).
- **SEO crawl behaviour:** the bot receives an empty root. It must download/execute JS, wait for API calls, then extract content. **[Staff+]** Googlebot does render JS via an evergreen Chromium, but rendering is queued in a **second wave** (delay from seconds to days), and many other consumers (Bing is partial; social unfurlers, link-preview bots, most LLM crawlers) do **not** execute JS.
- Mitigations without leaving CSR: preload the first data call, route-level splitting, HTTP caching with content hashes, app-shell + skeleton, service-worker precache, `modulepreload`.

### ASCII Sequence Diagram
```
 Browser                CDN                 API
   | GET /  ------------>|                    |
   |<-- index.html (2KB)-|                    |
   | GET main.7f3a.js -->|   (render-blocking waterfall #1)
   |<-- 380KB gz --------|                    |
   | parse+execute JS ..........................
   | GET /api/feed ------------------------>  |   (waterfall #2)
   |<-- JSON ---------------------------------|
   | render DOM  => FCP/LCP here               |
   Bot view at t0: <div id="root"></div>  (no content)
```

### Production-Grade Concrete Example
```nginx
# Immutable hashed assets, revalidated shell: the standard CSR caching contract
location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
location = /index.html { add_header Cache-Control "no-cache"; }   # always revalidate (ETag) so deploys propagate
```
```html
<!-- start the data fetch before the bundle finishes executing -->
<link rel="modulepreload" href="/assets/main.7f3a.js">
<link rel="preload" as="fetch" href="/api/feed?limit=10" crossorigin>
```

### Interview Edge Cases & Fault Tolerances
- Weak-device parse cost dominates (JS is the most expensive byte): enforce JS budgets, defer third parties.
- White screen on JS error → top-level error boundary + `noscript` fallback.
- Deploy skew (old HTML, new chunks) → section 2 chunk-404 handling.
- If the only reason to leave CSR is SEO on a few public pages, **prerender those routes** rather than rewriting the app.

---

## 8. Server-Side Rendering (SSR) and Hydration

### The "Why" (First Principles Rationale)
- **Mechanism (session):** per request, the server fetches data, renders full HTML, and sends it; the browser paints immediately; JS then **hydrates** to attach event handlers and state.
- **Why:** faster first meaningful content (no JS-then-data waterfall), **content present in the initial HTML** so crawlers/unfurlers index without executing JS, dynamic per-request data, and **social preview support** (title/image meta available at URL fetch time; the session's Instagram/YouTube example).
- **Trade-offs:** server CPU per request (cost scales with traffic; high-traffic + heavy rendering is the session's "not ideal" case), higher **TTFB** (render happens before first byte unless streamed), and the **hydration gap** (page looks interactive but isn't until JS runs). Not for static content (SSG is cheaper) and not for highly interactive non-SEO apps.
- The instructor migrated his site from vanilla JS to Next.js specifically for SEO discoverability of public interview content.

### Deep-Dive Engineering Mechanics
1. Request hits SSR runtime (Node/edge). 2. Route data loaders run (parallelize; never waterfall). 3. React renders to HTML (`renderToPipeableStream` → **streaming**, flushing shell first, suspended boundaries later). 4. Browser paints HTML. 5. Bundle loads; **hydration** reconciles server DOM with the client tree; a markup mismatch causes hydration errors or full re-render. 6. **[Staff+] Selective hydration / React Server Components** reduce shipped JS and let interactive islands hydrate first.
- **Answer to Param's open question** (why Next SSR does not feel like an old MVC full reload): after first load, **Next's `<Link>` performs client-side (soft) navigation**: it intercepts the click, fetches only the next route's render payload (RSC/JSON), and swaps the view with the History API: no document reload. Only the *first* hit (or a hard refresh) is a full server-rendered document.

### ASCII Sequence Diagram
```
 Browser            Edge/CDN         SSR Node                 API / DB
   | GET /product/42 ->|  MISS --------->|                        |
   |                   |                 | loaders (parallel) --->|
   |                   |                 |<--- data --------------|
   |                   |                 | renderToPipeableStream |
   |<--- HTML shell (chunk 1, <head>+og tags) ---- flush early    |
   | paint (FCP)       |                 |  ...<Suspense> chunk 2 |
   |<--- late chunk: reviews ------------|                        |
   | load JS, hydrate (TTI) ... interactive                       |
   | click Link -> fetch RSC payload only -> soft navigation (no reload)
```

### Production-Grade Concrete Example
```tsx
// Next.js App Router: streaming SSR with per-request data and SEO metadata
export const dynamic = "force-dynamic";                    // per-request render

export async function generateMetadata({ params }: { params: { id: string } }) {
  const p = await getProduct(params.id);                   // memoized/deduped with the page fetch
  return { title: p.name, openGraph: { images: [p.image] }, alternates: { canonical: `/p/${p.slug}-${p.id}` } };
}

export default async function Page({ params }: { params: { id: string } }) {
  const productP = getProduct(params.id);                  // start both before awaiting (no waterfall)
  const reviewsP = getReviews(params.id);
  const product = await productP;
  return (
    <>
      <ProductHero product={product} />                    {/* in the first flush */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews promise={reviewsP} />                     {/* streamed later; slow API never blocks FCP */}
      </Suspense>
    </>
  );
}
```

### Interview Edge Cases & Fault Tolerances
- **Hydration mismatch** from `Date.now()`, `Math.random()`, `window` access, locale/timezone differences → render those client-only (`useEffect`) or pass serialized values.
- **SSR cost under load / thundering herd:** put a CDN/edge cache in front for anonymous traffic (`s-maxage` + `stale-while-revalidate`); cap render concurrency; shed to a cached or CSR fallback shell under overload (graceful degradation).
- **Personalization leakage:** never cache an HTML response containing user data at a shared edge; use `Vary`/private caching or fetch personalized fragments client-side.
- Tail latency: one slow upstream stalls the whole response unless boundaries stream; set per-fetch timeouts.
- Observability: split TTFB into queue/render/upstream spans; track hydration error rate in RUM.

---

## 9. Static Site Generation (SSG)

### The "Why" (First Principles Rationale)
- **Mechanism (session):** HTML for all pages is generated **at build time** and served as static files; runtime only serves pre-built content.
- **Why:** best performance (CDN-edge static file, near-zero server work), strong SEO, cheapest to run, immune to origin outages once cached. Ideal for blogs, docs, marketing pages, React documentation-style sites: content changes rarely but SEO matters.
- **Trade-offs:** stale until the next build; **build time grows with page count** (O(pages)); unsuitable for frequently changing or **personalized** content (everyone loading amazon.com sees different data).

### Deep-Dive Engineering Mechanics
- Build enumerates routes (`generateStaticParams` / `getStaticPaths`), fetches data, renders HTML + JSON data files, uploads to CDN. Request path = CDN lookup only.
- Content change → trigger rebuild (webhook from CMS). For 100k pages, full rebuilds become the bottleneck → motivation for ISR (next section).
- Dynamic bits on a static page are fetched client-side after load (price, stock, user name), keeping the shell cacheable.

### ASCII Diagram
```
 BUILD TIME                                RUNTIME
 CMS/DB --> generate pages --> /blog/a.html          Browser --> CDN edge --> /blog/a.html (HIT, ~10ms)
                           --> /blog/b.html                         |
                           --> upload to CDN                        +-- client JS fetches /api/price (dynamic island)
```

### Production-Grade Concrete Example
```tsx
// Pre-render the top N posts at build; others render on first request and are cached
export async function generateStaticParams() {
  const slugs = await cms.topSlugs(5000);
  return slugs.map(slug => ({ slug }));
}
export const dynamicParams = true;     // long tail: generate on demand, then cache
```

### Interview Edge Cases & Fault Tolerances
- Build-time explosion → partial pre-render + on-demand generation + ISR.
- Cache invalidation after a content fix → CDN purge by surrogate key/tag; otherwise users see stale content up to TTL.
- Preview/draft modes for editors must bypass the static cache.
- Don't statically render anything auth-gated or user-specific.

---

## 10. Incremental Static Regeneration (ISR)

### The "Why" (First Principles Rationale)
- **Mechanism (session):** serve the cached static version immediately; **after the interval, regenerate in the background**; the *next* request gets the fresh page. It is the middle ground between SSG (stale) and SSR (costly).
- **Why:** SEO + near-static latency + bounded staleness without rebuilding the world. Fits product catalogs, blog lists, news feeds, high-traffic pages where *eventual* freshness is acceptable ("non-critical information" per session; do not use for price/stock correctness at checkout).
- **This is the stale-while-revalidate (SWR) pattern at the page level.** Trade-off: **one user (or more) sees stale content** after expiry by design; correctness-critical data must be fetched client-side or by on-demand revalidation.

### Deep-Dive Engineering Mechanics
- Student question (regenerate on every request?): *no hard rule*; the common policy is time-based `revalidate = N` seconds with background regeneration. Per-request regeneration degenerates into SSR cost.
- States: **fresh** (age < N) → serve; **stale** (age ≥ N) → serve stale **and** trigger one regeneration; during regeneration other requests still get stale; on success atomically swap the cache entry; on failure keep serving last-good (**resilient to origin errors**).
- **Thundering-herd control:** regeneration must be **single-flight per key** (lock/lease), otherwise N concurrent expired requests cause N renders.
- **On-demand revalidation:** content-edit webhook calls `revalidateTag('product-42')` to purge precisely, avoiding waiting for the TTL.

### ASCII Sequence Diagram
```
 t=0   User A --> CDN: MISS --> render, cache(age=0)           --> A gets v1
 t=30  User B --> CDN: HIT fresh (revalidate=60)               --> B gets v1
 t=61  User C --> CDN: STALE --> serve v1 to C immediately
                                 \--> background: acquire lock(key) -> render v2 -> swap
 t=62  User D --> CDN: HIT fresh v2                             --> D gets v2
 render error at t=61?  keep v1 (stale-if-error), retry with backoff
```

### Production-Grade Concrete Example
```tsx
export const revalidate = 60;   // seconds: time-based ISR for this route segment

export async function getProduct(id: string) {
  return fetch(`${API}/products/${id}`, { next: { revalidate: 60, tags: [`product-${id}`] } }).then(r => r.json());
}
// On-demand: POST /api/revalidate (called by CMS webhook, HMAC-verified)
//   revalidateTag(`product-${id}`)
```
```
# Equivalent at a generic CDN
Cache-Control: public, s-maxage=60, stale-while-revalidate=600, stale-if-error=86400
```

### Interview Edge Cases & Fault Tolerances
- Per-region/edge caches can diverge by up to one TTL: acceptable for catalog, unacceptable for inventory counts.
- Cache stampede on a cold deploy (all keys empty) → pre-warm top pages, request coalescing at the CDN origin shield.
- Personalized pieces must be client islands, not part of the cached HTML.
- Monitor: **stale-serve ratio**, regeneration latency/failure rate, origin QPS.

---

## 11. Rendering-Strategy Selection, Per-Route Hybrid, and SEO Crawl Pipeline

### The "Why" (First Principles Rationale)
- **No app uses one strategy globally.** The decision is per route, driven by four variables: **SEO need, data volatility, personalization, interactivity**.
- Likely interview questions (session): "what are the four patterns, when each?", "SEO-heavy → ?", "not SEO-heavy but interactive → ?", "rarely changing but SEO-heavy → ?", "rarely changing, not SEO → ?"

### Deep-Dive Engineering Mechanics: selection matrix
| Route characteristic | Choice | Reason |
|---|---|---|
| Public, SEO-critical, changes per request / user-region | **SSR** | Fresh HTML for bots and users |
| Public, SEO-critical, changes rarely (docs, blog, marketing) | **SSG** | Cheapest, fastest, indexable |
| Public, SEO-critical, large catalog, tolerate minutes of staleness | **ISR** | SSG latency + bounded freshness |
| Private, interactive, no SEO (settings, dashboards, personal feed) | **CSR** | No server render cost, fast in-app navigation |
| Rarely changing, **not** SEO | **CSR + CDN caching** (or SSG for speed) | Rendering mode isn't needed for SEO |
| Landing page, then deep app | **SSR/SSG for first screen**, CSR for the rest | Fast first impression + fast internal navigation |

- **Mixed rendering in one app (Saad's question):** In Next.js this is native: each route/segment chooses (`dynamic`, `revalidate`, `'use client'`). **For a plain-React SPA** the session suggests carving the SEO-heavy slice as a **separately deployed (MFE) app** rendered server-side and composed by the shell. **[Staff+]** Cheaper alternatives usually exist: front the SPA with a router (CDN/edge worker) that **prerenders/serves SSR output only for bot user-agents or for specific public paths** (dynamic rendering/prerender service), or migrate public routes to a Next/Remix app behind the same domain and path-route at the load balancer. Reserve MFE for when team boundaries (not just rendering mode) justify it.
- **Crawler pipeline (session's diagram in words):** bot requests URL → receives HTML → extracts `<head>` (title, meta, canonical), body text, links → indexes and follows links. With SSR/SSG everything is in the first response (fast crawl, low crawl budget cost); with CSR the bot needs a render pass.

### ASCII Decision Tree
```
 Is the route public & SEO relevant?
  ├─ no  -> CSR (+ CDN-cached shell)
  └─ yes -> Does content depend on request/user context per hit?
            ├─ yes -> SSR (+ edge cache for anonymous, private for personalized)
            └─ no  -> Changes at most every few minutes/hours?
                      ├─ build-time is fine         -> SSG
                      └─ needs fresher without full rebuild -> ISR (+ on-demand revalidate)
```

### Interview Edge Cases & Fault Tolerances
- **Core Web Vitals (LCP/INP/CLS)** feed ranking: SSR/SSG help LCP; heavy hydration hurts INP; reserve image dimensions to prevent CLS.
- Provide `sitemap.xml`, canonical URLs, readable slug URLs (`/product/wireless-mouse-42` over `/product?id=42`), structured data (JSON-LD), `robots` rules for faceted-nav duplicates.
- Personalization on an indexable page → render the generic page server-side, hydrate personalization client-side (avoids cloaking suspicion and cache fragmentation).
- Record the **decision per route** in an ADR; flipping a route's strategy later affects caching, infra cost and observability.

---

## 12. Authentication vs Authorization and the "UI Is Not the Source of Truth" Principle

### The "Why" (First Principles Rationale)
- **AuthN** answers *who are you* (credentials → backend/identity provider). **AuthZ** answers *what may you do* (backend decision, frontend gating).
- **Frontend authorization exists for UX and accident prevention** (hide irrelevant UI, prevent wrong clicks, avoid showing buttons that will 403). It is **not a security boundary**: the **entire client bundle is attacker-readable and modifiable** (session: a user can alter bundle constraints and reach `/admin/users`). **Every permission decision must be re-enforced server-side.**
- **Trade-off:** duplicating checks costs engineering effort and creates drift risk; mitigate by having the backend **return permission metadata** that the UI renders from (single source), rather than hard-coding role names in the client.

### Deep-Dive Engineering Mechanics
- **Layers (defense in depth):** (1) nav item conditional rendering (UX); (2) **route guard** (blocks direct URL entry, Saad's `home/user-management` case); (3) **API authorization** on every endpoint/resource (real security); (4) data-level filtering (row/field-level, so even a reachable endpoint returns only permitted data).
- Direct-URL scenario: the user types the URL → client guard redirects to 403 → but a tampering user bypasses the guard → API returns **403** and no data → page renders empty. The session's conclusion: *he reaches the page and sees nothing useful*.
- Status semantics: **401** = not authenticated (refresh/login), **403** = authenticated but forbidden (show access-denied), **404** can be used to avoid leaking resource existence.
- Design requirements (session): backend returns **permission metadata**; UI renders from **capabilities**, not raw roles; permissions are **cacheable**; and support **dynamic updates** when permissions change mid-session.

### ASCII Diagram
```
 Browser                                   API Gateway               Policy / Resource svc
 [Nav: hide "Users" unless can('user:read')]   (UX only)
 [Route guard on /home/user-management]        (UX only; bypassable)
        | GET /api/users  (cookie/JWT) ------> verify authN (401?)
        |                                      authZ(sub, action, resource) ------> decision
        |<---- 403 {code:"FORBIDDEN"} ---------  ^ the ONLY enforcement that counts
 Data-layer: row-level filter (tenant_id = sub.tenant)  =>  even a bug returns only your rows
```

### Production-Grade Concrete Example
```go
// Server-side enforcement: the real boundary. Deny by default.
func RequirePermission(perm string, next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        sub, ok := SubjectFrom(r.Context())            // set by authN middleware
        if !ok { http.Error(w, "unauthenticated", http.StatusUnauthorized); return }
        allowed, err := policy.Allowed(r.Context(), sub, perm, ResourceFrom(r))
        if err != nil { http.Error(w, "authz unavailable", http.StatusServiceUnavailable); return } // fail CLOSED
        if !allowed { http.Error(w, "forbidden", http.StatusForbidden); return }
        next.ServeHTTP(w, r)
    })
}
```
```tsx
// Client guard consumes server-provided capabilities (UX layer)
function Guard({ need, children }: { need: string; children: ReactNode }) {
  const { can, status } = useCapabilities();             // fetched at login; cached; refreshed on events
  if (status === "loading") return <PageSkeleton />;
  return can(need) ? <>{children}</> : <Navigate to="/403" replace />;
}
```

### Interview Edge Cases & Fault Tolerances
- **Fail closed** when the policy service is down; never default-allow.
- **IDOR/BOLA:** checking role is not enough; verify the user may access *this* resource ID.
- Token storage: JWT in `localStorage` is XSS-exposed; prefer `HttpOnly; Secure; SameSite` cookies (+CSRF defense) or short-lived in-memory access tokens.
- Cache permissions with a short TTL **and** invalidate on role-change events, otherwise a revoked admin keeps UI access until refresh (backend still blocks it).
- Log denies with subject/action/resource for audit and anomaly detection.

---

## 13. Role-Based Access Control (RBAC)

### The "Why" (First Principles Rationale)
- **Mechanism:** users → roles → permissions (admin, manager, user; seller vs buyer on Amazon). Admin sees user management; a normal user does not.
- **Why:** simplest mental model, easy to implement, fits apps with clearly distinct user categories, trivially auditable ("who is admin?").
- **Trade-offs (session):** rigid for complex rules ("admin of level ≥ 2 *and* region X"), and suffers **role explosion** in large systems (a role per combination), which then makes audits and debugging hard.

### Deep-Dive Engineering Mechanics
- Roles established at authentication, carried in the session/token claims, and stored client-side (cookie/local storage per security needs; session). Implementation hooks: route guards, conditional nav, conditional rendering.
- **[Staff+] Model improvements:** keep **roles → permissions** indirection so the client checks `permission` strings (`invoice:approve`), never role names; hierarchical roles (role inheritance), scoped roles (role *within* org/tenant: `(user, role, scope)`), and short-lived elevation (break-glass).

### ASCII Diagram
```
 user ──< user_roles >── role ──< role_permissions >── permission
 alice     (alice,admin,tenant=7)   admin      user:read, user:write, billing:read
 bob       (bob,viewer,tenant=7)    viewer     user:read
 client check:  can("user:write") = any(role.permissions contains it)   // not role==="admin"
```

### Production-Grade Concrete Example
```go
var rolePerms = map[string]map[string]struct{}{
  "admin":  {"user:read": {}, "user:write": {}, "billing:read": {}},
  "viewer": {"user:read": {}},
}
func HasPermission(roles []string, perm string) bool {
  for _, r := range roles { if _, ok := rolePerms[r][perm]; ok { return true } }
  return false
}
```
```ts
const nav = [
  { path: "/users",   label: "Users",   need: "user:read" },
  { path: "/billing", label: "Billing", need: "billing:read" },
].filter(i => can(i.need));        // UI hides; API still enforces
```

### Interview Edge Cases & Fault Tolerances
- Role explosion → move to ABAC/ReBAC for the dynamic dimension (section 14).
- Stale roles in a long-lived JWT: bound with short access-token TTL + refresh.
- Separation of duties (requester ≠ approver) cannot be expressed by roles alone.
- Test with a **permission matrix** (roles × endpoints) in CI.

---

## 14. Attribute-Based Access Control (ABAC)

### The "Why" (First Principles Rationale)
- **Mechanism (session):** decisions depend on **attributes** of user, resource, action and environment (time, location, ownership), not just role. Example: *user may edit if `user.id == doc.ownerId` AND `doc.status != "locked"`*.
- **Why:** content-aware, granular, handles cases roles cannot (ownership, status, tenant, time windows). It is the natural *extension* of RBAC.
- **Trade-offs (session):** more rules, more evaluation logic, **harder debugging**, and the more layers you add the harder it gets to explain a decision. **[Staff+]** Also policy-evaluation latency on the request path and policy sprawl/conflicts.

### Deep-Dive Engineering Mechanics
- **PDP/PEP split [Staff+]:** a **Policy Decision Point** evaluates `(subject, action, resource, context)` → permit/deny (+ obligations); **Policy Enforcement Points** (gateway, service middleware, UI hints) call it. Engines: OPA/Rego, Cedar, Zanzibar-style **ReBAC** (relationship tuples: `doc:42#editor@user:alice`) for sharing graphs like Docs/Drive.
- Evaluate in **deny-overrides** order; log the *reason* with every decision (explainability) to offset the debugging cost.
- Frontend: request **batched decisions** for the visible resources (`POST /authz/batch-check`) rather than N calls per list item.

### ASCII Diagram
```
 PEP (API handler) --(sub{id,roles,tenant}, "edit", doc{owner,status,tenant}, ctx{ip,time})--> PDP
                                                       policy: permit if role in {admin}
                                                               or (doc.owner==sub.id and doc.status!="locked")
                                                       explain: matched rule "owner-edit-unlocked"
 <------------- decision: PERMIT (cache key: sub,action,resource,policyVersion, ttl=30s)
```

### Production-Grade Concrete Example
```go
type Subject  struct{ ID, TenantID string; Roles []string }
type Resource struct{ ID, OwnerID, TenantID, Status string }

func CanEdit(s Subject, d Resource) (ok bool, reason string) {
    switch {
    case s.TenantID != d.TenantID:                    return false, "cross-tenant"          // hard boundary first
    case slices.Contains(s.Roles, "admin"):           return true,  "admin"
    case d.Status == "locked":                        return false, "resource-locked"
    case s.ID == d.OwnerID:                           return true,  "owner"
    default:                                          return false, "no-matching-rule"      // deny by default
    }
}
```

### Interview Edge Cases & Fault Tolerances
- **Decision caching** must key on policy version + resource version, or a lock/unlock event leaves a stale PERMIT.
- N+1 authz calls on list pages → batch checks or push filters into the DB query (`WHERE owner_id = $1 OR ...`).
- Policy testing: golden-file decision tests, shadow-mode evaluation of new policies before enforcing.
- Prevent attribute spoofing: attributes come from trusted server-side sources, never from client-supplied fields.

---

## 15. Feature-Level Access (Entitlements) and the Layered Authorization Pipeline

### The "Why" (First Principles Rationale)
- **Mechanism (session):** access is controlled per **feature**, not just per page: premium features for paid users, beta features for selected accounts, export-data permission. Final layer of the pipeline: **authenticate → role (RBAC) → attributes (ABAC) → feature flag/entitlement**.
- **Why a separate layer:** *entitlement* (what the customer paid for) and *permission* (what the user may do) change on different clocks and are owned by different teams (billing vs IAM). Conflating them produces bugs like "admin of a free plan sees premium export".
- **Trade-off:** more state to keep consistent in the UI (four sources of truth that must resolve to one boolean per control).

### Deep-Dive Engineering Mechanics
Evaluation order (cheap/coarse → fine/expensive), short-circuit on deny:
1. authN valid session? 2. RBAC role admits this *area* (admin panel vs user panel); 3. within the role, finer entitlement (Admin-1 vs Admin-3) / ABAC attributes; 4. **feature flag** on for this user/region/plan? Only then render.
- Backend returns a **permission/capability document** per session; UI binds controls to capability keys.

### ASCII Diagram
```
 request ──> [authN ok?] ─no→ 401/login
                 │yes
                 v
            [RBAC: role admits area?] ─no→ 403
                 │yes
                 v
            [ABAC: attrs admit action on resource?] ─no→ 403
                 │yes
                 v
            [Feature/entitlement: flag ON & plan includes?] ─no→ hide control / upsell
                 │yes
                 v
              render + API still re-checks all of the above
```

### Production-Grade Concrete Example
```json
{
  "subject": "u_81",
  "capabilities": {
    "user:read": true, "user:write": false,
    "export:csv": { "allowed": true, "reason": "plan=pro" },
    "analytics:v2": { "allowed": false, "reason": "flag_off_region=IN" }
  },
  "policyVersion": 412,
  "ttlSeconds": 300
}
```
```ts
function useCan(key: string) {
  const caps = useCapabilities();            // refetched when policyVersion changes (pushed via SSE) or ttl expires
  const c = caps[key];
  return typeof c === "boolean" ? c : !!c?.allowed;    // default false when missing (fail closed)
}
```

### Interview Edge Cases & Fault Tolerances
- Capability doc must be **cacheable but revocable**: pair TTL with a `policyVersion` push so downgrades/role removals propagate (session: "must support dynamic updates").
- Show upsell vs hide: product decision, but both must fail closed server-side.
- A control must never *flash* visible then disappear (loading state defaults to hidden/skeleton, not visible).
- Entitlement caching across tabs/devices → single refresh channel.


---

## 16. Feature Flags (Remote Configuration)

### The "Why" (First Principles Rationale)
- **Mechanism (session):** the bundle contains code for features the user may never see; **remote config** (`newDashboard: true`, `maxUpload: 10`) decides at runtime what renders. Flags are a **kill switch, rollout valve and experiment harness** that **decouple deploy from release**.
- **Types (session):** release flags (gradual rollout), experimental flags (alpha/beta), operational flags (emergency disable), permission/entitlement flags.
- **Why at scale:** blast-radius control. If feature A causes a bug, **turn it off without a client deployment** (rollback time drops from a release cycle to seconds). Enables region/cohort-specific experiments and progressive delivery.
- **The Instagram/Twitter-style practice (instructor):** ship a feature **dark** in release 1.0 (code present, disabled) to prove the new code does not break existing paths; enable it in 2.0, first in a low-risk region, then expand. **Why:** separates *code-integration risk* from *behavior risk*, so a bad rollout never needs a binary rollback.
- **Trade-offs:** combinatorial test matrix (2^n flag states), **flag debt** (stale flags rot into dead branches), startup latency from fetching config, and a new availability dependency (flag service).

### Deep-Dive Engineering Mechanics
- **Evaluation context:** `{userId, region, device, plan, experimentBucket, appVersion}`; rules evaluated server-side (preferred: the client receives only *resolved booleans*, so targeting rules/PII don't ship to the browser) or client-side SDK for latency.
- **Deterministic bucketing:** `bucket = hash(flagKey + ":" + userId) mod 10000`; enabled if `bucket < rollout% × 100`. **Why salt with the flag key:** otherwise the same users are always the guinea pigs for every experiment. **Sticky** by construction (the same user stays in the same bucket as the rollout widens 1% → 5% → 25%).
- **Delivery:** fetch at app start/login (session's recommended point), cache in memory + persisted last-known-good, refresh by TTL or push (SSE/WebSocket) when instant propagation is needed.
- **Design requirements (session):** **startup latency handling, offline fallback, safe defaults for *every* guard, config caching, versioning, rollback strategy.**

### ASCII Architecture Diagram
```
 Admin dashboard ──write──> Flag Service (rules, rollout%, kill switch, audit log)
                                  │ publish change (versioned)
                 ┌────────────────┴──────────────┐
                 v                               v
        Edge/CDN config cache            SSE/WebSocket stream
                 │                               │
 Browser: boot → GET /flags?ctx=... ────────────>│ push {flag:"newCheckout", v:93, on:false}
   in-mem snapshot (+localStorage LKG)   <───────┘
   if (flags.isOn("newCheckout", DEFAULT=false)) <NewCheckout/> else <OldCheckout/>
   exposure event ──> analytics (who actually SAW variant B)
```

### Production-Grade Concrete Example
```go
// Deterministic, sticky, per-flag-salted percentage rollout.
func InRollout(flagKey, userID string, percent float64) bool {
    h := fnv.New32a()
    h.Write([]byte(flagKey + ":" + userID))
    bucket := float64(h.Sum32()%10000) / 100.0       // 0.00 .. 99.99
    return bucket < percent
}
```
```yaml
flags:
  new_checkout:
    kill_switch: false            # flips everything off instantly regardless of rules
    default: false                # SAFE DEFAULT if config unreachable
    version: 93
    rules:
      - match: { region: ["NZ", "AU"] }         # low-traffic region first (session's approach)
        rollout: 100
      - match: { plan: ["pro"] }
        rollout: 25
    owner: team-checkout
    expires: 2026-12-01                          # forces cleanup of flag debt
```
```ts
const v = flags.get("new_checkout", /*default*/ false);   // never throw, never block render on flag fetch
```

### Interview Edge Cases & Fault Tolerances
- **Flag service down:** serve last-known-good snapshot, then compiled-in defaults; never block first paint (bounded fetch timeout ≈ 300-500 ms, render with defaults, reconcile after).
- **Inconsistent evaluation** between SSR and client causes hydration mismatch / flicker → evaluate once on the server and pass the snapshot to the client.
- **Dependency between flags** → validate in the flag UI; avoid nested flags.
- Always **log exposure**, not just evaluation, or experiment analysis is biased.
- **Flag debt:** owner + expiry + CI lint that fails on expired flags.
- Kill switch must be tested regularly (game days), including the *off* path of new code.
- Security: flags hide UI; they are **not** authorization (section 12).

---

## 17. Scenario: Feature Flag Flips While the User Is Mid-Flow

### The "Why" (First Principles Rationale)
- **Problem (session):** a flag is updated remotely while a user is filling a form, in checkout, editing a document, or mid-banking-transaction; disabling the feature could drop their input or strand the transaction.
- **Consensus answer (Shreesha, Ramya, Shivam, Param; endorsed by instructor):** **evaluate flags once at login/app start and hold that snapshot for the whole session; apply changes on the next session or reload.** **Why:** consistency within a user journey beats instant propagation; the user already saw the feature; yanking it mid-flow causes data loss, broken invariants and support tickets.
- **When you cannot wait (instructor):** use a **listener** (SSE/WebSocket) and a **generic graceful-degradation handler**: warn the user, let them finish or save, then disable. Ramya's variation: don't change in-session; redirect after reload.
- **Rollout hygiene (instructor):** change flags during **off-peak** windows (midnight/early morning for regional banking/e-commerce) to minimize impacted sessions.
- **Param's initial reasoning ("old bundle unaffected") [Correction]:** flags are *remote*; the old bundle already contains the code and will honor a new flag value if it re-reads it. Bundle staleness does not protect the session; the *snapshot policy* does.

### Deep-Dive Engineering Mechanics: tiered policy by risk
| Flag class | Mid-session behavior | Why |
|---|---|---|
| Cosmetic/experiment (banner colour) | Sticky snapshot; update on reload | No user harm, preserves experiment integrity |
| In-progress transactional flow (checkout, payment, form) | **Flow-scoped lock:** flag value pinned at flow start until flow completion/abandon | Prevents half-old/half-new steps and invariant violations |
| Emergency kill switch (data corruption, security) | **Push + immediate disable** with save-state + banner | Safety outranks UX; sacrificing the flow is justified |
| Backend-enforced (API removed/disabled) | Next call returns 4xx/409 with a machine-readable code → UI shows controlled recovery | Server remains the final authority (matches Parth's/Vimal's per-action verification) |

- Combine **client snapshot** with **server-side validation**: if the backend rejects (feature disabled), the UI preserves the draft (local state/IndexedDB), explains, and offers a path forward.

### ASCII State Diagram
```
 login ──> fetch flags ──> SNAPSHOT_v93 (held for session)
                                │
        flow start (checkout) ──┴─ pin(checkout flags@v93)
                                │
  push: kill_switch(new_checkout)=ON
        │ risk class?
        ├─ cosmetic  : record v94, apply on next load
        ├─ txn flow  : keep pin until complete/abandon, then apply v94
        └─ emergency : persist draft → banner "Feature unavailable, your data is saved" → switch to fallback path
```

### Production-Grade Concrete Example
```ts
class SessionFlags {
  private snapshot: Map<string, boolean>;
  private pinned = new Map<string, Map<string, boolean>>();   // flowId -> pinned values
  private pending?: FlagUpdate;

  constructor(initial: FlagSet, private bus: EventSource) {
    this.snapshot = new Map(Object.entries(initial.values));
    bus.addEventListener("flag", e => this.onPush(JSON.parse((e as MessageEvent).data)));
  }
  isOn(key: string, flowId?: string): boolean {
    return this.pinned.get(flowId ?? "")?.get(key) ?? this.snapshot.get(key) ?? false; // safe default
  }
  beginFlow(flowId: string, keys: string[]) {                 // pin for transactional journeys
    this.pinned.set(flowId, new Map(keys.map(k => [k, this.snapshot.get(k) ?? false])));
  }
  endFlow(flowId: string) { this.pinned.delete(flowId); this.applyPending(); }
  private onPush(u: FlagUpdate) {
    if (u.severity === "emergency") { this.persistDrafts(); this.snapshot.set(u.key, u.value); this.notifyUser(u); }
    else this.pending = merge(this.pending, u);                // apply at next safe point
  }
}
```

### Interview Edge Cases & Fault Tolerances
- Multi-tab: tabs must share one snapshot (BroadcastChannel/SharedWorker) or users see divergent features.
- Backend must be **backward compatible** with pinned old-flag clients for at least the max session length (cap session TTL).
- Idempotency keys on transactional calls so a retry after a mid-flow switch cannot double-submit.
- Observability: emit `flag_flip_during_active_flow` metric; page on spikes.

---

## 18. Scenario: Multi-Tab Logout Propagation

### The "Why" (First Principles Rationale)
- **Problem (session):** user is logged in on three tabs (e.g., Notion); logs out in tab 1; tabs 2-3 still show an authenticated UI. **Security risk:** exposed data on shared machines and further actions under a dead session. Reference behavior: logging out of Gmail also logs out YouTube.
- **Instructor's evaluation of answers:**
  - **Backend clears the cookie via the logout response (`Set-Cookie` empty/expired)**: correct, and tabs in the same browser share the cookie jar, so subsequent API calls lack the token. **Insufficient alone:** a tab with no API call keeps showing authenticated UI.
  - **Next API call returns 401 → handle gracefully:** necessary fallback (every client must handle 401 globally), not sufficient for immediate UX.
  - **Server-sent events to notify tabs:** works but heavyweight for same-browser tabs; **not the preferred answer.**
  - **Preferred (instructor): broadcast a logout event across tabs** (client-side), root navigation listens and forcibly logs the user out; plus clear cookie; plus 401 handling as belt-and-braces.
- **On "the backend shouldn't invalidate tokens" (Muthuraj exchange):** valid for **stateless JWTs verified at a gateway**: the token stays valid until `exp` because nobody checks a server-side list. **[Staff+] Trade-off:** revocation latency = access-token TTL. Mitigations: short TTL (5-15 min) + **revocable refresh token / server-side session id**, optional `jti` denylist with TTL = remaining token life, or opaque session tokens in Redis (instant revocation at the cost of a lookup per request).

### Deep-Dive Engineering Mechanics
| Scope | Mechanism | Limits |
|---|---|---|
| Same browser, same origin | **`BroadcastChannel('auth')`** (fallback: `storage` event on a `logout` key) | Same origin only |
| Same browser, different subdomains | Server push (SSE/WebSocket), or shared-cookie polling / `visibilitychange` re-validate | BroadcastChannel does **not** cross origins |
| Other devices / SSO apps (YouTube vs Gmail) | **Server-side session revocation** + OIDC **back-channel / front-channel logout** notifying relying parties | Requires IdP support |
| Tab dormant (frozen/background) | On `visibilitychange`/`focus`, re-check session (`GET /session`) | Throttled timers cannot be relied on |

Sequence: logout API call → server revokes session + `Set-Cookie: sid=; Max-Age=0` → client posts `{type:'LOGOUT'}` on channel → all tabs clear in-memory auth state, query caches, **sensitive persisted data (IndexedDB/localStorage)**, abort in-flight requests, navigate to `/login?reason=signed_out`.

### ASCII Sequence Diagram
```
 Tab1            Server                 BroadcastChannel('auth')        Tab2        Tab3
  | POST /logout --->|                          |                         |           |
  |<-- 204 + Set-Cookie sid=;Max-Age=0          |                         |           |
  | post {LOGOUT, ts} ------------------------->|---- deliver ----------->| clear+redirect
  |                                             |---- deliver ---------------------->| clear+redirect
  | clear state + redirect /login               |                         |           |
 Fallbacks:  Tab3 (frozen) wakes -> visibilitychange -> GET /session -> 401 -> logout flow
             other device -> next request 401 (session revoked) / pushed via SSE
```

### Production-Grade Concrete Example
```ts
const channel = "BroadcastChannel" in window ? new BroadcastChannel("auth") : null;

export async function logout(reason: "user" | "expired" = "user") {
  try { await fetch("/api/logout", { method: "POST", credentials: "include", keepalive: true }); }
  finally {
    teardown();                                         // clear store, caches, abort controllers, storage
    channel?.postMessage({ type: "LOGOUT", reason, ts: Date.now() });
    location.replace("/login?reason=signed_out");
  }
}
channel?.addEventListener("message", e => { if (e.data?.type === "LOGOUT") { teardown(); location.replace("/login?reason=signed_out"); } });

// legacy fallback
window.addEventListener("storage", e => { if (e.key === "auth:logout") { teardown(); location.replace("/login"); } });
// dormant tab safety net
document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "visible" && (await fetch("/api/session")).status === 401) logout("expired");
});
// global 401 handler in the HTTP client: single place, no per-feature handling
```
```go
func Logout(w http.ResponseWriter, r *http.Request) {
    sid := sessionID(r)
    sessions.Revoke(r.Context(), sid)                         // server-side kill (instant for opaque sessions)
    denylist.Add(r.Context(), tokenJTI(r), tokenTTLRemaining(r)) // bounds JWT replay window
    http.SetCookie(w, &http.Cookie{Name: "sid", Value: "", Path: "/", MaxAge: -1, HttpOnly: true, Secure: true, SameSite: http.SameSiteLaxMode})
    w.WriteHeader(http.StatusNoContent)
}
```

### Interview Edge Cases & Fault Tolerances
- **Race:** in-flight requests after logout carry the old token → server rejects with 401; client must not auto-retry with refresh after an explicit logout (refresh token revoked).
- **Offline logout:** queue the revoke call (`keepalive`/background sync), clear locally immediately.
- **Don't leave data behind:** wipe IndexedDB/Cache API entries holding user data; shared-machine risk.
- **Inverse problem:** login in one tab should update the others (avoid "logged out" ghost UI); same channel.
- **Idle-timeout/absolute-timeout** logout must use the same broadcast path.
- Observability: log `logout_propagation_ms` (broadcast→redirect) and count 401s received after logout.

---

## 19. Scenario: App Version Upgrade During an In-Flight Transaction (instructor's homework prompt)

### The "Why" (First Principles Rationale)
- Prompt (session): users are on banking app V1; you deploy V2 mid-transaction. The session left the answer to the students; reasoning from the principles above.
- **Why it's hard:** **version skew**: old client + new server (or vice versa) for the duration of the longest session; a forced reload can drop money-moving flows.

### Deep-Dive Engineering Mechanics
- **Expand/contract (parallel change):** backend ships additive, backward-compatible APIs first; clients migrate; remove old fields only after old clients are gone (min-supported-version policy).
- **Client version signal:** send `X-App-Version`; server answers `426`/custom code only when the version is below the **minimum supported** (security/contract break).
- **Update UX:** detect a new build (poll `/version.json`, or SW update), then **prompt at a safe point** (after transaction completes/idle), never mid-transaction. Flag-pin the journey (section 17).
- **Transaction safety:** idempotency keys + server-held transaction state, so a reload resumes rather than restarts or double-charges.

### ASCII Diagram
```
 t0 V1 clients ─────────────── (long session, mid-txn)
 t1 deploy backend v2 (additive)  ✓ V1 still works (compat window)
 t2 deploy frontend V2 assets     old chunks retained on CDN (N-1, N-2)
 t3 V1 tab detects newer build → defer prompt until txn state == DONE/IDLE → reload to V2
 t4 after min-supported-version passes → contract (drop deprecated API)
```

### Production-Grade Concrete Example
```ts
async function checkForUpdate() {
  const v = await fetch("/version.json", { cache: "no-store" }).then(r => r.json());
  if (v.build !== BUILD_ID) updateAvailable.set({ build: v.build, mandatory: v.minSupported > BUILD_NUM });
}
// Banner "Update available" appears only when journeyState.isSafeToInterrupt(); mandatory updates still wait for txn completion unless security-critical.
```

### Interview Edge Cases & Fault Tolerances
- Retain previous builds' static assets (avoid ChunkLoadError); use `Cache-Control: no-cache` for HTML/`version.json`.
- Service-worker update loops can trap users on stale shells; use `skipWaiting` only with a controlled reload.
- Mobile app stores: you cannot force-upgrade instantly; the backend compat window must cover store-review lag.

---

## 20. Scenario: Frequently Changing Backend URLs / API Endpoints (instructor's homework prompt)

### The "Why" (First Principles Rationale)
- Prompt (session): URLs change often; how do you keep API calls working? Hard-coded URLs scattered across code mean every change is a code change + deploy across all clients.
- **Principle:** indirection. Put base URLs/paths behind a single **endpoint registry** and a **gateway**, so the clients' contract is stable while backends move.

### Deep-Dive Engineering Mechanics
- **API gateway / BFF** exposes stable public paths (`/api/v1/orders`) and routes to whatever internal service/URL currently serves them (service discovery on the server side, so clients never learn internal topology).
- **Versioned APIs** for contract changes; **redirects (301/308)** for moved resources; deprecation headers (`Deprecation`, `Sunset`).
- **Client side:** one HTTP module; endpoints defined as typed constants; base URL from runtime config (served as `config.json`, not baked at build) so environments or regions change without a rebuild; **remote config** can override.
- **Frontend URL (route) changes (SEO):** keep old route → 301 to new; maintain sitemap; don't change slugs gratuitously.

### ASCII Diagram
```
 Client (typed endpoint registry) ──> https://api.acme.com/v1/orders   (stable contract)
                                          │ API Gateway / BFF (routes, authN, rate limit)
                     ┌────────────────────┼────────────────────┐
                     v                    v                    v
             orders-svc (v3 @ k8s svc)  orders-svc-eu     legacy-orders (strangler)
```

### Production-Grade Concrete Example
```ts
export const api = {
  orders: { list: () => "/v1/orders", byId: (id: string) => `/v1/orders/${encodeURIComponent(id)}` },
} as const;
const BASE = (window as any).__RUNTIME_CONFIG__.apiBase;   // from /config.json at boot, not build time
export const http = (path: string, init?: RequestInit) => fetch(BASE + path, init);
```

### Interview Edge Cases & Fault Tolerances
- Cached/mobile clients on old URLs → gateway keeps legacy routes until traffic metrics reach ~0.
- CORS/CSP allowlists must follow base-URL changes.
- Add contract tests so a moved endpoint fails CI, not production.

---

## 21. Axios vs Fetch

### The "Why" (First Principles Rationale)
- **Session position:** when architecting from scratch, avoid libraries you don't truly need (same for Redux); `fetch` can do everything Axios does (Axios wraps XHR/http adapters; the instructor's "uses fetch behind the scenes" is only loosely true: **[Correction]** Axios historically used XHR in browsers and now offers a fetch adapter). Axios's historical edge was convenience layers (interceptors, auto-JSON, timeouts, upload progress); with code-generation tooling the boilerplate cost is low, so a small own wrapper wins.
- **Why:** fewer dependencies = smaller bundle, smaller supply-chain attack surface, no version-upgrade coupling across teams (the monolith/MFE shared-lib problem from sections 2-3).
- **Trade-offs:** you own retry/timeout/interceptor behavior and its bugs; `fetch` **does not reject on HTTP 4xx/5xx** (check `res.ok`), has no built-in timeout (use `AbortSignal.timeout`), and no upload progress (use XHR or streams for that).

### Deep-Dive Engineering Mechanics
- A single `http` module provides: base URL, auth header/cookie handling, **timeout**, **retry with exponential backoff + jitter only for idempotent methods**, 401 → single-flight token refresh, error normalization, tracing headers, cancellation.
- **Single-flight refresh:** concurrent 401s must await the same refresh promise or you create a refresh storm and token rotation races.

### ASCII Diagram
```
 feature code ──> http.get(api.orders.list())
                      │ attach auth + trace-id
                      │ AbortSignal.any([timeout(5s), caller.signal])
                      v
                   fetch ──> 401? ──> single-flight refresh ──> retry once
                      │      5xx/network & idempotent? ──> backoff+jitter retry (max 2)
                      v
                  normalize error {code,status,retryable} ──> UI / telemetry
```

### Production-Grade Concrete Example
```ts
let refreshing: Promise<void> | null = null;

export async function http<T>(path: string, init: RequestInit & { retries?: number } = {}): Promise<T> {
  const { retries = init.method && init.method !== "GET" ? 0 : 2, ...rest } = init;   // retry idempotent only
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(BASE + path, {
      credentials: "include",
      ...rest,
      signal: AbortSignal.any([AbortSignal.timeout(5000), ...(rest.signal ? [rest.signal] : [])]),
    }).catch(err => { if (attempt < retries) return null; throw err; });
    if (res?.status === 401 && attempt === 0) { refreshing ??= refreshToken().finally(() => (refreshing = null)); await refreshing; continue; }
    if (res?.ok) return res.status === 204 ? (undefined as T) : res.json();
    if ((!res || res.status >= 500) && attempt < retries) { await sleep(2 ** attempt * 200 + Math.random() * 100); continue; }
    throw new HttpError(res?.status ?? 0, await res?.text());
  }
}
```

### Interview Edge Cases & Fault Tolerances
- Retry storms during an outage → cap attempts, add jitter, honor `Retry-After`, circuit-break per host.
- Non-idempotent POST retries → require an `Idempotency-Key`.
- Large uploads: use chunked/resumable protocol rather than a single fetch.
- Keep HTTP-client choice a **platform-team decision** in MFE setups so all remotes share one implementation.

---

## Coverage Index (session concept → section)
| Session topic | Section |
|---|---|
| 3 interview categories, HLD/LLD/pseudocode, YOE guidance, no-mimicry/no-arguing | 1 |
| Release-branching scenario, Gmail draft scenario, 5-s load scenario | 1 |
| Monolithic frontend, pros/cons, examples | 2 |
| Micro-frontend, Paytm example, state sharing, auth, platform team, splitting, when to use | 3 |
| Module Federation | 4 |
| Monorepo vs polyrepo, orthogonality to architecture, 2×2, package.json pinning | 5 |
| Recommended evolution path, "no right/wrong", Stack Overflow | 6 |
| CSR, SSR, hydration, SSG, ISR | 7-10 |
| Selection matrix, hybrid per-route (Saad), SEO crawling, Param's SSR-reload question | 8, 11 |
| AuthN vs AuthZ, direct-URL access, route guards, backend enforcement | 12 |
| RBAC, ABAC, feature-level access, layered pipeline, permission caching/dynamic updates | 13-15 |
| Feature flags, rollout practice, defaults/rollback | 16 |
| Mid-session flag change | 17 |
| Multi-tab logout | 18 |
| Upgrade mid-transaction, URL-change prompts (homework) | 19-20 |
| Axios vs Fetch | 21 |
| Omitted intentionally | Cohort logistics, resume reviews, non-technical asides |
