# React Router — Senior/Staff Engineer Interview Notes

> Source: Cohort-2 Session 8 (React Routing deep dive)
> Audience: Engineers with 5–9+ YOE preparing for product-based company interviews.
> Format: Concept → **Why it matters** → Code → Interview angle.

---

## 1. Why Routing Exists At All

### The problem (traditional / MPA websites)
- Every URL change → full page reload → browser sends a fresh HTTP request to the server for a new HTML document.
- Example: `/about.html` → download `about.html` from server → render → next click on `/index.html` → download again.
- Browser *can* cache assets, but conceptually each "page" is a server round trip.

### The shift (SPA / React)
- React apps render **one HTML shell**. "Navigating" is an illusion — no new document is fetched.
- Only the **data/resources** for a view (API calls, images) may be fetched — never the page itself.
- Routing = **the layer that maps a URL to a UI state (a component tree)**, entirely on the client.

```
Traditional (MPA)                     React (SPA)
─────────────────                     ───────────
/about  ──► server ──► new HTML       /about ──► router matches URL
                                              └──► swaps component in place
                                              └──► NO network round trip for the page
```

### Why this is asked in interviews
Interviewers use this to test if you understand **the fundamental trade-off SPAs make**: faster perceived navigation and state preservation, at the cost of you (the engineer) now owning things the browser used to do for free — scroll restoration, back/forward behavior, code splitting per route, SEO (without SSR/SSG), etc. Senior candidates are expected to articulate this trade-off, not just "how to use `<Route>`".

---

## 2. Client-Side vs Server-Side Routing

| | Server-side routing | Client-side routing (React Router) |
|---|---|---|
| Trigger | Browser requests `/about` | Router intercepts URL change |
| Response | New HTML document | Component swap in the DOM |
| Reload | Full page reload | No reload |
| Speed | Slower (network + parse) | Faster (JS already loaded) |
| SEO (default) | Naturally crawlable | Needs SSR/SSG for full SEO |

**Why it matters:** Client-side routing is what makes an app feel like a native app (instant transitions), but you inherit responsibility for URL correctness, deep-linking, and meaningful browser history — all of which used to be "free" with server rendering.

---

## 3. How React Router Works Conceptually

```
URL changes (click, back/forward, programmatic)
        │
        ▼
Router listens to history/location changes
        │
        ▼
Router matches URL → Route config (path → component)
        │
        ▼
Matched component is rendered; DOM updates in place
        │
        ▼
Browser URL bar updates — but NO network fetch for the page
```

Key idea: **Router = a subscription to browser history + a matching engine that decides which component tree to render for the current path.**

---

## 4. Core Building Blocks

### 4.1 `<BrowserRouter>` (the Router)
- Wraps the entire app.
- Listens for URL changes and provides **routing context** (current location, history API access) to everything nested inside it.
- Alternative: `<HashRouter>` (uses `#` in the URL, e.g. `/#/about`) — mentioned as rarely used in real company projects; mainly useful for static hosting with no server-side URL rewriting support (e.g., old GitHub Pages setups). If asked "have you used HashRouter, why/why not" — the honest senior answer: almost never in product companies because you control the server/CDN routing config, so `BrowserRouter` + a catch-all rewrite rule is preferred for clean URLs.

### 4.2 `<Routes>` and `<Route>`
- `<Routes>` is the container; each `<Route path="..." element={<X/>} />` maps one path to one component.
- **Only one Route (the best/first match) renders per URL.**

### 4.3 `<Link>` vs `<a href>` — **critical distinction**

| `<a href="...">` | `<Link to="...">` |
|---|---|
| Tells the **browser** to load a new page | Tells **React Router** to change the route |
| Triggers full reload, server round trip | No reload — swaps component client-side |
| Use for external links / leaving the app | Use for **all internal navigation** |

**Why this matters in interviews:** A very common "gotcha" — juniors use `<a href>` inside a React app for internal links and accidentally cause a full page reload, wiping all client state (Redux store, form data, etc.). Staff-level engineers should call this out proactively in code reviews.

```jsx
// Full app example
function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user/:id" element={<UserDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 5. Route Matching — Order & Specificity

- Matching happens **top to bottom** within `<Routes>` — the router evaluates route definitions in order and matches the current path.
- **Practical implication for large apps (100s of routes):**
  - Put **frequently visited routes near the top** so matching resolves faster.
  - Use analytics (Google Analytics or similar) to determine actual traffic frequency per route — don't guess.
  - Put **more specific routes before more generic/catch-all ones** (e.g., `/user/new` before `/user/:id`, otherwise `"new"` gets swallowed by the `:id` param).

### Interview framing
> "How would you order routes in a large-scale app?"
**Answer:** Order by (1) specificity — static/explicit paths before dynamic/param routes — and (2) traffic frequency, informed by analytics, so common routes match with fewer comparisons.

---

## 6. Dynamic Routes & URL Parameters

- URL params let you encode state directly in the URL — necessary for deep-linking, shareable URLs, and bookmarkability (something client state like Redux can't give you).

```jsx
<Route path="/user/:id" element={<UserDetails />} />
```

```jsx
import { useParams } from "react-router-dom";

