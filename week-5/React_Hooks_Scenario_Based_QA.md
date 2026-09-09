# React Hooks — Scenario-Based Q&A
*(Staff/Senior Engineer mock-interview format — production judgment, debugging, and trade-offs, not just definitions)*

> Source of truth: `React_Hooks_Interview_Notes.md`. This document assumes you already know the definitions — every answer here is framed the way a staff/senior engineer would actually respond **live, under interviewer pressure**, with follow-ups, edge cases, and "what would you do in prod" reasoning.

---

## How to use this doc
Each question follows the same shape:
- **🎯 Scenario** — a realistic prompt, the way it's actually asked in interviews
- **🧠 First response (30-second answer)** — what you say in the first 30 seconds, calm and structured
- **🔧 Deep dive / code** — the actual fix, with reasoning
- **⚠️ Edge cases & follow-ups** — the traps interviewers add when they see you got the first part right
- **🏭 Production angle** — how this shows up at a real product company, and what a staff engineer additionally worries about

---

## Section A — `useMemo` in the Wild

### Q1. "We have a table rendering 10,000 rows with client-side filtering. It's janky on every keystroke. Walk me through how you'd fix it."

**🎯 Scenario:** Search box filters a large in-memory list on every `onChange`.

**🧠 First response:**
> "Before reaching for `useMemo`, I'd first check if 10,000 rows should even be in the DOM at once — that's a virtualization problem (`react-window`/`react-virtualized`), not purely a memoization problem. But assuming virtualization is already in place or out of scope, the janky filtering itself is almost certainly because the filter function re-runs on every render, not just every *search-term* change."

**🔧 Deep dive:**
```js
// ❌ Filters on every render, including renders caused by unrelated state (e.g. a modal toggling)
function ProductList({ products, searchTerm }) {
  const filtered = products.filter(p => p.name.includes(searchTerm));
  return <List items={filtered} />;
}

// ✅ Only recomputes when products or searchTerm actually change
function ProductList({ products, searchTerm }) {
  const filtered = useMemo(
    () => products.filter(p => p.name.includes(searchTerm)),
    [products, searchTerm]
  );
  return <List items={filtered} />;
}
```

**⚠️ Edge cases & follow-ups:**
- *"What if `products` is refetched from an API on an interval, and the array content is identical but it's a new reference each time?"*
  → `useMemo` will still recompute needlessly, because it compares by reference. Fix at the source: memoize/normalize the fetch result (e.g., only update state if a deep-equal check or a version/ETag says data changed), or use a data-fetching library (React Query/SWR) that already handles referential stability.
- *"What if the search term changes on every keystroke and filtering is still slow even with `useMemo`?"*
  → `useMemo` didn't solve the *root* problem — the filter itself is O(n) on 10k items every keystroke. Combine with **debouncing** the search term (so filtering runs after typing pauses, not on every keystroke) and/or virtualization.
- *"Would you memoize the `<List items={filtered} />` too?"*
  → Only if `List` is expensive to render *and* wrapped in `React.memo` — otherwise it's dead weight.

**🏭 Production angle:**
> "In a real PR review, I'd push back on adding `useMemo` here as step one. I'd ask: did we actually profile this in the React DevTools Profiler and see `ProductList` re-rendering excessively, or are we guessing? Premature memoization is a code smell — I want a flamegraph or a `why-did-you-render` log before I add complexity."

---

### Q2. "A teammate added `useMemo` around a simple object like `{ id: user.id, name: user.name }`. Code review — approve or request changes?"

**🧠 First response:**
> "Request changes, with an explanation, not just a rejection."

**🔧 Deep dive:**
```js
// ❌ Overkill — the computation itself is trivial (two property reads)
const userSummary = useMemo(() => ({ id: user.id, name: user.name }), [user.id, user.name]);

// ✅ Just compute it inline — cheaper than the memoization bookkeeping itself
const userSummary = { id: user.id, name: user.name };
```
> "The comparison React does (checking `user.id`/`user.name` didn't change) costs roughly the same as just recomputing the object. The *only* reason to memoize this would be if `userSummary` is passed as a prop to a `React.memo`-wrapped child, and we specifically want to avoid giving that child a new object reference on every render — even then, I'd first check if that child re-rendering is actually a measured problem."

**⚠️ Edge cases:**
- *"What if this object IS passed to a memoized child, and profiling shows that child re-rendering is expensive?"*
  → Now it's justified — but I'd comment in the PR *why*, so the next engineer doesn't cargo-cult it elsewhere without the same justification.

