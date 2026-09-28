# Principal Engineer's Frontend Architecture & Interview Guide

## Table of Contents

- [1. Project & Architecture](#1-project--architecture)
- [2. HTML & Accessibility (a11y)](#2-html--accessibility-a11y)
- [3. JavaScript & React](#3-javascript--react)
- [4. Performance](#4-performance)
- [5. Browser & Testing](#5-browser--testing)
- [6. Live Coding Algorithms](#6-live-coding-algorithms)

---

## 1. Project & Architecture

### Can you tell me about your current project and responsibilities?

From a Principal Lens: I don't just want to hear what you built; I want to hear why and how. A strong answer uses the STAR method (Situation, Task, Action, Result) but pivots quickly into architectural trade-offs, team enablement, and business impact.

#### Ideal Response Structure

- Scale: Traffic volume, dataset size, or developer count.
- Architecture: Monolith vs. Micro-frontends, Monorepo (Nx/Turborepo), SSR vs. CSR.
- Impact: "I reduced bundle size by 40%, resulting in a 20% increase in conversions."

### How do you structure a new React/Next.js project?

Do not organize by type (for example, `/components`, `/hooks`, `/utils`). In large-scale production, this becomes unmaintainable.

#### The Feature-Based / Domain-Driven Approach

```text
src/
├── features/
│   ├── authentication/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── index.ts        // Public API for this feature
│   └── checkout/
├── shared/                  // True global reusable components like buttons, layouts
└── pages/ or app/          // Routing layer only, imports from features
```

Principal Insight: The `index.ts` barrel file inside a feature folder enforces encapsulation. Other features can only import what is exposed, preventing tangled dependency graphs.

### How do you manage API calls and state management?

In modern React, state is categorized into server state and client state. Mixing them is an anti-pattern.

- Server State: React Query, RTK Query, SWR
  - Handles caching, background fetching, deduplication, and polling.
  - This eliminates a large share of legacy Redux boilerplate.
- Client State: Zustand, Redux Toolkit, Context API
  - Ephemeral UI state such as modals, dark mode, and multi-step form data.

### Explain the Redux data flow

Redux enforces a strict unidirectional data flow:

1. Action: An event occurs in the UI.
2. Store / Middleware: The action passes through middleware (for example, Redux Thunk or Saga) for side effects like API calls.
3. Reducer: A pure function takes the previous state and action, and returns a new state object. Immutability is mandatory.
4. UI: React components subscribed via `useSelector` receive the new state and re-render.

Must-Know: For system design, highlight that immutability guarantees predictable state tracking (time-travel debugging) and allows React to use cheap reference equality checks (`===`) to determine whether a re-render is needed.

#### Review Checklist: Project & Architecture

- [ ] Did I distinguish between server and client state?
- [ ] Can I articulate the pros and cons of feature-based vs. type-based directories?
- [ ] Do I understand why immutability is required in Redux?

#### Interview Question (Hard)

You are migrating a massive legacy React SPA to Next.js (App Router). How do you handle a Redux store that heavily relies on `window` object properties during initialization?

---

## 2. HTML & Accessibility (a11y)

### What is the importance of semantic HTML?

Semantic HTML (for example, `<nav>`, `<article>`, `<main>`, `<dialog>`) provides inherent meaning to the browser.

#### Real-World Impact

- Screen Readers: They rely on the accessibility tree, which is built from semantic tags.
- SEO: Search engine crawlers weigh content inside `<main>` or `<h1>` more heavily than generic `<div>` elements.
- Maintainability: Easier for developers to read than “div soup”.

### How do you test keyboard navigation and accessibility?

- Manual: Unplug the mouse. Use `Tab`, `Shift+Tab`, `Enter`, `Space`, and arrow keys.
- Ensure a visible focus ring exists for every interactive element.
- Automated: Integrate `axe-core` in CI/CD, use Lighthouse in Chrome, and add `eslint-plugin-jsx-a11y`.

### If you assign `role="button"` to a non-button element, how does it behave?

Edge Case Alert: It only changes how the screen reader announces the element (“Button”). It does not add button behavior.

A `<div>` with `role="button"` is not focusable by default, and it will not respond to `Enter` or `Space` keys automatically.

### Why is a native `<button>` preferred over `role="button"`?

A native `<button>` gives you accessibility for free:

- Implicitly focusable (it has `tabindex="0"` natively)
- Automatically binds `Enter` and `Space` to the click event
- Supports native attributes such as `disabled`, which automatically removes it from the tab order

### How do you manage focus after user interactions?

Principal Insight: Focus trapping and restoration are critical for modals and drawers.

- When a modal opens, focus must move into the modal, usually to the first input or the close button.
- Focus must be trapped inside the modal while tabbing.
- When the modal closes, focus must return to the element that triggered it.

Must-Know: Always use a visually hidden `<h1>` on pages or route changes in SPAs and move focus to it so screen readers announce the new view.

#### Review Checklist: HTML & Accessibility

- [ ] Do I know the difference between visual focus and screen reader focus?
- [ ] Can I explain why `<div onClick={...}>` is an accessibility violation?
- [ ] Have I mastered focus trapping in custom overlays?

#### Interview Question (Medium)

Implement a custom accessible dropdown component. How do you handle the `Escape` key, `ArrowDown` / `ArrowUp` keys, and focus management?

---

## 3. JavaScript & React

### What is the difference between `||` and `??`?

- `||` returns the right-hand side if the left side is falsy (`false`, `0`, `""`, `null`, `undefined`, `NaN`).
- `??` returns the right-hand side only if the left-hand side is `null` or `undefined`.

React Edge Case:

```jsx
<div>{count || "No items"}</div>
```

If `count` is `0`, it renders `"No items"`. Use `??` to correctly render `0`.

### Explain controlled vs. uncontrolled components

- Controlled: The component's state is driven entirely by React state, such as `value={state}` and `onChange={setState}`.
- Uncontrolled: The DOM maintains the state, and you use a ref to pull the value only when needed.

Architectural Reasoning:

- Use controlled inputs for immediate validation or formatting (for example, credit card masking).
- Use uncontrolled inputs via libraries like `react-hook-form` for massive forms to prevent thousands of unnecessary re-renders.

### How do you optimize unnecessary React re-renders?

- Colocate State: Move state as far down the component tree as possible.
- Component Composition: Pass expensive components as children to components that hold rapidly changing state.
- Memoization: `React.memo()`, `useMemo()`, and `useCallback()` can help.

Principal Insight: Do not blindly use `useMemo()` everywhere. The memory overhead and garbage collection can cost more than the re-render itself. Profile first using the React Profiler.

### Context API vs. Redux Toolkit

- Context API: Great for dependency injection and low-frequency updates such as theme or auth state.
- Warning: Updating a Context value re-renders every component consuming that context, which can cause performance bottlenecks for high-frequency updates.
- Redux Toolkit: Built for high-frequency, complex state mutations. Subscribed components only re-render if the specific slice of state they select changes.

Must-Know: Context is not a state management tool; it is a prop-drilling avoidance tool. It must be paired with `useState` or `useReducer` to manage state.

#### Review Checklist: JavaScript & React

- [ ] Can I explain referential equality and how it triggers re-renders?
- [ ] Do I know when not to use `useMemo`?
- [ ] Can I build a large form without lagging the main thread?

#### Interview Question (Hard)

You have a React component that renders a map and a sidebar. The sidebar updates a global context on every mouse move on the map. The entire app lags. How do you re-architect this without adding external libraries?

---

## 4. Performance

### How would you optimize a large table? What is virtualization? How does `react-window` help?

Rendering 10,000 DOM nodes can overwhelm the browser's rendering engine.

Virtualization is the technique of rendering only the items currently visible in the viewport, plus a small buffer.

`react-window` handles this by calculating the total height of the scroll container (total items × row height) and absolutely positioning the visible DOM nodes based on the current scroll offset. As you scroll, it recycles the DOM nodes, updating their content and position instead of creating new ones.

### How would you improve a page that takes 8 seconds to render?

A Principal Engineer approaches this systematically:

- Network / Server (TTFB): Is the API slow? Add caching, CDN support, or move to SSR/SSG.
- JavaScript Bundle Size: Is the app shipping 5MB of JS? Analyze with Webpack Bundle Analyzer. Tree-shake unused code and remove heavy libraries.
- Critical Rendering Path: Inline critical CSS and defer non-essential scripts.
- Assets: Compress images using WebP or AVIF, lazy load below-the-fold images, and set `fetchpriority="high"` on the LCP image.

### How do code splitting and lazy loading improve performance?

Instead of shipping one massive `main.js` bundle, we split the code into smaller chunks.

- Route-Based: When the user visits `/login`, they only download JavaScript for that page, not for the `/dashboard` page.
- Component-Based: A heavy 3D chart component is only fetched when the user clicks a tab that requires it.

This drastically reduces initial parsing and execution time on the main thread.

### Which Web Vitals do you monitor?

- LCP (Largest Contentful Paint): Measures loading performance. Target: under 2.5s.
- CLS (Cumulative Layout Shift): Measures visual stability. Prevented by setting explicit width and height on images. Target: under 0.1.
- INP (Interaction to Next Paint): Replaced FID. Measures responsiveness by tracking interaction latency. Target: under 200ms.

Must-Know: Always test performance on a throttled network (Fast 3G) and CPU (4x slowdown) to simulate real-world mobile devices.

#### Review Checklist: Performance

- [ ] Do I understand the mechanics behind DOM virtualization?
- [ ] Can I define LCP, CLS, and INP with exact metrics?
- [ ] Do I know how to use the Chrome DevTools Performance tab?

#### Interview Question (Medium)

An image carousel at the top of your page is causing a massive CLS violation because the images take time to load. How do you fix this using pure CSS and HTML?

---

## 5. Browser & Testing

### Do you test your UI across different browsers? How do you handle browser-specific rendering issues?

Yes. Modern development relies on standard baselines (for example, target browsers with >0.2% market share).

#### Handling Issues

- CSS: Use Autoprefixer in the build step to inject `-webkit-` and `-moz-` prefixes. Use PostCSS preset-env for future CSS specs.
- JS: Use Babel or SWC to transpile modern JS into syntax compatible with target browsers.
- Feature Detection: Never use `navigator.userAgent` sniffing. Always use feature detection such as `if ('IntersectionObserver' in window)`. If missing, dynamically import a polyfill.

### What tools do you use for accessibility and performance testing?

- Unit / Integration: Jest and React Testing Library
- E2E: Playwright or Cypress for real browser testing
- Performance: Lighthouse CI in GitHub Actions
- Accessibility: Storybook with `addon-a11y`, `axe-core` in E2E tests

Principal Insight: Coverage metrics such as 80% coverage are often vanity metrics. Focus on critical user journeys like login and checkout instead of chasing 100% line coverage on trivial UI components.

#### Review Checklist: Browser & Testing

- [ ] Do I understand feature detection vs. user-agent sniffing?
- [ ] Can I articulate why Testing Library queries by role instead of class names?
- [ ] Have I integrated performance budgets into a CI pipeline?

#### Interview Question (Hard)

A user reports a bug that only happens on Safari on iOS 15. The issue does not reproduce on macOS Safari. Walk me through your exact debugging process.

---

## 6. Live Coding Algorithms

### 1. Given an array of users, display active users above 18

```javascript
const users = [
  { name: "Alice", age: 22, active: true },
  { name: "Bob", age: 17, active: true },
  { name: "Charlie", age: 30, active: false },
];

// Principal note: Keep it functional and chained.
const activeAdults = users.filter((user) => user.age > 18 && user.active);

// React implementation
const UserList = ({ users }) => (
  <ul>
    {users
      .filter((user) => user.age > 18 && user.active)
      .map((user) => (
        <li key={user.name}>{user.name}</li>
      ))}
  </ul>
);

// Edge case check: Ensure 'key' is unique. Using 'name' is risky in production; use an ID.
```

### 2. Populate two select boxes using an array and an object

```javascript
const countries = ["USA", "India"];
const citiesMap = { USA: ["NY", "LA"], India: ["Pune", "Delhi"] };

// In React:
const LocationSelector = () => {
  const [country, setCountry] = useState(countries[0]);
  const cities = citiesMap[country] || []; // Fallback prevents crashes

  return (
    <>
      <select value={country} onChange={(e) => setCountry(e.target.value)}>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </>
  );
};
```

### 3. Implement a debounce function

Must-Know: A debounce ensures a function is only executed after a certain amount of time has passed since the last time it was invoked. This is essential for search bars.

```javascript
function debounce(func, delay) {
  let timerId;

  return function (...args) {
    // Clear the existing timer if the user types again
    clearTimeout(timerId);

    // Set a new timer
    timerId = setTimeout(() => {
      func.apply(this, args); // Preserve context and arguments
    }, delay);
  };
}
```

React edge case: If you use debounce directly inside a component body, it gets recreated on every render. You must wrap it in `useCallback` or use a custom hook.

### 4. Find duplicate elements in an array

```javascript
const arr = [1, 2, 3, 2, 4, 5, 5];

// Method 1: O(N) using a Set (best performance)
const findDuplicates = (arr) => {
  const seen = new Set();
  const duplicates = new Set();

  for (const item of arr) {
    if (seen.has(item)) duplicates.add(item);
    else seen.add(item);
  }

  return Array.from(duplicates);
};

// Method 2: One-liner (O(N^2) because indexOf is O(N) inside a filter)
const duplicatesQuick = arr.filter((val, index) => arr.indexOf(val) !== index);
```

### 5. Flatten a nested array

```javascript
const nested = [1, [2, [3, 4], 5]];

// Method 1: Modern JS (best practice)
const flat1 = nested.flat(Infinity);

// Method 2: Recursive reduce (if the interviewer restricts built-in flat)
const flatten = (arr) => {
  return arr.reduce((acc, curr) => {
    return acc.concat(Array.isArray(curr) ? flatten(curr) : curr);
  }, []);
};
```

#### Review Checklist: Live Coding

- [ ] Did I account for edge cases such as null arrays and missing object keys?
- [ ] Can I explain the time complexity (Big O) of my solutions?
- [ ] Do I know how my vanilla JS functions behave inside a React rendering cycle?

#### Interview Question (Hard)

Build a generic custom hook `useDebounce(value, delay)` that handles both primitive values and complex objects without triggering infinite re-renders.

---

## Quick Summary

This guide is designed to help you speak like a strong frontend principal candidate: focus on system design, trade-offs, accessibility, performance, and real-world engineering judgment rather than memorizing isolated API facts.

The best answers are:

- Practical
- Measurable
- Business-aware
- Performance-conscious
- Accessibility-first