function UserDetails() {
  const { id } = useParams(); // "101" for /user/101
  return <div>User ID: {id}</div>;
}
```

**Why it matters:** If a param is declared in the path but not passed in the URL, it resolves to `undefined` — this is a common source of unintended UI states ("blank" pages, crashed renders). Always guard against `undefined` params (loading/fallback UI).

Query strings (`?key=value&key2=value2`) are the other common way to pass URL data — used for filters, pagination, sort order, etc. (extracted via `useSearchParams`).

---

## 7. Programmatic Navigation — `useNavigate`

Used when navigation is a **side effect of logic**, not a direct user click on a link.

```jsx
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  function handleLogin(success) {
    if (success) {
      navigate("/home");
    } else {
      navigate("/error");
    }
  }
  // ...
}
```

### Why / when this is used (real product scenarios)
- Post-login redirects: success → `/home`, admin → `/admin`, failure → error screen.
- Role-based landing pages (admin vs regular user gets a different home).
- Wizard/multi-step flows where the "next" step depends on validation logic, not a static link.

---

## 8. Scalable Route Structuring (Senior-Level Topic)

This is explicitly called out as **the most common routing question for 5–9+ YOE candidates**: *"You have a large project — how do you structure your routes so it scales?"*

### ❌ Anti-pattern: Flat, path-based structure
```
src/
  pages/
    Home.jsx
    Login.jsx
    Dashboard.jsx
    Settings.jsx
    Profile.jsx
    ...hundreds more
```
**Why this breaks down:**
- No feature ownership — everything lives in one giant folder.
- Hard to code-split cleanly along team/feature boundaries.
- Routing logic becomes centralized and messy — one `router.js` importing everything.

### ✅ Recommended: Feature-domain structure
```
src/
  features/
    auth/
      LoginPage.jsx
      auth.routes.jsx        ← owns all auth-related routes
    dashboard/
      DashboardPage.jsx
      SettingsPage.jsx
      dashboard.routes.jsx   ← owns all dashboard-related routes
    profile/
      ProfilePage.jsx
      profile.routes.jsx
  app/
    router.jsx               ← ROOT router: composes feature routers
```

```jsx
// features/dashboard/dashboard.routes.jsx
export const dashboardRoutes = [
  { path: "dashboard", element: <Dashboard /> },
  { path: "dashboard/settings", element: <Settings /> },
];

// app/router.jsx  (root router — composition point)
import { authRoutes } from "../features/auth/auth.routes";
import { dashboardRoutes } from "../features/dashboard/dashboard.routes";
import { profileRoutes } from "../features/profile/profile.routes";

const allRoutes = [...authRoutes, ...dashboardRoutes, ...profileRoutes];
```

### Why this matters (the actual senior-level reasoning)
- **Ownership boundary = folder boundary.** The `auth` team can change anything inside `features/auth` (including removing/replacing the login page) **without touching the root router** or affecting other teams.
- This is essentially **"a project within a project"** — a stepping stone toward micro-frontend thinking, without the operational overhead of actual micro-frontends.
- Root router becomes a thin **composition layer**, not business logic.

### The barrel-import counter-argument (a real question raised in the session)
A candidate pushed back: *"Doesn't aggregating all routes in one `routes.js` per feature reintroduce the same problems as barrel files (`index.js` re-exporting everything), which hurt tree-shaking and code-splitting?"*

**Balanced answer (what a staff engineer should say):**
- Yes, technically a `feature.routes.jsx` file that imports every page in that feature is a **mini barrel** — it can partially defeat tree-shaking if not paired with lazy loading.
- But the *alternative* is worse: either (a) no aggregation at all (everything imported ad hoc into one root file — the flat anti-pattern above), or (b) fully manual per-route imports scattered everywhere with no single source of truth.
- The practical mitigation: **combine feature-route files with `React.lazy()` per route**, so even though the route *config* is centralized, the actual **component code is still code-split and loaded on demand**. Centralizing *route definitions* (cheap, just objects/strings) is not the same as centralizing *component code* (expensive) — that distinction is the key interview insight.

### Duplicate route name handling
- Two different features should **not** end up owning the exact same path.
- Practical guidance: keep **feature-level route prefixes unique** (`/dashboard/...`, `/profile/...`) even if teams work in isolation; page names *within* a feature can be more relaxed, but duplicate names across the app hurt:
  - Developer navigation (Cmd/Ctrl+P in the editor becomes ambiguous — multiple "Settings.jsx" files).
  - Debuggability and maintainability at scale.
- If the org is large enough that teams genuinely don't coordinate, duplication becomes tolerable *only* if each feature's root prefix is guaranteed unique.

---

## 9. Nested Routes & Layout-Based Routing (Outlet)

### The problem it solves
Every page in a dashboard-like app typically shares a **Header + Sidebar**, and only the center content changes per route. Without a shared-layout pattern, you'd repeat `<Header/>` and `<Sidebar/>` in every single page component.

**Why this is bad:**
- Duplication → any change to `Header` must be replicated (or manually kept in sync) across every page that uses it.
- Inconsistency risk — easy to forget updating one of N pages.

### The solution: `<Outlet />`

```jsx
// DashboardLayout.jsx
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div>
      <Header />
      <Sidebar />
      <main>
        <Outlet />   {/* child route renders here */}
      </main>
    </div>
  );
}
```

```jsx
// Nested route config
<Route path="dashboard" element={<DashboardLayout />}>
  <Route index element={<DashboardHome />} />       {/* /dashboard */}
  <Route path="settings" element={<Settings />} />  {/* /dashboard/settings */}