**🏭 Production angle:**
> "This is exactly the GenAI-assisted-coding pattern I've seen creep into codebases — Copilot/Cursor suggest `useMemo`/`useCallback` reflexively. As a reviewer, I treat every memoization hook as a claim that needs evidence: either a profiler screenshot, a bug ticket about jank, or a genuinely expensive computation. No evidence, no memo."

---

### Q3. "You inherited a component and `useMemo` is used on a dependency array with an inline object literal as a dependency, like `useMemo(fn, [{ id: 5 }])`. Is this a bug?"

**🧠 First response:**
> "Yes — that's a bug that defeats memoization entirely."

**🔧 Deep dive:**
```js
// ❌ New object literal created every render → dependency "changes" every time → memo NEVER hits
const value = useMemo(() => expensive(), [{ id: 5 }]);

// ✅ Depend on primitives extracted from the object
const value = useMemo(() => expensive(), [obj.id]);
```
> "Dependency arrays should hold **primitives** or **stable references**, never freshly-constructed literals. This is the same reference-type trap as the `items` array example from the useMemo session — except here it's baked directly into the dependency array, so it's even easier to miss in review."

**⚠️ Follow-up:** *"How would you catch this automatically, not just in manual review?"*
→ `eslint-plugin-react-hooks`'s `exhaustive-deps` rule catches missing/incorrect dependencies, but won't catch "this dependency is a fresh literal" — that needs manual review or a custom lint rule. I'd also add a quick regression test asserting the expensive function is called the expected number of times across re-renders.

---

## Section B — `useCallback` + `React.memo` Combo

### Q4. "Our data grid has 500 rows, each row a memoized component. Scrolling/selecting rows still causes ALL 500 to re-render. Debug this live."

**🧠 First response:**
> "This is the textbook 'I memoized the child but not the callback' bug. `React.memo` compares props shallowly — if any prop (including an event handler) has a new reference each render, memoization is bypassed for every single row."

**🔧 Deep dive:**
```js
// ❌ handleRowClick is a NEW function every render of the parent Grid
function Grid({ rows }) {
  const handleRowClick = (id) => setSelectedId(id);
  return rows.map(row => <Row key={row.id} data={row} onClick={handleRowClick} />);
}
const Row = React.memo(function Row({ data, onClick }) { ... });

// ✅ Stable reference across renders
function Grid({ rows }) {
  const handleRowClick = useCallback((id) => setSelectedId(id), []);
  return rows.map(row => <Row key={row.id} data={row} onClick={handleRowClick} />);
}
```

**⚠️ Edge cases & escalating pressure:**
- *"You fixed `onClick`. Rows STILL all re-render. What else could it be?"*
  → Check every other prop passed to `Row`. A very common second culprit: `data={row}` where `rows` itself is being recreated (e.g., `.map()`/`.filter()` on every parent render without memoization, or a Redux selector returning a new array reference every time). **Fix the array reference at the source, not just the callback.**
- *"What if `onClick` needs access to the *latest* `selectedId` inside it — won't `useCallback([])` give it a stale closure?"*
  → Yes — if the callback body reads `selectedId`, an empty dependency array creates a stale closure bug. Two correct fixes: (1) add `selectedId` to deps if it must read the latest value (accepting a new reference when it changes), or (2) use the **functional updater** form (`setSelectedId(prev => ...)`) to avoid needing `selectedId` as a dependency at all, or (3) pass `id` from the row itself and derive selection state via comparison, not by closing over `selectedId`.
- *"Would you use `React.memo`'s second argument (custom comparator) here instead?"*
  → Possibly, if the row's `data` prop is a large object where only specific fields matter for rendering — a custom `areEqual` function can compare just those fields instead of the whole object. But I'd only add that complexity if shallow comparison is proven insufficient.

**🏭 Production angle:**
> "In a real incident, I'd open React DevTools Profiler, record an interaction, and look at the flamegraph — which components actually re-rendered and why (`why did this render` highlighting). I wouldn't guess; I'd verify the fix reduced the render count before calling it done. I'd also check if this grid should be virtualized in the first place — 500 DOM rows is already a smell regardless of memoization."

---

### Q5. "Someone on your team says: 'Let's wrap literally every component in `React.memo` and every function in `useCallback` by default, as a coding standard.' How do you respond in a design review?"

**🧠 First response:**
> "I'd push back — respectfully, but firmly, with data."

