# React Frontend Engineering — Interview Prep Guide

> Format for every question: **Plain-English Answer** → **How It Actually Works (Deep Dive)** → **Code/Example** → **Interview-Ready Summary (30-sec answer)** → **Likely Follow-Ups**
>
> Read the deep dives to *understand*. Rehearse the 30-second summaries to *perform*.

---

## Table of Contents
1. [React Tree Shaking](#1-react-tree-shaking)
2. [React Bundler](#2-react-bundler)
3. [React Routing](#3-react-routing)
4. [React Lazy Loading](#4-react-lazy-loading)
5. [Accessibility](#5-accessibility)
6. [Web Vitals](#6-web-vitals)
7. [Quick-Fire Cheat Sheet](#7-quick-fire-cheat-sheet)

---

## 1. React Tree Shaking

### 1.1 What is tree shaking and why is it important in React applications?

**Plain-English Answer**
Tree shaking is a build-time process where the bundler removes code that is never actually used (imported and referenced) by your application, before shipping the final JavaScript bundle to the browser.

**Deep Dive**
- Think of your app's full dependency graph as a tree. Every `import` is a branch. Tree shaking "shakes" the tree so dead branches (unused exports) fall off.
- It relies on **dead code elimination (DCE)**: if a function/variable is exported from a module but never imported anywhere in the reachable graph, it's stripped from the final bundle.
- Why it matters specifically for React apps:
  - UI libraries (lodash, date-fns, icon packs, component libraries like MUI/Ant Design) often export *hundreds* of utilities/components, but a given app might use 5.
  - Without tree shaking, you'd ship the entire library → bigger JS payload → slower parse/compile/execute time on the client, especially painful on mobile.
  - Smaller bundle size directly improves **Time to Interactive (TTI)** and **Largest Contentful Paint (LCP)** — both Core Web Vitals.

**Code/Example**
```js
// utils.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b; // never used anywhere

// App.js
import { add } from './utils';
console.log(add(2, 3));
```
A production build (Webpack/Vite/Rollup with `mode: production`) will detect `subtract` is never imported and drop it from the final bundle.

**Interview-Ready Summary**
"Tree shaking is dead-code elimination at build time — the bundler statically analyzes your ES module imports/exports, builds a dependency graph, and strips anything that's exported but never used. It matters in React apps because we pull in large libraries but only use a fraction of them; shaking out the unused parts keeps the JS bundle small, which speeds up parsing and Time to Interactive."

**Likely Follow-Ups**
- "Does tree shaking remove unused React components?" → Only if they're unused *exports* the bundler can prove are unreferenced; component code with side effects or dynamic usage may survive.
- "What's the difference between minification and tree shaking?" → Minification shrinks the *code that stays* (renaming vars, removing whitespace); tree shaking decides *what code stays at all*.

---

### 1.2 How does tree shaking work internally?

**Plain-English Answer**
It works because ES Modules (`import`/`export`) are *statically analyzable* — the bundler can figure out the entire module graph without running any code, then mark-and-sweep unused exports.

**Deep Dive**
1. **Parsing** — The bundler (Rollup, esbuild, Webpack via Terser) parses every file into an AST (Abstract Syntax Tree).
2. **Static analysis of imports/exports** — Because ES module `import`/`export` statements are fixed at the top level and can't be conditionally reassigned at runtime, the bundler can determine *exactly* what each module exposes and what each consumer uses — all without executing the code.
3. **Building the dependency graph** — Starting from entry point(s), the bundler walks every `import` statement to build a graph of "reachable" modules/bindings.
4. **Marking** — Every export that is never imported anywhere in the reachable graph is marked as "unused."
5. **Sweeping (DCE)** — A minifier (Terser/esbuild) then physically deletes the marked code, plus performs further elimination like removing `if (false) {...}` branches.
6. **Side-effect flag** — `package.json` can declare `"sideEffects": false` telling the bundler "importing this module and not using its exports has zero observable effect, so it's safe to fully drop." This is what unlocks aggressive shaking for whole packages.

**Code/Example**
```json
// package.json of a library
{
  "name": "my-ui-kit",
  "sideEffects": false
}
```
This tells bundlers: "if a consumer imports `Button` from `my-ui-kit` but not `Modal`, it's 100% safe to drop `Modal` entirely — nothing in this package runs global side effects like polyfills or CSS injection on import."

**Interview-Ready Summary**
"It's possible because ES modules are statically structured — imports/exports are declared at the top level, not computed at runtime, so the bundler can build an accurate dependency graph without executing code. It marks every exported binding that's never imported anywhere reachable from the entry point, then a minifier physically deletes that dead code. The `sideEffects` field in package.json is the safety valve that tells the bundler it's safe to drop whole unused modules."

**Likely Follow-Ups**
- "What is an AST?" → Tree representation of source code structure used by parsers/compilers.
- "What's the risk of `sideEffects: false` being wrong?" → If a module secretly does something on import (e.g., injects CSS, registers a polyfill) and you mark it side-effect-free, the bundler may drop it and silently break your app.

---

### 1.3 Why does tree shaking not work well with CommonJS (`require`)?

**Plain-English Answer**
CommonJS imports/exports are resolved at **runtime**, not statically at build time, so the bundler can't safely prove ahead of time what's used and what isn't.

**Deep Dive**
- `require()` is just a normal JavaScript function call. It can be called conditionally, inside loops, with a dynamically computed string path:
  ```js
  const mod = require(condition ? './a' : './b'); // impossible to statically resolve
  ```
- `module.exports = {...}` is a plain object assignment, which can be **mutated after the fact**:
  ```js
  module.exports.subtract = subtract; // added conditionally, later, anywhere
  ```
- Because both the import side and export side can change based on runtime logic, a static analyzer cannot build a reliable dependency graph without actually *executing* the code — which defeats the purpose of a build-time optimization.
- Result: bundlers must conservatively assume "the whole module might be needed" and include all of it.
- This is precisely why modern libraries ship **dual builds**: a `main` field pointing to a CommonJS build (for Node/older tooling) and a `module`/`exports` field pointing to an ESM build (for bundlers to tree-shake).

**Code/Example**
```js
// CommonJS - NOT tree-shakeable
const utils = require('./utils');
utils.add(1, 2); // bundler can't statically guarantee 'subtract' is unused,
                  // since 'utils' could be mutated/reassigned dynamically

// ESM - tree-shakeable
import { add } from './utils'; // statically declares exactly what's used
```

**Interview-Ready Summary**
"CommonJS uses `require()`, which is a runtime function call — the module path can be dynamic and `module.exports` is just a mutable object that can change at runtime. That makes static analysis unreliable, so bundlers can't safely prove what's dead code and have to include the whole module. ESM's `import`/`export` are static declarations resolved at parse time, which is what makes shaking possible. That's why modern packages publish both a CJS build for Node and an ESM build (via the `module` or `exports` field) specifically so bundlers can tree-shake the ESM version."

**Likely Follow-Ups**
- "Can Webpack shake CommonJS at all?" → Very limited/experimental support; not reliable in practice.
- "How do you know if a library is tree-shakeable?" → Check if it ships an ESM build (`"module"` field in package.json) and check bundle analyzer output.

---

### 1.4 What coding patterns can break tree shaking?

**Plain-English Answer**
Anything that prevents the bundler from statically proving "this code is unused" — mainly barrel files, side effects, whole-library imports, and dynamic/default export patterns.

**Deep Dive**
1. **Barrel files** (`index.js` that re-exports everything from a folder):
   ```js
   // icons/index.js
   export * from './home';
   export * from './settings';
   export * from './profile';
   // ... 200 more icons
   ```
   Importing even one icon (`import { Home } from './icons'`) can force the bundler to at least *parse/evaluate* the whole barrel, and in weaker bundler configs, bundle all of it — because re-export chains are harder to trace precisely, especially across many nested barrels.

2. **Side effects at module scope** — code that runs immediately on import (polyfills, global CSS injection, analytics registration, prototype patching):
   ```js
   import './setupAnalytics'; // runs on import — bundler must keep it, can't prove it's "unused"
   ```
   If `sideEffects` isn't correctly declared, the bundler must conservatively keep *any* module like this even if nothing it exports is used.

3. **Importing entire libraries instead of named exports**:
   ```js
   import _ from 'lodash';       // ❌ pulls in the whole library
   import { debounce } from 'lodash'; // ✅ still risky if lodash isn't ESM
   import debounce from 'lodash/debounce'; // ✅ safest — direct file path
   ```

4. **Default exports of large objects/namespaces** — bundlers can shake *named* exports precisely, but a default export that's one big object makes individual members harder to prove unused:
   ```js
   export default { add, subtract, multiply, divide }; // harder to shake individual members
   ```

5. **Re-assigning exports / dynamic property access** — e.g., `exports[key] = fn` patterns, or accessing members via computed strings, defeats static analysis.

**Code/Example**
```js
// ❌ Breaks tree shaking
import * as Icons from './icons/index'; // barrel + namespace import
<Icons.Home />

// ✅ Tree-shake friendly
import Home from './icons/Home';
<Home />
```

**Interview-Ready Summary**
"The big four: barrel files that re-export everything (bundler struggles to trace exactly what's used through the re-export chain), module-level side effects that run on import (bundler can't prove they're safe to drop), importing an entire library namespace instead of named exports, and default-exporting one big object instead of individual named exports. In practice, I check bundle analyzer output and prefer direct/named imports plus properly configured `sideEffects` in package.json to avoid these."

**Likely Follow-Ups**
- "How would you detect this in a real project?" → `webpack-bundle-analyzer` / Vite's `rollup-plugin-visualizer`, checking for unexpectedly large chunks.
- "How do you fix a barrel file problem without giving up the nice import syntax?" → Some bundlers (Vite/Rollup with proper config, or tools like `babel-plugin-import`) can transform `import { X } from 'lib'` into direct-path imports automatically.

---

## 2. React Bundler

### 2.1 What is a bundler and why does React need one?

**Plain-English Answer**
A bundler is a build tool that takes many separate JS/CSS/asset files with interdependencies and combines/transforms them into optimized output the browser can efficiently load.

**Deep Dive**
- React apps are written as dozens/hundreds of modules (`import Component from './Component'`), plus JSX, which browsers **cannot execute natively**. JSX must be compiled to `React.createElement(...)` calls (via Babel/SWC/esbuild).
- Core responsibilities of a bundler:
  - **Module resolution** — figuring out `import './Button'` actually means `./Button.jsx` or `./Button/index.js`.
  - **Dependency graph construction** — knowing what depends on what, so it can bundle in the right order and dedupe shared modules.
  - **Transformation** — JSX → JS, TypeScript → JS, SCSS → CSS, modern JS → browser-compatible JS (via transpilation).
  - **Optimization** — tree shaking, minification, chunk splitting, asset hashing for cache-busting.
  - **Dev server features** — Hot Module Replacement (HMR), fast rebuilds, source maps for debugging.
- Without a bundler, you'd need to manually manage script load order, manually convert JSX, and ship hundreds of individual network requests (slow, especially pre-HTTP/2).

**Interview-Ready Summary**
"A bundler resolves your module graph, transforms non-browser-native syntax like JSX/TypeScript into plain JS, and packages everything into optimized output — handling things like minification, tree shaking, code splitting, and cache-busting via hashed filenames. React specifically needs this because JSX isn't valid browser JS, and any non-trivial app has a deep tree of interdependent modules that need to be resolved and packaged efficiently."

**Likely Follow-Ups**
- "Name some bundlers." → Webpack, Vite (uses Rollup for prod, esbuild for dev pre-bundling), Parcel, esbuild, Turbopack.
- "Is a bundler the same as a transpiler?" → No — transpilation (Babel/SWC) is one *step* a bundler orchestrates; the bundler's core job is graph resolution + packaging.

---

### 2.2 How is Vite different from Webpack in development mode?

**Plain-English Answer**
Webpack bundles your *entire* app before serving anything in dev mode; Vite serves your source files as native ES modules directly to the browser and only compiles files on demand as the browser requests them.

**Deep Dive**
- **Webpack dev mode**: On server start, Webpack walks the whole dependency graph and builds a bundle (even if cached/incremental) before the browser can render anything. As the app grows, this "cold start" gets progressively slower — more modules = more up-front work.
- **Vite dev mode**:
  1. Uses **native ES modules** in the browser. `<script type="module">` lets the browser itself request each import as a separate HTTP request.
  2. Vite's dev server intercepts these requests and transforms *only that one file* on demand (JSX→JS, TS→JS) — no full-app bundling step.
  3. **Pre-bundles dependencies** (node_modules) once using **esbuild** (written in Go, ~10-100x faster than JS-based transforms) — converting CommonJS deps to ESM and merging many small internal modules of a dependency into fewer requests, since native ESM resolves imports as individual network requests and too many small files would be slow over HTTP.
  4. Result: **near-instant cold start** regardless of app size, because Vite never bundles your own source code up front — only what's actually requested by the current page gets compiled.
- **HMR (Hot Module Replacement)**: Both support it, but Vite's is generally faster because updating a module means re-transforming just that file and pushing it over the existing module graph — it doesn't need to rebuild a bundle.

**Interview-Ready Summary**
"Webpack builds the full bundle before dev serving starts, so cold-start time grows with app size. Vite instead serves your source as native ES modules — the browser requests files individually, and Vite transforms each one on-demand only when requested, so cold start is near-instant no matter how big the app is. Vite also pre-bundles `node_modules` dependencies once using esbuild, which is dramatically faster than JS-based bundlers and converts CJS deps to ESM. In production, though, Vite switches to Rollup to actually bundle everything, because native ESM over the network isn't performant enough for production at scale."

**Likely Follow-Ups**
- "Does Vite bundle for production too?" → Yes, via Rollup — dev and prod use different strategies intentionally.
- "Why not just use native ESM in production?" → Too many individual HTTP requests, worse caching granularity, no tree shaking without a bundling step.

---

### 2.3 What happens differently in development and production builds?

**Plain-English Answer**
Dev builds optimize for **fast feedback and debuggability**; production builds optimize for **smallest, fastest-loading, cache-friendly output**.

**Deep Dive**

| Aspect | Development | Production |
|---|---|---|
| Minification | Off (readable code) | On (Terser/esbuild strips whitespace, shortens variable names) |
| Tree shaking | Usually skipped/partial | Fully applied |
| Source maps | Full, fast (`eval-source-map` style) | Often separate `.map` files or omitted for security/size |
| File hashing | Not needed | Filenames include content hash (`main.a1b2c3.js`) for cache busting |
| React internals | Extra dev warnings, PropTypes checks, `console.error` for misuse, slower reconciliation checks | Dev-only code stripped via `process.env.NODE_ENV === 'production'` checks |
| Code splitting | May be simplified | Aggressive chunk splitting for optimal caching |
| HMR | Enabled | Not applicable (no live server) |
| Build speed priority | Fast rebuilds | Fast *runtime*, build time is secondary |

- A key mechanic: libraries like React wrap dev-only logic in `if (process.env.NODE_ENV !== 'production')`. Bundlers replace that expression with a literal string at build time, and minifiers then **dead-code-eliminate the now-unreachable branch** — this is how React strips all its helpful warnings/checks from prod bundles.

**Interview-Ready Summary**
"Dev builds prioritize speed of iteration — unminified code, full source maps, HMR, and extra runtime checks/warnings (React's PropTypes validation, dev warnings). Production builds prioritize runtime performance and payload size — full minification, tree shaking, content-hashed filenames for long-term caching, and dev-only code paths stripped out via `NODE_ENV` checks getting dead-code-eliminated. Under the hood, that NODE_ENV branch elimination is literally how React drops all its dev warnings from the shipped bundle."

**Likely Follow-Ups**
- "Why does React feel slower in dev mode?" → Extra validation, warnings, StrictMode double-invoking functions to surface side effects, unminified code.
- "What's content hashing used for exactly?" → Long-term browser caching — the filename only changes when content changes, so unchanged chunks stay cached across deploys.

---

### 2.4 What is code splitting and how do bundlers enable it?

**Plain-English Answer**
Code splitting breaks one giant JS bundle into multiple smaller chunks that load on demand, instead of forcing the browser to download the entire app's code before it can render anything.

**Deep Dive**
- Instead of one `bundle.js` containing every route/component, the bundler creates separate chunk files: `main.js`, `about-page.[hash].js`, `checkout.[hash].js`, etc.
- The trigger mechanism is the **dynamic `import()` syntax**, which returns a Promise:
  ```js
  const module = await import('./CheckoutPage');
  ```
  This is fundamentally different from a static `import` at the top of a file — the bundler recognizes `import()` as a **split point** and generates a separate chunk for that module (and its exclusive dependencies) rather than including it in the main bundle.
- The bundler then rewrites this into runtime logic that injects a `<script>` tag (or uses `fetch`) to load that chunk only when the code path executes.
- Common split strategies:
  - **Route-based splitting** — each page/route is its own chunk (most common, pairs naturally with `React.lazy` + router).
  - **Component-based splitting** — heavy components (charts, rich text editors, modals) split out and loaded on interaction.
  - **Vendor splitting** — separating rarely-changing third-party libs into their own chunk so app code changes don't invalidate the vendor cache.
- Benefit: smaller **initial** bundle → faster first load → better LCP/TTI, at the cost of a small delay when a not-yet-loaded chunk is first needed.

**Code/Example**
```js
// Static import — bundled into main chunk, always downloaded
import CheckoutPage from './CheckoutPage';

// Dynamic import — becomes its own chunk, only fetched when this line runs
const CheckoutPage = React.lazy(() => import('./CheckoutPage'));
```

**Interview-Ready Summary**
"Code splitting breaks the app into multiple chunks that load on demand instead of one big upfront bundle. The mechanism is the dynamic `import()` syntax — bundlers treat that as a split point, generate a separate chunk, and emit runtime code to fetch it only when actually needed. Most commonly this is done per-route, often combined with `React.lazy`, so a user visiting the homepage never has to download the checkout page's code until they navigate there — which directly improves initial load performance."

**Likely Follow-Ups**
- "What's the tradeoff of splitting too aggressively?" → Too many tiny chunks means more HTTP requests and can hurt performance/caching efficiency; there's a balance.
- "How does this relate to React.lazy?" → `React.lazy` is React's API built directly on top of dynamic `import()` — see Section 4.

---

## 3. React Routing

### 3.1 How does client-side routing work in React without page reloads?

**Plain-English Answer**
It intercepts navigation, updates the URL using the browser's History API without triggering a full page reload, and then re-renders the matching component — all in JavaScript, entirely client-side.

**Deep Dive**
- Normally, clicking `<a href="/about">` tells the browser to make a full new HTTP request and reload the entire page.
- In a React **SPA (Single Page Application)**, the router intercepts that click event, calls `event.preventDefault()` to stop the browser's default navigation, and instead:
  1. Calls `history.pushState(state, '', '/about')` — this changes the URL bar and adds a browser history entry, **without** making a network request or reloading the page.
  2. The router's internal state (which tracks "current path") updates.
  3. React re-renders, and the router's matching logic decides which route component to display for `/about`, swapping out the visible component tree.
- The **History API** (`pushState`, `replaceState`, `popstate` event) is the browser-native mechanism this all relies on. `popstate` fires when the user clicks back/forward, letting the router sync its internal state with browser navigation.
- Because there's no reload, JS state (Redux store, context, in-memory data) persists across "page" navigations — this is the core UX benefit of an SPA: instant, app-like transitions.

**Code/Example (conceptual, simplified)**
```js
// Simplified mental model of what React Router does internally
function navigate(path) {
  window.history.pushState({}, '', path);
  render(matchRoute(path)); // re-render matching component
}

window.addEventListener('popstate', () => {
  render(matchRoute(window.location.pathname)); // sync on back/forward
});
```

**Interview-Ready Summary**
"Client-side routing intercepts link clicks and prevents the browser's default full-page navigation. Instead it uses the History API's `pushState` to update the URL and browser history entry without a network request, updates the router's internal path state, and React re-renders the component tree to match the new path. The `popstate` event handles browser back/forward buttons by syncing router state to whatever URL the browser lands on. Because there's no reload, all your in-memory app state survives navigation — that's the core SPA experience."

**Likely Follow-Ups**
- "What happens on a hard refresh of `/about`?" → The server must be configured to return `index.html` for all routes (a fallback/rewrite rule), otherwise you get a 404 since there's no actual `/about` file on the server.
- "Is this related to the Fetch API?" → No — History API is separate; it's purely about URL/browser history manipulation, not networking.

---

### 3.2 Difference between BrowserRouter and HashRouter?

**Plain-English Answer**
`BrowserRouter` uses clean URLs (`/about`) via the History API; `HashRouter` uses a URL fragment (`/#/about`) so the browser never actually sends the "route" part to the server at all.

**Deep Dive**

| | `BrowserRouter` | `HashRouter` |
|---|---|---|
| URL format | `example.com/about` | `example.com/#/about` |
| Mechanism | History API (`pushState`) | The `#` fragment identifier — browsers never send anything after `#` in an HTTP request |
| Server config needed? | **Yes** — server must rewrite all unknown paths to `index.html`, otherwise refreshing `/about` returns a 404 | **No** — server only ever sees a request for `/`, since `#/about` is purely client-side; no rewrite rules needed |
| SEO | Better — clean URLs are more crawler/share-friendly, and server-rendering/pre-rendering tools work naturally with real paths | Worse — historically, crawlers didn't reliably index fragment-based routes, and URLs look less "real"/shareable |
| Typical use case | Modern apps with a configurable server/CDN (Netlify, Vercel, Nginx rewrite rules) | Legacy support, static file hosting with zero server config control, or embedding in environments where you can't control routing rules |

- Why does the fragment (`#`) avoid needing server config? Because by web spec, the fragment portion of a URL is **never sent to the server** in the HTTP request — it's purely a client-side browser concept (originally for anchor links). `HashRouter` exploits this: the server only ever sees a GET for `/`, and all "routing" after the `#` is resolved entirely in JS.

**Interview-Ready Summary**
"BrowserRouter gives you clean URLs using the History API, but it requires the server to be configured to rewrite all paths to index.html, otherwise a hard refresh on a nested route 404s. HashRouter instead sticks the route after a `#`, which browsers never send to the server by spec — so the server always just sees a request for `/` and needs zero configuration. The tradeoff is HashRouter URLs are uglier and worse for SEO/sharing, so BrowserRouter is preferred whenever you control server/CDN rewrite rules, which is almost always the case today with platforms like Vercel/Netlify handling that automatically."

**Likely Follow-Ups**
- "When would you actually choose HashRouter today?" → Static hosting with no rewrite control (e.g., raw GitHub Pages without extra config), or embedding a router inside a non-root context you don't control.
- "What about server-side rendering (SSR)?" → SSR frameworks (Next.js, Remix) handle routing at the server/framework level entirely differently, bypassing this tradeoff.

---

### 3.3 How does React Router decide which component to render?

**Plain-English Answer**
It compares the current URL path against the list of registered route patterns, finds the best/most specific match, and renders that route's component — walking nested route definitions to build up the full component tree.

**Deep Dive**
- **Path pattern matching**: Routes are defined with patterns like `/users/:id` where `:id` is a dynamic segment. The router matches the actual URL (`/users/42`) against these patterns and extracts params (`{ id: '42' }`).
- **Specificity/ranking**: Modern React Router (v6+) uses a **ranking algorithm** rather than strict "first match wins" top-to-bottom ordering used in v5. It scores routes by specificity — static segments rank higher than dynamic segments, which rank higher than wildcards — so the *most specific* match wins regardless of declaration order.
  - Example: `/users/new` (static) beats `/users/:id` (dynamic) even if `:id` was declared first, because it's a better match.
- **Nested routes**: Routes can be nested, mirroring nested UI layout. A parent route renders shared layout (nav, sidebar) plus an `<Outlet />` placeholder; matching child routes render inside that outlet. This lets the router build up a component tree matching the URL hierarchy, rather than a single flat swap.
- **Index routes**: A special "default child" route rendered when the parent path matches exactly with no further nested segment.
- Under the hood, this whole system relies on the client-side routing mechanism from 3.1 — path matching just determines *what to render*, while History API handles *how navigation happens*.

**Code/Example**
```jsx
<Routes>
  <Route path="/users" element={<UsersLayout />}>
    <Route index element={<UsersList />} />         {/* /users exactly */}
    <Route path="new" element={<NewUser />} />       {/* /users/new — wins over :id */}
    <Route path=":id" element={<UserDetail />} />    {/* /users/42 */}
  </Route>
</Routes>
```

**Interview-Ready Summary**
"React Router matches the current URL against registered path patterns, extracting dynamic segments like `:id` as params. In v6+, it uses a specificity-ranking algorithm rather than declaration order, so a static path like `/users/new` always beats a dynamic `/users/:id` regardless of which was defined first. It also supports nested routes, where a parent route renders shared layout with an `<Outlet />`, and matching child routes render inside it — building up a component tree that mirrors the URL structure rather than just swapping one flat component."

**Likely Follow-Ups**
- "What changed between React Router v5 and v6?" → v6 introduced ranked matching (vs. first-match order-dependent), `<Outlet />` for nested layouts, hooks-based API (`useNavigate` replacing `useHistory`), and relative nested route paths.
- "How are route params accessed in a component?" → `useParams()` hook.

---

## 4. React Lazy Loading

### 4.1 What is lazy loading in React and when should it be used?

**Plain-English Answer**
Lazy loading defers fetching/rendering a piece of code (usually a component) until it's actually needed, instead of including it in the initial bundle everyone downloads upfront.

**Deep Dive**
- Directly built on the **code splitting** mechanism (Section 2.4) — lazy loading is the *application* of code splitting specifically to React components.
- Best used for:
  - **Route-level components** — no need to download the `/settings` page code if the user only ever visits `/dashboard`.
  - **Below-the-fold or conditionally-rendered heavy components** — modals, rich text editors, charting libraries, image galleries — things not needed for the very first render.
  - **Large third-party dependencies** used in a narrow feature (e.g., a PDF viewer library only used on one rarely-visited page).
- When **not** to use it: tiny components, or anything critical to the initial above-the-fold render — lazy loading those just adds an unnecessary network round-trip and a loading flicker for something the user needs immediately.
- Direct performance payoff: smaller initial JS bundle → less to download/parse/execute on first load → better LCP and TTI (see Section 6).

**Interview-Ready Summary**
"Lazy loading defers downloading a component's code until the moment it's actually rendered, rather than bundling it into the initial payload. It's built on dynamic `import()`-based code splitting. I'd use it for route-level pages and for heavy, conditionally-shown components like modals or a charting library — basically anything not needed for the very first paint. I wouldn't use it for small or critical above-the-fold components, since that just adds an unnecessary loading delay."

**Likely Follow-Ups**
- "What's the cost of lazy loading something too eagerly needed?" → Extra network round trip + loading state flash, hurting perceived performance for something the user needed instantly.
- "Can you lazy load without React.lazy?" → Yes — raw dynamic `import()` with manual state management, but `React.lazy` + Suspense standardizes the loading/error UX.

---

### 4.2 How does `React.lazy()` work with bundlers?

**Plain-English Answer**
`React.lazy()` wraps a dynamic `import()` call, and the bundler recognizes that `import()` as a code-split point, generating a separate chunk that's fetched over the network only when that component is first rendered.

**Deep Dive**
1. You write:
   ```js
   const SettingsPage = React.lazy(() => import('./SettingsPage'));
   ```
2. **At build time**, the bundler sees the `import('./SettingsPage')` call and:
   - Extracts `SettingsPage.jsx` (plus its exclusive dependencies) into its own separate chunk file, e.g., `settingspage.a1b2c3.js`.
   - Replaces the `import()` call in the compiled output with runtime logic that, when invoked, injects a `<script>` tag / performs a `fetch` for that chunk file and resolves a Promise once it's loaded and evaluated.
3. **At runtime**, `React.lazy()` takes that function (which returns a Promise resolving to `{ default: Component }`), and returns a special component. When React tries to render it and the Promise hasn't resolved yet, it **throws the Promise** — this is the mechanism that triggers the nearest wrapping `<Suspense>` boundary to show its fallback.
4. Once the Promise resolves (chunk downloaded + evaluated), React re-renders with the actual component in place of the fallback.
5. Caching: once a chunk is fetched, the browser caches it (esp. with content-hashed filenames), so subsequent renders of that lazy component don't refetch.

**Code/Example**
```jsx
import React, { Suspense } from 'react';

const SettingsPage = React.lazy(() => import('./SettingsPage'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <SettingsPage />
    </Suspense>
  );
}
```

**Interview-Ready Summary**
"`React.lazy` takes a function returning a dynamic `import()` call. The bundler recognizes that `import()` as a split point at build time and generates a separate chunk for that module. At runtime, when React tries to render the lazy component before its chunk has loaded, it effectively throws the pending Promise, which the nearest Suspense boundary catches to show a fallback UI. Once the chunk finishes downloading and the Promise resolves, React swaps in the real component. So `React.lazy` is really just a thin, React-idiomatic wrapper around bundler-level code splitting plus Suspense-based coordination."

**Likely Follow-Ups**
- "What does `React.lazy` expect the module to export?" → A default export — `import('./X')` resolving to `{ default: Component }`.
- "What happens if the network request fails?" → You need an Error Boundary around the Suspense boundary to catch and handle the load failure gracefully.

---

### 4.3 What is Suspense and why is it required?

**Plain-English Answer**
`<Suspense>` is a component that lets you declaratively show a fallback UI (like a spinner) while some child component isn't ready yet — it's required with `React.lazy` because that's the mechanism React uses to know "this isn't ready, render the fallback instead."

**Deep Dive**
- **The problem it solves**: Async operations (fetching a component's code, or in newer patterns, fetching data) don't fit React's normal synchronous render model. Without a standardized mechanism, every async boundary would need manual `isLoading` state management scattered everywhere.
- **The mechanism**: When a component "suspends" (its render throws a special Promise instead of throwing an error), React catches that thrown Promise and looks up the render tree for the **nearest parent `<Suspense>` boundary**. It then renders that boundary's `fallback` prop instead, and re-attempts rendering the real subtree once the thrown Promise resolves.
- **Why it's *required*, not optional, with `React.lazy`**: `React.lazy` components literally throw a Promise when their code isn't loaded yet — if there's no `<Suspense>` ancestor to catch that throw, React has nothing to render, and you'll get a runtime error/crash. Suspense is the contract that makes lazy-loaded components render-safe.
- **Placement matters**: A single `<Suspense>` can wrap multiple lazy components (they'll share one fallback shown until *all* are ready), or you can nest multiple `<Suspense>` boundaries for more granular loading states across different parts of the UI.
- **Beyond React.lazy**: Modern React (with frameworks like Next.js/Remix, or React 18+ features) extends Suspense to **data fetching**, not just code loading — the same fallback-while-pending mechanism applies to async data-fetching components that are Suspense-compatible.

**Code/Example**
```jsx
<Suspense fallback={<Spinner />}>
  <LazyChart />
  <LazyTable />  {/* Both share the same fallback until BOTH are ready */}
</Suspense>
```

**Interview-Ready Summary**
"Suspense is a declarative way to show a fallback UI while a part of the tree isn't ready to render yet. It works because a suspending component throws a Promise instead of a value, and React catches that throw, walks up to the nearest Suspense boundary, and renders its fallback until the Promise resolves. It's required for `React.lazy` specifically because that's exactly the mechanism lazy components use to signal 'my code chunk hasn't loaded yet' — without a Suspense ancestor to catch that, React has no valid UI to render and the app crashes. It also generalizes beyond code-splitting to async data fetching in newer React patterns."

**Likely Follow-Ups**
- "What happens with multiple lazy components under one Suspense?" → They share the fallback as a group — fallback stays until *all* have resolved, not one-by-one (unless you use separate Suspense boundaries per component).
- "How is this different from an Error Boundary?" → Suspense catches thrown *Promises* (pending state); Error Boundaries catch thrown *Errors* (failure state) — they're complementary and often used together.

---

## 5. Accessibility

### 5.1 What does accessibility mean in web applications?

**Plain-English Answer**
Accessibility (a11y) means building interfaces that people with disabilities — visual, auditory, motor, cognitive — can perceive, understand, navigate, and interact with, usually with the help of assistive technology.

**Deep Dive**
- Core principle: **inclusive design** — the app should work for the widest possible range of people and input methods, not just mouse+sighted users.
- Common assistive technologies and needs:
  - **Screen readers** (VoiceOver, NVDA, JAWS) — read out page content/structure; require semantic markup and text alternatives to make sense of the UI.
  - **Keyboard-only navigation** — users who can't use a mouse (motor impairments, or simply power users) must be able to reach and operate every interactive element via `Tab`, `Enter`, `Space`, arrow keys, `Esc`.
  - **Screen magnification / zoom** — layouts must not break or clip content at high zoom levels.
  - **Color-blindness / low vision** — sufficient color contrast, not relying on color alone to convey meaning (e.g., "red = error" needs an icon/text too).
- Standard reference: **WCAG (Web Content Accessibility Guidelines)** — organized around 4 principles, often remembered as **POUR**: **P**erceivable, **O**perable, **U**nderstandable, **R**obust.
- It's not just ethical/legal (many regions legally require it, e.g., ADA in the US, EN 301 549 in the EU) — it also improves usability for *everyone* (e.g., captions help in noisy environments, good contrast helps in bright sunlight).

**Interview-Ready Summary**
"Accessibility means designing and building the app so people with disabilities — visual, motor, auditory, cognitive — can actually use it, typically via assistive tech like screen readers or keyboard-only navigation. The industry standard is WCAG, often summarized as POUR: content should be Perceivable, Operable, Understandable, and Robust. Practically, that means things like semantic HTML for screen readers, full keyboard operability, sufficient color contrast, and not relying on color alone to convey meaning."

**Likely Follow-Ups**
- "What's WCAG conformance level — A, AA, AAA?" → AA is the common legal/industry target; AAA is stricter and often impractical for full sites.
- "How do you test accessibility?" → Keyboard-only navigation test, screen reader spot-check, automated tools (axe, Lighthouse), and contrast checkers.

---

### 5.2 Common accessibility mistakes in React apps?

**Plain-English Answer**
The most common pattern is reaching for generic `<div>`/`<span>` elements with click handlers instead of semantic, natively-accessible HTML elements — which silently strips out keyboard support, screen reader semantics, and focus behavior that native elements give you for free.

**Deep Dive**
1. **"Div buttons"** — `<div onClick={...}>Submit</div>` instead of `<button onClick={...}>Submit</button>`.
   - A native `<button>` is automatically keyboard-focusable, triggers on both `Enter` and `Space`, and is announced as "button" by screen readers.
   - A `<div>` gets none of that for free — it's invisible to keyboard nav and screen readers just read it as plain text unless you manually reconstruct all that behavior with `tabIndex`, `role="button"`, and `onKeyDown` handlers. It's extra work to get *worse* accessibility than a native element gives for free.
2. **Missing form labels** — an `<input>` with only a placeholder and no associated `<label>`. Placeholder text disappears once typing starts and isn't reliably announced by all screen readers as a persistent label.
   ```jsx
   // ❌ 
   <input placeholder="Email" />
   // ✅
   <label htmlFor="email">Email</label>
   <input id="email" />
   ```
3. **Non-semantic HTML structure** — using `<div>` soup instead of `<nav>`, `<main>`, `<header>`, `<h1>`–`<h6>` in proper order. Screen reader users often navigate by heading/landmark structure to jump around the page; flat divs give them nothing to navigate by.
4. **Missing focus management on route changes / modals** — in an SPA, since there's no full page reload, focus doesn't naturally move anywhere on navigation; screen reader users can be left disoriented unless focus is explicitly moved (e.g., to the new page's heading, or into an opened modal).
5. **Images without meaningful `alt` text** (or decorative images *with* unnecessary alt text cluttering the screen reader experience).
6. **Custom dropdowns/modals built without keyboard trap/escape handling** — mouse-only interaction patterns that can't be closed or navigated via keyboard.

**Interview-Ready Summary**
"The most common one I see is building interactive elements out of `<div>`s with click handlers instead of native elements like `<button>` — that silently loses keyboard focusability, Enter/Space activation, and screen reader semantics that come free with the real element. Other frequent issues: missing form labels relying on placeholder text alone, non-semantic markup that gives screen reader users nothing to navigate by, and SPAs not managing focus on route changes or modal open/close, which leaves screen reader users disoriented since there's no full page reload to naturally reset focus."

**Likely Follow-Ups**
- "How would you fix a custom dropdown component for accessibility?" → Proper `role`, `aria-expanded`, keyboard arrow-key navigation, `Esc` to close, focus trap while open, focus return to trigger on close.
- "What tool would catch these automatically?" → `eslint-plugin-jsx-a11y` catches many of these at lint time; axe DevTools / Lighthouse catch them at runtime.

---

### 5.3 What are ARIA attributes and when should they be used?

**Plain-English Answer**
ARIA (Accessible Rich Internet Applications) attributes are extra HTML attributes that describe roles, states, and properties to assistive technology — but they should only be used to fill gaps when native HTML elements genuinely can't express what you need.

**Deep Dive**
- The **first rule of ARIA**: *don't use ARIA if a native HTML element/attribute already does the job.* A `<button>` doesn't need `role="button"`; a `<nav>` doesn't need `role="navigation"`. Native elements already carry correct semantics, keyboard behavior, and focus handling for free — adding redundant/conflicting ARIA can actually make things worse.
- ARIA is appropriate when you're building something **custom** that HTML has no native equivalent for — e.g., a tab panel, a combobox/autocomplete, a tree view, a live-updating notification area.
- Three categories:
  - **Roles** (`role="dialog"`, `role="tablist"`) — tell assistive tech *what kind of widget* this is when the HTML element itself doesn't convey it.
  - **States** (`aria-expanded`, `aria-checked`, `aria-disabled`) — dynamic conditions that change (e.g., is this accordion section open right now).
  - **Properties** (`aria-label`, `aria-labelledby`, `aria-describedby`) — supply an accessible name/description when there's no visible text to use, or when a visible label isn't sufficiently descriptive alone.
- **`aria-live` regions** — mark a region so screen readers announce content that changes dynamically without a focus shift (e.g., a toast notification, a form validation error appearing after submit) — essential in React apps since content updates happen without page reloads and would otherwise go completely unannounced.
- Important caveat: ARIA changes what's *announced*, not what's *visible or behaviorally functional* — e.g., `aria-expanded="true"` doesn't make a menu actually expand; you still need the real JS/CSS behavior, ARIA just describes the state to assistive tech.

**Code/Example**
```jsx
// Custom tab component — no native <tab> element exists, so ARIA fills the gap
<div role="tablist">
  <button role="tab" aria-selected={activeTab === 0} aria-controls="panel-0">
    Overview
  </button>
</div>
<div id="panel-0" role="tabpanel" hidden={activeTab !== 0}>
  ...
</div>

// Live region for dynamic content (e.g. a form error appearing after submit)
<div aria-live="polite">{errorMessage}</div>
```

**Interview-Ready Summary**
"ARIA attributes describe roles, states, and properties to assistive tech for cases HTML can't natively express — things like custom tab panels, comboboxes, or live-updating regions. The core rule is: use native HTML semantics first, and only reach for ARIA to fill a genuine gap — adding `role="button"` to an actual `<button>` is redundant at best and can conflict at worst. In React apps specifically, `aria-live` regions matter a lot because content updates happen without a page reload, so without explicitly marking a region as live, screen reader users won't be notified when, say, a form validation error or a toast appears."

**Likely Follow-Ups**
- "What's the difference between `aria-label` and `aria-labelledby`?" → `aria-label` provides the accessible name directly as a string; `aria-labelledby` references the `id` of another element whose text content becomes the accessible name.
- "Can ARIA make a `<div>` fully behave like a button?" → It can convey the *semantics* (`role="button"`, focus via `tabIndex="0"`) but you still must manually wire up `onKeyDown` for Enter/Space — ARIA doesn't grant native keyboard behavior automatically.

---

## 6. Web Vitals

### 6.1 What are Core Web Vitals and why are they important?

**Plain-English Answer**
Core Web Vitals are a specific set of standardized metrics Google defines to measure real-world user experience quality — loading speed, visual stability, and interactivity — and they factor into search ranking and give teams an objective way to measure "does this feel fast and stable to actual users."

**Deep Dive**
- Three current Core Web Vitals: **LCP** (loading), **CLS** (visual stability), **INP** (interactivity — replaced FID as of March 2024).
- Why they matter beyond "good practice":
  - **SEO impact** — Google uses Core Web Vitals as a ranking signal; poor scores can hurt search visibility.
  - **Real User Monitoring (RUM)** — unlike synthetic lab tests, Web Vitals are measured from *actual users'* devices/networks (via the Chrome UX Report / `web-vitals` JS library), so they reflect real-world experience across varied hardware and connection speeds, not just a fast dev machine.
  - **Business impact** — well-documented correlation between poor Web Vitals and higher bounce rates/lower conversion; they're a proxy for "does this feel broken/slow."
- They give engineering teams a **shared, measurable vocabulary** for performance instead of vague statements like "the site feels slow."

**Interview-Ready Summary**
"Core Web Vitals are Google's standardized set of metrics for real-world UX quality: LCP for loading speed, CLS for visual stability, and INP for interactivity. They matter because they're measured from actual users' devices via real user monitoring rather than synthetic lab tests, they're a Google search ranking signal, and they give teams an objective, shared way to talk about performance instead of subjective 'it feels slow' complaints."

**Likely Follow-Ups**
- "How do you measure these in production?" → `web-vitals` npm library reporting to analytics, Chrome UX Report (CrUX), Google Search Console.
- "What replaced FID and why?" → INP replaced FID in March 2024 because FID only measured the delay of the *first* interaction, while INP measures responsiveness across *all* interactions throughout the page's lifecycle — a more complete picture.

---

### 6.2 Explain LCP, CLS, and FID/INP with examples

**Plain-English Answer**
LCP measures how long the biggest visible content element takes to render; CLS measures how much visible content unexpectedly shifts around; INP (successor to FID) measures how responsive the page is to user interactions throughout its lifetime.

**Deep Dive**

**LCP — Largest Contentful Paint**
- Measures the render time of the largest visible element in the viewport (usually a hero image, a large heading, or a large block of text) — this is used as a proxy for "when does the main content feel loaded."
- **Good**: ≤ 2.5s. **Poor**: > 4.0s.
- Example: An e-commerce product page where the large product photo is the LCP element — if it's lazy-loaded from a slow CDN or blocked behind render-blocking JS/CSS, LCP suffers.
- Common causes of poor LCP: slow server response time, render-blocking CSS/JS, unoptimized/un-preloaded images, client-side rendering that delays content until JS executes.

**CLS — Cumulative Layout Shift**
- Measures unexpected movement of visible elements — e.g., content jumping down because an image above it just finished loading and had no reserved space, or an ad/banner injecting itself and pushing everything else down.
- Calculated as a score (not a time) based on how much of the viewport shifted and how far.
- **Good**: ≤ 0.1. **Poor**: > 0.25.
- Example: You've started reading an article, and just as you're about to tap a link, an ad loads above it and shifts the whole page down — you end up tapping the wrong thing. That's exactly the frustrating UX CLS quantifies.
- Common causes: images/embeds/ads without explicit width/height (so the browser can't reserve space before load), web fonts causing a layout-affecting swap (FOIT/FOUT), content injected dynamically above existing content.

**FID (legacy) / INP (current) — Interactivity**
- **FID (First Input Delay)** — measured only the delay between a user's *first* interaction (click/tap/keypress) and the browser actually being able to start processing it. Limited: only captured the first interaction, and only measured *input delay*, not the full processing+rendering time.
- **INP (Interaction to Next Paint)** — the current standard; measures the latency of *all* interactions throughout the page's lifetime (not just the first), from input to the next visual update on screen, and reports a representative "worst-ish" value.
- **Good INP**: ≤ 200ms. **Poor**: > 500ms.
- Example: A user clicks "Add to Cart" but the main thread is busy running a large synchronous script (e.g., unoptimized state updates re-rendering a huge list), so the button doesn't visually respond for 800ms — that delay is exactly what INP captures.
- Common causes: long JavaScript tasks blocking the main thread, excessive re-renders, large synchronous computations on interaction.

**Interview-Ready Summary**
"LCP measures how long the largest visible content element takes to render — a proxy for perceived load speed, good is under 2.5 seconds. CLS measures unexpected visual movement, like content jumping because an image loaded without reserved space — good is a score under 0.1. INP, which replaced FID, measures how responsive the page is to user interactions across the *entire* session, from input to the next visual update, not just the very first click — good is under 200ms. Each maps to a distinct failure mode: LCP is about slow loading, CLS is about jarring layout instability, and INP is about a sluggish, unresponsive-feeling UI."

**Likely Follow-Ups**
- "How would you fix bad CLS on an image-heavy page?" → Explicit `width`/`height` (or `aspect-ratio`) on images so the browser reserves space before the image loads.
- "How would you debug a poor INP score?" → Chrome DevTools Performance panel/Profiler to find long main-thread tasks; look for expensive synchronous work triggered on interaction.

---

### 6.3 How can React apps improve Web Vitals?

**Plain-English Answer**
By reducing what has to load/run before first paint (lazy loading, code splitting), reducing unnecessary re-renders (memoization), handling images/fonts carefully to avoid layout shift, and keeping the main thread free for fast interaction response.

**Deep Dive — mapped to each metric**

**Improving LCP:**
- **Route/component-level lazy loading & code splitting** (Sections 2.4, 4) — shrinks the initial bundle so the browser can parse/execute less JS before the main content can render.
- **Image optimization** — modern formats (WebP/AVIF), responsive `srcset`, and using `<link rel="preload">` for the actual LCP image (e.g., the hero image) so the browser fetches it earlier instead of discovering it late.
- **Server-side rendering (SSR) or static generation** — if the LCP element depends on client-side JS execution + data fetching before it can render, SSR can deliver the already-rendered HTML immediately, dramatically cutting LCP.
- Avoiding render-blocking resources (unoptimized synchronous scripts/CSS) in the critical rendering path.

**Improving CLS:**
- Always specifying explicit dimensions (`width`/`height`/`aspect-ratio`) for images, video embeds, and ad slots so React reserves the layout space *before* content loads in.
- **Stable layouts** for dynamically loaded content — e.g., skeleton loaders/placeholders matching the eventual content's size, instead of content popping in and pushing everything down.
- Being careful with `React.lazy`/Suspense fallbacks — a fallback spinner that's a different size than the loaded content causes a shift; sizing the fallback to match helps.
- Careful font-loading strategy (`font-display: optional/swap` tuned deliberately) to avoid layout-shifting font swaps.

**Improving INP:**
- **Memoization** (`React.memo`, `useMemo`, `useCallback`) to avoid unnecessary re-renders of expensive components on every interaction/state update.
- Avoiding large synchronous work on the main thread during interactions — breaking up expensive computations, or moving them off the main thread (e.g., Web Workers) where feasible.
- Virtualizing long lists (e.g., `react-window`) so React isn't reconciling/rendering thousands of DOM nodes on every update.
- Using React 18's concurrent features (`useTransition`, `startTransition`) to mark non-urgent state updates as interruptible, keeping urgent interactions (typing, clicking) responsive even while a larger update is processing.

**Interview-Ready Summary**
"For LCP, the main levers are shrinking the initial bundle through code splitting and lazy loading, optimizing and preloading the actual LCP image, and considering SSR if the hero content otherwise depends on client-side rendering to appear. For CLS, it's about giving images/embeds explicit dimensions so space is reserved before load, and using appropriately-sized skeleton loaders instead of letting content pop in and shift the layout. For INP, it's memoization to avoid unnecessary re-renders, virtualizing long lists, avoiding long synchronous main-thread work during interactions, and in React 18+, using `useTransition` to keep urgent interactions responsive while less urgent updates process in the background."

**Likely Follow-Ups**
- "How does SSR affect INP?" → SSR helps LCP more than INP; INP is about post-load interaction responsiveness, so it's more affected by JS execution cost, not initial render strategy — SSR can even add hydration overhead that temporarily hurts INP right after load.
- "What's the risk of over-memoizing with `useMemo`/`useCallback`?" → Memoization itself has a cost (comparison + memory); overusing it on cheap computations can add overhead without benefit — profile before optimizing.

---

## 7. Quick-Fire Cheat Sheet

Use this as a last-minute scan before the interview — one line per answer.

| Question | One-Line Answer |
|---|---|
| What is tree shaking? | Build-time dead code elimination via static ES module analysis |
| Why doesn't CJS tree shake? | `require()`/`module.exports` are resolved at runtime, not statically |
| What breaks tree shaking? | Barrel files, module-level side effects, whole-library imports, big default exports |
| What is a bundler? | Resolves module graph + transforms/optimizes into browser-ready output |
| Vite vs Webpack dev mode? | Vite serves native ESM on-demand (instant cold start); Webpack bundles everything upfront |
| Dev vs prod build? | Dev = unminified + warnings + HMR; Prod = minified + tree-shaken + hashed + dev code stripped |
| What is code splitting? | Dynamic `import()` creates separate chunks loaded on demand |
| Client-side routing? | Intercepts nav, uses History API `pushState`, re-renders matching component, no reload |
| BrowserRouter vs HashRouter? | Clean URL + needs server rewrite rules vs `#` fragment + zero server config |
| Route matching in v6+? | Specificity-ranked matching, not declaration order; nested routes via `<Outlet />` |
| What is lazy loading? | Defer downloading component code until it's rendered |
| React.lazy() mechanism? | Wraps dynamic `import()` → bundler creates chunk → throws Promise until resolved |
| Why is Suspense required? | Catches the thrown Promise from a suspending component, shows fallback until resolved |
| What is accessibility? | Inclusive design so assistive tech users can perceive/operate/understand the app (POUR) |
| Common a11y mistakes? | Div-as-button, missing labels, non-semantic HTML, no focus management on nav/modals |
| What is ARIA, when to use? | Roles/states/props for assistive tech; only when native HTML can't express it |
| Core Web Vitals? | LCP (load), CLS (stability), INP (interactivity) — real-user UX + SEO signal |
| LCP/CLS/INP good thresholds? | LCP ≤2.5s, CLS ≤0.1, INP ≤200ms |
| Improve Web Vitals in React? | Code split + optimize images (LCP), reserve layout space (CLS), memoize + avoid long tasks (INP) |

---

### How to Use This Guide
1. **First pass**: Read every deep dive top to bottom — don't skip to summaries yet. Understanding *why* beats memorizing *what*.
2. **Second pass**: Cover the answer, read only the question, try to reconstruct the deep dive from memory, then check yourself.
3. **Day-before-interview**: Rehearse only the "Interview-Ready Summary" boxes out loud, timing yourself to ~30 seconds each.
4. **Morning-of**: Skim the Quick-Fire Cheat Sheet only.