</Route>
```

### Diagram

```
/dashboard/settings
        │
        ▼
 ┌─────────────────────────────┐
 │  DashboardLayout             │
 │  ┌──────────┐                │
 │  │ Header   │  (constant)    │
 │  └──────────┘                │
 │  ┌────────┐ ┌──────────────┐ │
 │  │Sidebar │ │ <Outlet/>    │ │
 │  │(const) │ │ = SettingsPg │ │◄── swapped per route
 │  └────────┘ └──────────────┘ │
 └─────────────────────────────┘
```

### Key behavioral notes
- If you navigate to `/dashboard` (no sub-path), the `index` route is rendered inside the `Outlet`.
- If you navigate to `/dashboard/settings`, the `Settings` route is rendered inside the same `Outlet`.
- Nested routes are **only reachable through their parent path** — `settings` on its own means nothing; it must be `dashboard/settings`.

### Why this is a top interview concept
This is the direct, practical embodiment of **route composition** — you're explicitly asked to reason about "given shared UI (header/footer/sidebar) and changing center content, how do you structure the router?" `Outlet` + nested `<Route>` is the textbook answer, and interviewers use it to check whether you understand *composition* over *duplication*.

---

## 10. Protected Routes / Authentication Guards

### The pattern

```jsx
function RequireAuth({ children }) {
  const isAuthenticated = checkAuth(); // token/cookie check, your logic
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
```

```jsx
<Route
  path="/dashboard"
  element={
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  }
/>
```

### How this pattern evolved (know this — commonly asked as "how would you implement this differently?")

| Era / Style | Mechanism |
|---|---|
| Older (class-component era) | **Higher-Order Component (HOC)**: `withAuth(Component)` wraps and checks auth before rendering |
| Modern (hooks era) | Custom hook, e.g. `useRequireAuth()`, called inside the component/layout |
| Common in practice today | Wrapper component (`RequireAuth`) around `children`, as shown above — works well with nested routes + `Outlet` |

All three achieve the same outcome: **gate rendering of protected children behind an auth check.** Know all three — interviewers may ask you to implement it as a HOC *or* a hook to test flexibility.

### Why guards matter architecturally
- Centralizes the "is this user allowed here" decision in one place instead of scattering `if (!user) redirect` checks inside every page component.
- Composable with layout routing — you can wrap an entire `<DashboardLayout>` subtree in one `RequireAuth`, protecting all nested children at once.

### Advanced: Multiple guards / role-based access (raised as a real interview-style question in the session)

**Question:** *"How do you handle multiple guards on a single page — e.g., a page needs both authentication AND a specific permission/role, and each guard failure should redirect somewhere different? How do you define app-level vs page-level guards?"*

**Senior-level answer:**
1. **Compose guards, don't conflate them.** Keep `RequireAuth` (is the user logged in) and `RequirePermission`/`RequireRole` (does this user have access) as **separate, composable wrapper components** — each with a single responsibility.
   ```jsx
   <Route
     path="/admin/reports"
     element={
       <RequireAuth>
         <RequireRole role="admin" fallback="/unauthorized">
           <AdminReports />
         </RequireRole>
       </RequireAuth>
     }
   />
   ```
2. **App-level guard vs page-level guard:**
   - **App-level guard**: wrap it once around a whole layout/subtree (e.g., everything under `/dashboard`) when the rule applies broadly — "must be logged in to see anything under dashboard."
   - **Page-level guard**: apply narrowly to a specific route when the rule is unique to that page — "only admins can see `/dashboard/reports`, but any logged-in user can see the rest of `/dashboard`."
3. **Different redirect targets per guard failure** — each guard component owns its own fallback/redirect logic (`<Navigate to="/login"/>` vs `<Navigate to="/unauthorized"/>`), rather than a single monolithic check trying to handle every case.
4. **Role-specific behavior for the *same* route** (e.g., admin sees an enhanced dashboard, regular user sees a limited one) is typically handled **inside** the guard/route-resolution logic itself — e.g., conditionally render different components, or conditionally skip the auth check entirely for certain roles — based on your custom logic (session mentions this explicitly: "you can update your logic to check the role and decide accordingly").

**Why this composability matters:** In real product companies, permission systems grow — first it's "logged in or not," later it's roles, later it's granular feature flags/permissions. If your auth check is one giant `if` block, every new requirement means editing it. If it's composable wrapper components, you add a new guard without touching existing ones. **This is the actual signal interviewers are looking for at senior/staff level: composition and separation of concerns, not just "wrap in a check."**

---

## 11. Adjacent Topics Interviewers Link to Routing

The session explicitly flags these as commonly asked **together** with routing in interviews:

- **Lazy loading** (`React.lazy()` + `<Suspense>`) — load route components on demand instead of bundling everything upfront.
- **Code splitting** — natural consequence of route-based lazy loading; each route becomes its own JS chunk.
- **Tree shaking** — dead-code elimination at build time; relevant to the barrel-import discussion above (barrel files can hinder tree shaking if not paired with per-route lazy imports).
- **Bundling** — how a bundler (Webpack/Vite) decides chunk boundaries, often aligned to route boundaries in a well-structured app.

### Why they're linked
Routing decides **what** gets rendered when; lazy loading + code splitting decide **when the code for that "what" is actually downloaded**. A staff-level answer to "how do you optimize a large React app's load time" should connect route structure → lazy-loaded route components → smaller initial bundle → faster first paint, i.e., these topics are not independent trivia, they're one coherent performance story.

```jsx
// Route-level lazy loading — ties directly into feature-based route structuring
import { lazy, Suspense } from "react";

const Settings = lazy(() => import("../features/dashboard/SettingsPage"));

<Route
  path="settings"
  element={
    <Suspense fallback={<Spinner />}>
      <Settings />
    </Suspense>
  }
/>
```

---

## 12. Quick-Fire Interview Q&A Recap

| Question | One-line answer |
|---|---|
| Why is routing needed in React apps? | To map URL → UI state on the client without full page reloads, keeping the URL meaningful and shareable. |
| `<Link>` vs `<a href>`? | `Link` = client-side route change, no reload; `href` = browser navigation, full reload — never use `href` for internal nav. |
| How does route matching work? | Top-to-bottom; order routes by specificity first, then by traffic frequency for performance. |
| How do you pass data via URL? | Path params (`/user/:id` via `useParams`) or query strings (`useSearchParams`). |
| How do you navigate based on logic (not a click)? | `useNavigate()` — e.g., redirect after login success/failure. |
| How do you structure routes for a large app? | Feature-domain folders, each owning its routes; a thin root router composes them. |
| How do you avoid duplicating Header/Sidebar across pages? | Layout-based routing with nested `<Route>` + `<Outlet/>`. |
| How do you protect a route? | Wrapper component/HOC/hook (`RequireAuth`) checking auth before rendering children, redirecting via `<Navigate/>` if not authenticated. |
| How do you support multiple guards (auth + role) with different redirects? | Compose separate guard components (`RequireAuth`, `RequireRole`), nest them, each owning its own fallback route; apply at app-level (layout) or page-level depending on scope. |
| What's the link between routing and performance? | Route-based code splitting via `React.lazy()` + `Suspense` — each route becomes its own chunk, shrinking the initial bundle. |

---

## 13. Gaps to Fill Beyond This Session (for full interview readiness)

The session ran out of time mid-discussion on guards. Round out your prep with:
- `createBrowserRouter` / `RouterProvider` (Data Router API) — modern React Router v6.4+ approach, including **loaders** and **actions** for data-fetching tied to routes (increasingly asked in product-company interviews as it replaces manual `useEffect` data fetching per page).
- Route-level error boundaries (`errorElement`).
- Scroll restoration on navigation.
- `NavLink` (active-state-aware version of `Link`) for nav highlighting.
- Handling 404 / catch-all routes (`path="*"`).