**🔧 Reasoning:**
- `React.memo` adds a prop-comparison cost on **every** render, for **every** wrapped component — even ones that never needed to skip rendering.
- If most of your child components receive new props most of the time anyway (very common — most UI is genuinely data-driven and changes often), you're paying comparison overhead for **zero** benefit, since the memo check will almost always fail anyway and force a re-render.
- Blanket `useCallback` on functions with no memoized children creates unnecessary array allocations for the dependency list on every render — the "fix" produces more object churn than the problem it claims to solve.

**⚠️ Follow-up:** *"So when WOULD you propose a team-wide default?"*
→ Not a blanket rule, but a **checklist for PR review**: (1) Is this prop being passed to a `React.memo` child? (2) Is the child's render measurably expensive (profiled)? (3) Does the prop change less often than the parent re-renders? Only if yes to all three, add the memoization — and leave a one-line comment explaining why, so it survives refactors.

**🏭 Production angle:**
> "I've seen 'memoize everything' backfire in real codebases — bundle size goes up marginally from extra code, render performance *sometimes* gets *worse* due to comparison overhead, and worst of all, debugging becomes harder because now you have to reason about two things (the render logic AND the memoization correctness) instead of one. My rule: measure first, optimize second, and always leave a trail (comment/ticket) explaining *why* an optimization exists."

---

## Section C — `useRef` Debugging Under Pressure

### Q6. "A chat app: users report that messages arriving via WebSocket sometimes get 'lost' — the UI doesn't show the latest count of unread messages, even though the network tab shows the event arrived. Debug it."

**🧠 First response:**
> "This smells like a **stale closure** bug — a very common bug class with WebSocket/subscription callbacks that are set up once (in a `useEffect` with an empty dependency array) but need access to state that changes over time."

**🔧 Deep dive:**
```js
// ❌ BUG: the WebSocket handler closes over `unreadCount` as it was when the effect ran (e.g., 0)
function ChatWindow() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    socket.on("message", () => {
      setUnreadCount(unreadCount + 1); // always reads STALE unreadCount from closure!
    });
    return () => socket.off("message");
  }, []); // empty deps = this closure is created ONCE and never updated

  ...
}

// ✅ FIX 1 — functional state updater (best fix for THIS case; no ref needed)
useEffect(() => {
  socket.on("message", () => {
    setUnreadCount(prev => prev + 1); // always operates on latest state, no stale read
  });
  return () => socket.off("message");
}, []);

// ✅ FIX 2 — useRef, when the closure needs to read OTHER changing values too
const unreadCountRef = useRef(unreadCount);
useEffect(() => { unreadCountRef.current = unreadCount; }, [unreadCount]);
useEffect(() => {
  socket.on("message", () => {
    console.log("current unread before this message:", unreadCountRef.current);
    setUnreadCount(prev => prev + 1);
  });
  return () => socket.off("message");
}, []);
```

**⚠️ Edge cases & escalating pressure:**
- *"Why not just add `unreadCount` to the dependency array instead?"*
  → That re-subscribes to the socket (`socket.off` + `socket.on`) on every single unread-count change, which is wasteful and risks a brief window where events could be missed between unsubscribe/resubscribe. For simple counters, the **functional updater** avoids the need for the dependency entirely — always prefer that when possible.
- *"When would `useRef` be the right call over the functional updater?"*
  → When the callback needs to read **multiple**, possibly non-state values, or needs the absolute latest snapshot of several pieces of state/props at fire-time (not just "increment a counter"). Functional updaters only help for state **updates**, not for reading unrelated fresh values inside a stable closure.
- *"How would you have caught this before it hit prod?"*
  → `eslint-plugin-react-hooks`'s `exhaustive-deps` rule would have **warned** about `unreadCount` being used but missing from the dependency array — I never disable that warning without a very deliberate, commented reason.

**🏭 Production angle:**
> "This exact bug class — stale closures in long-lived subscriptions (WebSockets, `setInterval`, event emitters, IntersectionObserver callbacks) — is one of the top React bugs I've debugged in production. My mental checklist when I see a `useEffect([])` with a callback inside: does this callback reference any state/props? If yes, is it using the functional updater form, or does it need a `ref` to stay fresh?"

---

### Q7. "A form auto-saves via `setInterval` every 5 seconds. QA reports: sometimes it saves OLD data even though the user typed something more recent. Root-cause and fix."

**🧠 First response:**
> "Another stale-closure variant, this time via `setInterval` instead of a WebSocket handler — same root cause, different trigger."

**🔧 Deep dive:**
```js
// ❌ BUG
useEffect(() => {
  const interval = setInterval(() => {
    saveToServer(formData); // formData is frozen at the value when the effect first ran
  }, 5000);
  return () => clearInterval(interval);
}, []); // empty deps → formData never updates inside this closure

// ✅ FIX — keep a ref in sync with the latest formData
const formDataRef = useRef(formData);
useEffect(() => { formDataRef.current = formData; }, [formData]);

useEffect(() => {
  const interval = setInterval(() => {
    saveToServer(formDataRef.current); // always the latest
  }, 5000);
  return () => clearInterval(interval);
}, []); // interval itself is still only created once — no re-subscription churn
```

**⚠️ Edge cases & follow-ups:**
- *"Why not add `formData` to the interval effect's dependency array?"*
  → That would tear down and recreate the interval **every keystroke** (since `formData` changes on every input change), resetting the 5-second timer constantly — the user could type continuously and *never* trigger a save. The `useRef` pattern is specifically the right tool here because we want ONE stable timer, reading a value that changes independently.
- *"What about memory leaks — anything else to check?"*
  → Yes: confirm the `clearInterval` cleanup actually runs on unmount (component navigated away mid-typing) — otherwise the interval keeps firing against an unmounted component's stale ref, silently wasting a network call or, worse, causing a "can't perform a state update on an unmounted component" warning if it also calls `setState` somewhere.
- *"How would you unit test this fix?"*
  → Fake timers (`jest.useFakeTimers()`), type into the form, advance timers, assert `saveToServer` was called with the *latest* `formData`, not the initial one.

**🏭 Production angle:**
> "Auto-save-with-stale-data is a classic 'looks fine in a 2-minute demo, breaks in real usage' bug — because in a quick demo you don't type continuously for 30+ seconds. I'd add this exact scenario (continuous typing across multiple interval ticks) to our test suite so it can't regress silently."

---

### Q8. "Product wants an input field to auto-focus on mount, AND for a 'Reset' button to refocus it. How do you implement, and what breaks if you get it wrong?"

**🔧 Deep dive:**
```js
function Form() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus(); // auto-focus on mount
  }, []);

  const handleReset = () => {
    setFormValue("");
    inputRef.current?.focus(); // refocus on demand — imperative, not state-driven
  };

  return <input ref={inputRef} value={formValue} onChange={...} />;
}
```

**⚠️ Edge cases:**
- *"What if the input is conditionally rendered (e.g., inside a modal that mounts/unmounts)?"*
  → `inputRef.current` will be `null` until the modal (and input) actually mounts. Guard with optional chaining (`inputRef.current?.focus()`), and if focus needs to happen *after* the modal's mount but before paint (to avoid a flash of unfocused state), consider `useLayoutEffect` instead of `useEffect` for the focus call.
- *"What if there are multiple inputs and focus needs to move dynamically (e.g., focus the first field with a validation error)?"*
  → An array/object of refs (`useRef({})`), keyed by field name, each field registering itself; on submit-with-errors, look up the ref for the first invalid field and call `.focus()` on it.
- *"Why not use `useState` to track 'should be focused' and drive focus reactively?"*
  → Focus is **imperative** browser API territory (`element.focus()`), not something React "renders" declaratively — `useRef` + direct DOM method calls is the idiomatic pattern precisely because this isn't UI state, it's an imperative action on a DOM node.

---

## Section D — `useContext` in Production

### Q9. "Your app has a `ThemeContext` and `AuthContext`, both provided near the root. After a recent PR, typing in ANY input anywhere in the app causes the entire app to visibly lag. Diagnose."

**🧠 First response:**
> "First question I'd ask: did the PR add something to one of these top-level contexts that changes on every keystroke — even indirectly?"

**🔧 Deep dive — likely root cause:**
```js
// ❌ Someone added a "global search" value into AuthContext (wrong context to use, first mistake)
// AND passed a fresh object literal as the provider value
function AuthProvider({ children }) {
  const [user, setUser] = useState(...);
  const [searchTerm, setSearchTerm] = useState(""); // changes on every keystroke!

  return (
    <AuthContext.Provider value={{ user, setUser, searchTerm, setSearchTerm }}>
      {/* NEW object reference every render because it's an inline literal */}
      {children}
    </AuthContext.Provider>
  );
}
```
**Why this tanks the whole app:** every component that calls `useContext(AuthContext)` anywhere in the tree — even ones that only care about `user`, not `searchTerm` — re-renders on **every keystroke**, because the context value's *reference* changes every render (new object literal) and context consumers can't subscribe to just a slice of the value; they get all-or-nothing re-renders on any change to the provided value.

**✅ Fixes, in order of preference:**
```js
// Fix 1 — split contexts by change-frequency / concern (BEST fix)
// SearchContext (high-frequency) stays completely separate from AuthContext (low-frequency)

// Fix 2 — if it must stay combined, memoize the value
const value = useMemo(() => ({ user, setUser, searchTerm, setSearchTerm }), [user, searchTerm]);
// NOTE: this still re-renders ALL consumers whenever searchTerm changes — doesn't fully solve it,
// just prevents accidental re-renders from OTHER, unrelated parent re-renders.

// Fix 3 — move fast-changing local state OUT of context entirely; keep it local to the search component,
// and only lift it into context/global state if genuinely needed elsewhere.
```

**⚠️ Escalating follow-ups:**
- *"You've split the contexts. Can you prove the fix worked, live, without shipping and hoping?"*
  → React DevTools Profiler: record typing in the search box, check the render list — only the search-related tree should re-render, `AuthContext` consumers (nav bar, avatar, etc.) should show zero re-renders during that interaction.
- *"What if this were a genuinely large, frequently-changing state — should you reach for Context at all?"*
  → No. This is exactly the line from the notes: "Context is not a performance optimization, it's a data-access simplification, and it's the wrong tool for high-frequency updates." I'd reach for a proper state manager (Redux/Zustand/Jotai) or, for this specific case, just keep search state local and pass it explicitly via props to the few components that need it.

**🏭 Production angle:**
> "This is one of the highest-leverage React performance bugs to know how to spot, because it's silent — no errors, no warnings, just 'the app feels slow' tickets from users. My first move in any 'app feels sluggish' bug report is always the Profiler, not guessing."

---

### Q10. "You're designing a new feature: a multi-step checkout flow (4 steps, shared form state). Context API, prop drilling, or Redux? Justify your choice to a skeptical staff engineer."

**🧠 First response — decision framework, not a single "right answer":**

| Signal | Leans toward... |
|---|---|
| Only 3–4 levels deep, known/fixed structure | **Prop drilling** — genuinely simpler and cheaper; don't over-engineer |
| Deeply nested / structure likely to grow (more steps added later) | **Context** |
| Form state updates are frequent (every keystroke across many fields) AND many components consume it | **Be careful with Context** — risk of the Q9 problem; consider splitting contexts per step, or a state library |
| State needs to be shared **outside** this flow too (e.g., cart summary shown in header) | **Redux/Zustand** — this is now genuinely cross-cutting app state, not just "avoid prop drilling within one flow" |
| Need time-travel debugging, middleware, strict action-based updates, multiple teams touching this state | **Redux** |

**🔧 My actual recommendation for this scenario:**
> "A 4-step checkout is a bounded, well-known depth — I'd lean toward **Context**, but scoped **locally** to the checkout flow (a `CheckoutContext` mounted only when checkout starts, not global), and I'd split it: `CheckoutDataContext` (form values, changes often) separate from `CheckoutStepContext` (current step, changes rarely) so unrelated re-renders don't cascade. I would NOT reach for Redux here unless checkout data needs to be read by unrelated parts of the app (e.g., a persistent cart widget in the header) — that's the point where centralized, subscribed state management actually earns its complexity cost."

**⚠️ Follow-up:** *"Your skeptical staff engineer says: 'Context causes unnecessary re-renders, just use Redux for everything, it's simpler to reason about.' Respond."*
> "I'd disagree respectfully — Redux adds real overhead too: boilerplate, a learning curve for new team members, and it's overkill for state that's genuinely local to one flow and doesn't need to escape it. The goal isn't 'always use the more powerful tool' — it's matching the tool to the actual scope and update-frequency of the state. I'm happy to revisit this if the flow grows in complexity or the state needs to leak outside checkout."

---

## Section E — Custom Hooks: Design & Debugging

### Q11. "Design a `useDebounce` hook for a live-search input hitting an API. Then break it: what happens if the component unmounts mid-debounce, or the user types faster than the API responds?"

**🔧 Deep dive:**
```js
function useDebounce(value, delayMs) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer); // cancels the PREVIOUS timer on every new keystroke
  }, [value, delayMs]);

  return debouncedValue;
}

function SearchBox() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery) return;
    let cancelled = false;
    fetchResults(debouncedQuery).then(results => {
      if (!cancelled) setResults(results); // guard against stale/out-of-order responses
    });
    return () => { cancelled = true; }; // also protects against unmount mid-request
  }, [debouncedQuery]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

**⚠️ Edge cases & escalating pressure (this is a favorite staff-level line of questioning):**
- *"What happens if the component unmounts while a debounce timer is pending?"*
  → The `useEffect` cleanup (`clearTimeout`) runs automatically on unmount, cancelling the pending timer — no `setState` gets called on an unmounted component, no warning, no leak. This is *why* the cleanup function pattern matters, not just for the "next keystroke cancels previous timer" behavior.
- *"What about **out-of-order API responses** — user types 'a', then 'ab', 'a' 's request is slow and resolves AFTER 'ab' 's request?"*
  → The `debouncedQuery` itself protects against firing too many requests, but doesn't protect against **response race conditions**. The `cancelled` flag pattern above handles it for the *unmount* case; for the *stale-but-still-mounted* case (like the 'a' vs 'ab' race), I'd either (a) track a request ID/token and ignore responses that don't match the latest token, or (b) use `AbortController` to actually cancel the in-flight fetch when a new one starts.
```js
useEffect(() => {
  const controller = new AbortController();
  fetchResults(debouncedQuery, { signal: controller.signal })
    .then(setResults)
    .catch(err => { if (err.name !== "AbortError") throw err; });
  return () => controller.abort(); // cancels stale in-flight request outright
}, [debouncedQuery]);
```
- *"Would you ship this custom hook to `npm`/an internal library, or is it too coupled to this component?"*
  → It's generic enough (pure value + delay in, debounced value out) to be a shared internal hook — I'd extract it, write a couple of unit tests with fake timers (rapid value changes → only the last one should "commit" after the delay), and document the unmount-safety behavior explicitly so consumers trust it.

**🏭 Production angle:**
> "This is a genuinely common real-world hook, and the AbortController/race-condition follow-up is exactly the kind of thing that separates 'copied the hook from a tutorial' from 'actually reasoned about network behavior in production.' I've been bitten by the stale-response race before — it manifests as 'search results flicker to a stale query' which QA usually reports as 'weird flaky bug,' hard to repro."

---

### Q12. "A junior engineer wrote a `useUserData` custom hook that fetches user info and is used in exactly ONE component. Should this be a custom hook?"

**🧠 First response:**
> "Not automatically wrong, but I'd ask a few questions before deciding."

**Reasoning tree:**
- **Is the parent component large/complex** (e.g., a big form/dashboard doing a lot else)? → Extracting fetch logic into a hook can still be justified purely for **readability and separation of concerns**, even with a single consumer — this mirrors the real example from the source notes (a large side-drawer form component).
- **Is it trivial** (just a `useEffect` + `fetch` + two lines of state)? → Probably not worth extracting; inlining keeps the logic visible where it's used, avoids an unnecessary indirection layer for a reader tracing the code.
- **Is there a realistic chance of reuse soon** (e.g., a second screen will need the same user-fetching logic)? → Extract now, save a refactor later — but don't over-engineer for reuse that may never come ("YAGNI").

**⚠️ Follow-up:** *"Does extracting it improve performance?"*
> "No — and I'd say that explicitly in review if performance was the stated justification. It's a code-organization decision, not a runtime optimization. If anything, it can very marginally reduce function-allocation overhead if the same logic was previously duplicated across multiple components — but that's not the case here, since there's only one consumer."

---

## Section F — `useEffect` vs `useLayoutEffect`: Visual Bugs

### Q13. "QA reports a visible 'flash' — a tooltip briefly renders in the wrong position (top-left corner) before snapping to the correct position next to its trigger element. Fix it."

**🧠 First response:**
> "Classic `useEffect` vs `useLayoutEffect` timing bug. Anything that measures the DOM (`getBoundingClientRect`, element width/height) and uses that measurement to immediately reposition something visually needs to run **before** the browser paints — that's `useLayoutEffect`, not `useEffect`."

**🔧 Deep dive:**
```js
// ❌ Flash: renders at default position, THEN repositions after paint (visible jump)
function Tooltip({ triggerRef }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  useEffect(() => {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom, left: rect.left });
  }, []);
  return <div style={position}>...</div>;
}

// ✅ No flash: measurement + repositioning happens synchronously before paint
function Tooltip({ triggerRef }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  useLayoutEffect(() => {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom, left: rect.left });
  }, []);
  return <div style={position}>...</div>;
}
```

**⚠️ Edge cases & follow-ups:**
- *"`useLayoutEffect` blocks paint — could this hurt performance if overused?"*
  → Yes — that's exactly why it's not the default. If the measurement/DOM-write work is heavy, or done in many components simultaneously, you can introduce jank on the *opposite* end (delayed paint). Use it **surgically**, only where visual correctness before paint genuinely matters (tooltips, popovers, measuring-then-positioning UI) — not as a blanket replacement for `useEffect`.
- *"Does this matter for server-side rendering (SSR)?"*
  → `useLayoutEffect` produces a React warning in SSR environments (no DOM to measure on the server) unless guarded — a common production fix is a small `useIsomorphicLayoutEffect` hook that falls back to `useEffect` on the server and `useLayoutEffect` on the client.
```js
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
```

**🏭 Production angle:**
> "This exact 'flash of unpositioned content' bug is one of the most common visual bugs in component libraries (tooltips, dropdowns, popovers) — I'd expect any staff-level React engineer to recognize it on sight and know the SSR caveat, since most popover libraries (Radix, Floating UI, etc.) explicitly document this trade-off."

---

## Section G — Combined / War-Room Scenarios

### Q14. "Production incident: the app becomes unresponsive after a user leaves a dashboard page open for ~10 minutes. Chrome DevTools Memory tab shows steadily climbing heap usage. Walk me through your debugging process."

**🧠 First response (structure the debugging process, don't jump to a guess):**
> "This is a classic memory-leak signature. My process: (1) reproduce reliably, (2) take heap snapshots at intervals and diff them to see what's accumulating, (3) narrow down to the component/hook responsible, (4) fix the cleanup, (5) verify the leak is gone by re-profiling."

**🔧 Likely root causes to check, in order of frequency I've seen in real codebases:**
1. **Uncancelled `setInterval`/`setTimeout` in `useEffect` without cleanup:**
```js
// ❌ leak — no cleanup, and if this component unmounts/remounts repeatedly (e.g., tab switching),
// every mount adds ANOTHER interval that's never cleared
useEffect(() => {
  setInterval(() => fetchLiveData(), 5000);
}, []);

// ✅
useEffect(() => {
  const id = setInterval(() => fetchLiveData(), 5000);
  return () => clearInterval(id);
}, []);
```
2. **Event listeners / subscriptions not unsubscribed:**
```js
// ❌
useEffect(() => {
  window.addEventListener("resize", handleResize);
}, []);

// ✅
useEffect(() => {
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```
3. **A `useRef` accumulating data unboundedly** (e.g., pushing every incoming WebSocket message into a `ref.current.push(...)` array for "history," with no cap or eviction) — refs don't trigger re-renders, so this kind of leak is *invisible* in the UI until memory pressure causes real slowdown.
4. **Stale closures keeping large objects alive** — a `setTimeout`/interval closure captured a large state object early on; even after that data is logically "replaced" in state, the old closure (and everything it references) stays alive in memory as long as the interval/timer isn't cleared.

**⚠️ Escalating pressure follow-ups:**
- *"You found and fixed an uncancelled interval. How do you PROVE this was the actual cause and not just 'a' cause, before closing the incident?"*
  → Re-run the same reproduction with the fix, take heap snapshots at the same intervals, confirm heap plateaus instead of climbing. I don't close a memory-leak incident on "this looks right," I close it on "the profiler confirms it."
- *"How would you prevent this class of bug from recurring across the team?"*
  → Add an ESLint rule / code-review checklist item: every `useEffect` that starts a subscription, timer, or listener **must** have a cleanup function, no exceptions without an explicit comment justifying why. Consider a lightweight internal lint rule or a `useEffect` wrapper utility that warns in dev mode if no cleanup is returned when one is expected.

**🏭 Production angle:**
> "Memory leaks are one of the few React bug classes that don't show up in a quick manual test — they require someone to actually leave a tab open for a while, which QA often doesn't do. I push for automated longevity/soak tests on dashboard-style pages (leave it open in a headless browser for N minutes, assert heap growth stays under a threshold) specifically because of bugs like this."

---

### Q15. "You're doing a live coding pairing session. Build a `useOnlineStatus` hook that tracks `navigator.onLine`, updates on `online`/`offline` events, and is safe to use in multiple components simultaneously without duplicating listeners unnecessarily. Think out loud."

**🧠 Thinking out loud (what a staff engineer says while coding):**
> "First pass — straightforward custom hook, one listener per hook instance:"
```js
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
```
> "This works correctly, but if 50 components on the page each call `useOnlineStatus()`, that's 50 separate `online`/`offline` listener pairs attached to `window` — functionally fine (browsers handle this) but wasteful, and it's the kind of thing that shows up as a lot of duplicate work in a profiler."

**🔧 Production-grade version — single shared subscription:**
> "If this were going into a shared internal hooks library, I'd back it with a single module-level subscription and a simple pub-sub, so N components share ONE pair of listeners:"
```js
let listeners = new Set();
let currentStatus = typeof navigator !== "undefined" ? navigator.onLine : true;

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    currentStatus = true;
    listeners.forEach(l => l(true));
  });
  window.addEventListener("offline", () => {
    currentStatus = false;
    listeners.forEach(l => l(false));
  });
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(currentStatus);
  useEffect(() => {
    listeners.add(setIsOnline);
    return () => listeners.delete(setIsOnline);
  }, []);
  return isOnline;
}
```

**⚠️ Follow-ups:**
- *"Is this premature optimization for a typical app?"*
  → Honestly, for most apps, no — 5–10 instances of the simple version is completely fine. I'd only reach for the shared-subscription version if this hook is used pervasively (dozens+ of instances) or is part of a shared component library used across many teams, where the multiplied cost is real. I'd say this explicitly in the interview: **"I'd start with the simple version and only add this complexity if profiling or scale justified it."**
- *"How would you test this hook?"*
  → Mock `navigator.onLine`, dispatch synthetic `online`/`offline` events on `window` in a test environment (e.g., using `@testing-library/react-hooks` or `renderHook`), assert the returned value updates correctly, and assert listeners are removed on unmount (no lingering handlers).

**🏭 Production angle:**
> "This question tests whether you default to 'correct and simple' first, and only add shared-subscription complexity when the scale genuinely calls for it — mirroring the core philosophy from the notes: optimize for a *measured* problem, not a hypothetical one."

---

## Section H — Rapid-Fire "Explain Your Reasoning" Round

*(Format used by many staff-level interviews: short prompts, answered fast, with one sentence of "why" each.)*

**Q16.** *"`useMemo` inside a loop that renders a list of 1000 items — good or bad idea?"*
> Bad, generally — `useMemo` itself has overhead (dependency comparison, storage) that adds up across 1000 instances. If per-item computation is trivial, this overhead can exceed the savings. If genuinely expensive per item, memoize at the **list level** (compute the whole derived list once with one `useMemo`) rather than per-row, when possible.

**Q17.** *"Is it ever correct to intentionally omit a dependency from a `useEffect`'s array, overriding the lint warning?"*
> Rarely, but yes — e.g., an effect that should run once on mount regardless of a value's later changes (like initializing a third-party library instance). Always leave a comment explaining the omission (`// eslint-disable-next-line react-hooks/exhaustive-deps — intentionally run once`), because a future engineer (or future you) will assume it's a bug otherwise.

**Q18.** *"Can two components use the same custom hook and share state?"*
> No — by default, each call to a custom hook creates its own independent state instance (like instantiating separate objects from a class). To actually share state across components, the shared state needs to live **above** both components (lifted state, Context, or an external store) — the custom hook itself is not a state-sharing mechanism, just a logic-reuse mechanism.

**Q19.** *"`React.memo` on a component whose props are always different objects on every render — worth it?"*
> No — if props are guaranteed to differ every render (e.g., a fresh object/array/inline function passed without any upstream memoization), `React.memo`'s shallow comparison will always fail, so you pay the comparison cost with zero skip-benefit. Fix the prop stability upstream first, or don't bother memoizing this component.

**Q20.** *"You need to track how many times a component has rendered, purely for a debug overlay — `useState` or `useRef`?"*
> `useRef` — you don't want the act of *counting renders* to itself *cause* an extra render (which `useState` would). Increment `renderCountRef.current` directly during render (not inside an effect, since you want the count for every render, and reading it during render is safe since you're not writing to state).

---

## Section I — The Meta-Question (How Staff Engineers Actually Talk)

### Q21. "In one sentence, how do you decide whether to reach for ANY of these optimization hooks?"

> **"I don't reach for them by default — I reach for them when a profiler, a bug report, or a genuinely expensive/repeated computation gives me evidence that a specific, measured problem exists, and I document why the optimization is there so it doesn't get cargo-culted elsewhere."**

This is the answer that separates "knows the hooks" from "knows how to build and maintain production React at a company where other engineers will touch this code after you." Every scenario above is really testing for the same underlying instinct:

1. **Diagnose before prescribing** (profiler/evidence, not guesswork)
2. **Understand WHY the bug happens** (reference equality, closures, timing) — not just pattern-matching "add useCallback here"
3. **Know the trade-off of the fix itself** (memoization isn't free; `useLayoutEffect` blocks paint; Context isn't a performance tool)
4. **Think about the next engineer** (comments, tests, lint rules) — a fix that isn't understood will get "fixed" incorrectly six months later
