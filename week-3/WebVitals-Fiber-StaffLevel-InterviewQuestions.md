# Staff/Senior Engineer Interview Question Bank
### Web Vitals · Virtual DOM · Reconciliation · React Fiber

> Built from the source notes (`WebVitals-VirtualDOM-Fiber-Interview-Notes.md`). Every question below goes past definitions — each one forces a trade-off, a debug, a piece of code, or an "under pressure" judgment call, the way a staff/senior-level panel actually interviews. Model answers included, written the way a strong candidate should *talk*, not just what they should *know*.

---

## How to use this doc

- **🟡 Medium** — tests whether the concept is actually understood, not memorized.
- **🔴 Hard** — tests trade-off reasoning, debugging under ambiguity, or system-design judgment.
- Each question has: the prompt → what a weak answer sounds like → what a strong (staff-level) answer sounds like → the trap being tested.

---

## Section 1 — Web Vitals: Scenario & Debugging

### Q1. 🟡 The "fast API, bad INP" incident
Your team ships a checkout page. A `POST /confirm-order` call takes 3.5 seconds server-side. Your INP dashboard shows this interaction sitting in the "Poor" bucket at the 75th percentile, yet your APM (server-side tracing) shows no backend regression at all. The backend team insists "not our problem." Product is asking why checkout "feels laggy" even though nothing server-side changed.

**What do you check first, and what's your root-cause hypothesis?**

<details>
<summary>Model answer</summary>

Weak answer: "The API is slow, we need to optimize the backend."

Strong answer: INP measures time to the **next visible change**, not the API round trip. If clicking "Confirm Order" shows *nothing* — no spinner, no disabled-button state, no skeleton — until the 3.5s response lands, Chrome has no visible feedback to mark the interaction "responded to" earlier, so the entire 3.5s counts against INP. First thing I'd check: does the button visually change state (disabled, spinner, optimistic UI) synchronously on click, before the network call resolves? If not, that's the fix — and it's a *frontend* fix, not a backend one, even though the underlying async work genuinely does take 3.5s. I'd push back on "backend problem" framing and reframe it as "no immediate visual acknowledgment," which is a UX/frontend responsibility regardless of how fast or slow the API is.

**The trap:** candidates who don't internalize the INP mechanic will chase backend latency and completely miss that the *real* fix costs nothing (add a spinner) and can ship same-day.
</details>

---

### Q2. 🔴 CLS shows up only in field data, never in your local Lighthouse runs
Your local Lighthouse CLS score is consistently `0.02` (Good). Your CrUX field data shows CLS at `0.19` (Needs Improvement) for the same page, over the last 28 days. You're being asked to fix this before the next release, but you can't reproduce it locally no matter what you try.

**Walk through your debugging approach.**

<details>
<summary>Model answer</summary>

Lab data (Lighthouse) is simulated, on a single controlled configuration, running once — it won't capture variance across real devices/networks/connection speeds/ad-blocker states. Field data is aggregated across real users at the 75th percentile, so a device- or network-specific issue can be invisible locally but real for a meaningful slice of users. Concretely I'd:
1. Segment the CrUX/RUM data by device type and connection speed — CLS from late-loading web fonts or ads is often much worse on slow 3G/4G where the layout-shifting resource takes longer to arrive, widening the window during which a shift can happen.
2. Check if there's a third-party script (ads, A/B testing tools, consent banners) that only fires for certain geos/segments — Lighthouse runs typically don't have these enabled or don't wait long enough to see them inject content.
3. Use the actual `web-vitals` JS library to log CLS attribution (`layout-shift` entries with `sources`) in production via RUM, rather than trying to blindly reproduce locally — this tells you *which element* is shifting for real users, which is far faster than guessing.
4. Reproduce with network throttling (slow 3G) and CPU throttling in DevTools, and disable ad-blockers, since blocked ad slots collapse to zero width locally and never shift — masking the real-world behavior.

**The trap:** engineers who only trust lab data and conclude "the metric must be noisy" instead of recognizing lab vs. field divergence as a *specific, diagnosable* class of problem with known causes (third-party scripts, network variance, device variance).
</details>

---

### Q3. 🔴 Staff-level system design: "Stop regressions before they ship"
You're the staff engineer on a B2C product doing 50M+ monthly sessions. Leadership wants a plan to make sure Web Vitals regressions never reach more than a small fraction of real users before being caught. Design the pipeline.

<details>
<summary>Model answer</summary>

Layered, in order of when each layer catches a problem:
1. **Local development** — Lighthouse in Incognito (no extensions/VPN skew) as a pre-commit habit; not enforced, just cultural.
2. **CI/PR gate** — automated device + network simulation (BrowserStack-style bots) across a matrix (3G/4G/5G/Wi-Fi × low/mid/high CPU tiers), gated on merges into `prod` rather than every PR (cost/time trade-off) — this is where most regressions should actually be caught, before any real user sees them.
3. **Canary/progressive rollout** — ship to a small, low-revenue-impact segment/region first, monitor real Web Vitals (RUM) from that cohort specifically, and only widen the rollout if metrics hold. Never 0%→100% directly.
4. **Automated rollback trigger** — if canary-segment field data crosses a defined threshold (e.g., LCP p75 regresses by >X%), auto-halt the rollout rather than relying on someone noticing a dashboard.
5. **Ongoing field monitoring** — CrUX + Search Console Core Web Vitals report as the long-tail safety net, since it's the only source of *true* ground truth, even though it's delayed by nature.

The framing that matters here: this is a **deployment pipeline concern**, not a one-time audit. If I only had time to implement one layer, I'd pick the CI/PR gate — it's the best ratio of "catches real regressions" to "engineering effort," and it's fully within team control, unlike field data which requires the feature to already be live.

**The trap:** candidates who only mention "run Lighthouse" without a layered pipeline, or who don't mention the canary/rollback path (the actual staff-level differentiator here).
</details>

---

### Q4. 🟡 Output-based: what does Chrome report?
```
User clicks "Add to Cart".
t=0ms    → click registered
t=0ms    → button label changes to "Adding..." (visible DOM change)
t=0ms    → fetch('/api/cart') fires
t=1800ms → fetch resolves, cart badge updates to "1 item"
```

**What INP value does this interaction record, roughly, and why?**

<details>
<summary>Model answer</summary>

Roughly **~0ms** (well within "Good"), *not* 1800ms. Chrome measures the interaction's responsiveness up to the **next visible/paint change**, and the button label changing to "Adding..." at t=0ms already satisfies that — the interaction is considered "responded to" immediately. The 1.8s fetch resolving later and updating the cart badge is a *separate* visual update that happens after the interaction was already scored; it does not retroactively worsen the INP measurement for the original click.

**The trap:** candidates who reflexively say "1800ms" because they're pattern-matching "there's a slow network call in the sequence" instead of applying the actual mechanic (next visible change, not next *async completion*).
</details>

---

## Section 2 — Virtual DOM, Reconciliation & Diffing: Coding / Output-Based

### Q5. 🟡 Output-based: keys and reordering
```jsx
function List({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item.label}</li>
      ))}
    </ul>
  );
}

// Initial render: items = [{label:'A'}, {label:'B'}, {label:'C'}]
// Next render:    items = [{label:'C'}, {label:'A'}, {label:'B'}]  (reordered, nothing added/removed)
```

**Does React reuse the existing `<li>` DOM nodes, or recreate/patch all three? Explain precisely what happens during diffing.**

<details>
<summary>Model answer</summary>

React sees keys `0, 1, 2` in *both* renders — the keys themselves didn't change, only which item's `label` sits under each key. So React does **not** detect a reorder at all; it does a positional-style update: it thinks "key 0 still exists, but its text content changed from A to C," "key 1 still exists, text changed from B to A," "key 2 still exists, text changed from C to B." It patches the *text content* of all three `<li>` nodes rather than reordering the actual DOM nodes. This is functionally correct (the visible output is right) but wasteful — three DOM text mutations instead of zero DOM mutations plus a cheap reorder. If these list items had internal state (e.g., an uncontrolled `<input>` inside each `<li>`), this would actually be a **bug**, not just an inefficiency: React would preserve DOM node identity per position, so the input's contents would appear to "stick" to the wrong logical item after reorder — a classic index-key defect, not just a performance one.

**The trap:** saying "React reorders the DOM nodes" — it doesn't, because from React's point of view, using the index as key means there *is no reorder signal at all*, only content mutation per fixed position.
</details>

---

### Q6. 🔴 Debug this: a form field "steals" another user's input
A production bug report: in a dynamic list of editable rows (each with a local `useState` for an uncontrolled-feeling text input, keyed by array index), users report that after **deleting a row in the middle of the list**, a *different* row's text box suddenly shows the wrong value.

```jsx
function EditableRow({ initialValue }) {
  const [value, setValue] = useState(initialValue);
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}

function RowList({ rows, onDelete }) {
  return rows.map((row, i) => (
    <div key={i}>
      <EditableRow initialValue={row.value} />
      <button onClick={() => onDelete(i)}>Delete</button>
    </div>
  ));
}
```

**Diagnose the root cause and fix it. Explain *why* the fix works at the reconciliation level, not just "add a key."**

<details>
<summary>Model answer</summary>

Root cause: the `key` is the array index, which represents **position**, not the row's **identity**. `EditableRow`'s internal `value` state is tied to the *fiber node at that position*, not to the logical row. When a row in the middle is deleted, every row after it shifts up by one index — so the fiber node previously at index 3 (with its own `useState` value already typed by the user) is now being reused to render what is logically row 4's data via `initialValue`, but React sees "same key (3), same component type" and reuses the same component instance and its existing internal state rather than remounting with the new `initialValue`. The state doesn't reset, so the text box visually "keeps" the old, now-misattributed value.

**Fix:** key by a stable, unique identifier per row (e.g., a `row.id` from the data, not its index):
```jsx
rows.map((row) => (
  <div key={row.id}>
    <EditableRow initialValue={row.value} />
    <button onClick={() => onDelete(row.id)}>Delete</button>
  </div>
));
```
With `id`-based keys, deleting a row removes exactly *that* fiber node/key from the tree. React correctly unmounts the deleted row's component instance (and its state) and leaves every other row's fiber node — and its internal `useState`, tied to the *same key it always had* — completely untouched. No index shifting, no state getting reattributed to the wrong logical row.

**The trap:** a candidate who says "just add a key" without one already present, missing that a key *is* present here — it's just the wrong kind of key (positional, not identity-based). This is the exact "index-as-key" failure mode from the diffing notes, but surfaced as a state-corruption bug rather than a pure performance question — which is how it actually shows up in production.
</details>

---

### Q7. 🟡 Predict the output / DOM operations
```jsx
// Render 1:
<div><h1>Title</h1><p>Body</p></div>

// Render 2:
<span><h1>Title</h1><p>Body</p></span>
```

**How many real DOM operations does React perform, and what happens to the `<h1>` and `<p>` nodes — are they reused?**

<details>
<summary>Model answer</summary>

React discards the **entire subtree** the moment it sees the root element type change (`div` → `span`) — this is Assumption 1 of the diffing algorithm. It does *not* recursively check whether `<h1>` and `<p>` are identical and try to preserve them; it tears down the whole `div` subtree (including `<h1>` and `<p>` as DOM nodes, along with any component state they held) and constructs a brand-new `<span>` subtree from scratch, including brand-new `<h1>` and `<p>` DOM nodes. So the real DOM operation is effectively: remove the old `<div>...</div>` subtree, insert a new `<span>...</span>` subtree — not a targeted "rename the div to span" operation (browsers/DOM don't even support renaming an element's tag in place). Any component state that lived inside the old `<h1>`/`<p>` (if they were stateful components, not plain host elements) is lost, because these are treated as entirely new component instances.

**The trap:** assuming React is "smart enough" to notice the children are byte-for-byte identical and preserve them despite the parent type change — it deliberately isn't, by design, to keep diffing O(n).
</details>

---

### Q8. 🔴 Coding: fix a memoization-defeating pattern under time pressure
You're pairing live. A senior teammate pastes this and says "re-renders are killing our list scroll performance, `React.memo` doesn't seem to be helping at all":

```jsx
function ParentList({ items }) {
  return (
    <div>
      {items.map(item => (
        <ExpensiveRow
          key={item.id}
          item={item}
          onSelect={() => console.log('selected', item.id)}
          style={{ padding: 8 }}
        />
      ))}
    </div>
  );
}

const ExpensiveRow = React.memo(function ExpensiveRow({ item, onSelect, style }) {
  // expensive render logic
  return <div style={style} onClick={onSelect}>{item.label}</div>;
});
```

**Explain why `React.memo` is not helping here, and rewrite it so it actually does.**

<details>
<summary>Model answer</summary>

`React.memo` does a shallow prop comparison to decide whether to skip re-rendering. Two props here are re-created as brand-new references on **every single parent render**, regardless of whether `item` actually changed: `onSelect={() => ...}` (a new arrow function literal every render) and `style={{ padding: 8 }}` (a new object literal every render). Shallow equality sees these as "different" every time (`prevProps.onSelect !== nextProps.onSelect`), so `React.memo`'s bail-out check always fails and every `ExpensiveRow` re-renders regardless of memoization — this is exactly the "bad practice" flagged in the diffing notes: passing new inline object/function literals as props defeats memoization by making props *look* changed when the meaningful data didn't.

Fix — hoist the style object (it's static, no need to recreate it at all) and memoize the callback with a stable identity that doesn't change unless its real dependency changes:

```jsx
const rowStyle = { padding: 8 }; // hoisted, created once, ever

function ParentList({ items }) {
  const handleSelect = useCallback((id) => {
    console.log('selected', id);
  }, []);

  return (
    <div>
      {items.map(item => (
        <ExpensiveRow
          key={item.id}
          item={item}
          onSelect={handleSelect}
          id={item.id}
          style={rowStyle}
        />
      ))}
    </div>
  );
}

const ExpensiveRow = React.memo(function ExpensiveRow({ item, onSelect, id, style }) {
  return <div style={style} onClick={() => onSelect(id)}>{item.label}</div>;
});
```

Now `style` is referentially stable across renders (hoisted, not recreated), and `onSelect` is stable via `useCallback` with an empty dependency array (it doesn't close over anything that changes). `React.memo`'s shallow comparison now actually sees identical references for `onSelect`/`style` across renders, and only re-renders a given `ExpensiveRow` when its specific `item` reference actually changes.

**The trap:** engineers who reach for `useMemo`/`useCallback` everywhere reflexively without diagnosing *which* prop is breaking referential equality — under time pressure, the fast move is to inspect exactly which props are inline literals, since that's almost always the actual culprit, not `React.memo` itself being "broken."
</details>

---

## Section 3 — Fiber & Concurrent Rendering: Scenario & Judgment

### Q9. 🟡 Scenario: why doesn't this feel faster?
A junior engineer wraps an expensive search-results render in `startTransition`, expecting the whole search feature to "feel instant" now. After shipping, users still report the search input feels laggy while typing.

**What's likely wrong, and how would you explain the fix?**

<details>
<summary>Model answer</summary>

Most likely: the input's own state update (`setQuery`) got wrapped inside `startTransition` too, instead of only the expensive derived-results update being deferred. `startTransition` marks the update *inside* it as low priority — if the actual keystroke-reflecting state update is also marked low-priority, React may delay reflecting what the user typed, which is precisely the input responsiveness that must stay instant. The correct pattern is: the **high-priority** update (what's literally being typed, `setQuery`) happens synchronously/normally outside `startTransition`, and only the **derived, expensive** computation (`setResults(expensiveSearch(...))`) goes inside `startTransition`. I'd walk through the exact split:
```jsx
function handleChange(e) {
  setQuery(e.target.value);                 // stays HIGH priority, outside startTransition
  startTransition(() => {
    setResults(expensiveSearch(e.target.value)); // LOW priority, deferred
  });
}
```
If they've inverted this (wrapped the whole handler, or wrapped `setQuery` itself), the input will visibly lag because React is now allowed to deprioritize the very state update the user is staring at.

**The trap:** treating `startTransition` as a generic "make things faster" wrapper rather than understanding it only reprioritizes *what's inside it* — wrapping the wrong piece of state actively makes perceived responsiveness worse, not better.
</details>

---

### Q10. 🔴 "Prove Fiber pauses" — handling an unanswerable-by-design question
An interviewer pushes: *"Show me, precisely, the exact interval at which Fiber pauses to check for higher-priority work. Give me the number."*

**How do you handle this without either making something up or looking uninformed?**

<details>
<summary>Model answer</summary>

I'd be direct: React does not publish an official, guaranteed pause interval — any specific number circulating (e.g., "every 5ms" or "every 100ms") is an unofficial, illustrative figure from community sources, not a documented constant, and it's also subject to change since React's own docs no longer go deep into Fiber's internals or even the term "reconciliation" — deliberately, so the team retains freedom to change the implementation without breaking developer-facing guarantees. What I *can* describe with confidence is the mechanism: Fiber periodically yields control mid-render, checks with the scheduler whether a higher-priority update exists, and either continues the current unit of work or redirects to the higher-priority one. I'd rather give a precise, honest answer about what's actually documented/guaranteed versus what's implementation-detail folklore, than confidently state a number I can't back up — especially for something this likely to be an intentional trap in a staff-level interview, testing whether a candidate overclaims certainty about undocumented internals.

**The trap:** the question is often *designed* to see if the candidate will fabricate false confidence rather than correctly identifying the boundary of what's actually knowable/stable here.
</details>

---

### Q11. 🟡 Output/reasoning: render phase vs. commit phase interruption
```
A large state update begins rendering a 5,000-node component tree.
Mid-way through building the fiber tree (render phase), a new,
higher-priority user click comes in that needs to update a totally
different, small part of the UI.

Separately: assume instead the update had ALREADY reached the commit
phase (DOM mutations actively being applied) when that same click came in.
```

**Contrast what happens in each case.**

<details>
<summary>Model answer</summary>

**Case 1 (still in render phase):** Fiber can pause the in-progress work-in-progress tree construction for the 5,000-node update, redirect to build/process the higher-priority click's much smaller update first, commit that quickly, and then either resume or restart the original 5,000-node render afterward (depending on whether the paused work is still valid). The user perceives the small, high-priority update as fast and responsive, even though a much bigger render is technically "in flight."

**Case 2 (already in commit phase):** No interruption is possible. The commit phase — actually mutating the real DOM, running effects, updating refs — is atomic once started; it must run to completion in one uninterrupted go before React can even look at the new high-priority click. The click's update has to wait until the current commit finishes, however large that committed tree is. This is why render-phase work is where all of Fiber's scheduling/prioritization value lives — the commit phase is deliberately kept fast and uninterruptible because partially-applied DOM mutations would leave the UI in an inconsistent, half-updated visual state, which is far worse than a short wait.

**The trap:** assuming *all* of Fiber's rendering is interruptible everywhere — the interview signal here is knowing precisely where the line is (render vs. commit) and *why* commit specifically can't be interrupted (partial DOM mutation would be visually broken, not just slow).
</details>

---

### Q12. 🔴 System design: architecting a large, real-time dashboard
You're building a trading dashboard: a big data table (2,000 rows) that must feel instantly responsive to sort/filter clicks, while also streaming in live price ticks every ~200ms that update cells in the table. Users complain that typing into the filter box feels laggy whenever the live tick stream is active.

**Design the rendering strategy using the concepts from this session. Be specific about what's high vs. low priority.**

<details>
<summary>Model answer</summary>

The core diagnosis: the filter input (something the user is actively interacting with, expecting instant feedback) is competing for render priority with the 200ms tick stream (a background, high-frequency, but individually low-stakes update). Strategy:

1. **Treat the filter input's own value as the highest priority** — it must update synchronously, outside any transition, so keystrokes never lag regardless of what else is rendering.
2. **Wrap the expensive derived work (re-filtering/re-sorting the 2,000-row table based on the new filter text) in `startTransition`** — this is exactly the `useDeferredValue`/`startTransition` pattern from the notes: the user sees their typed characters instantly, while the actual filtered table result is allowed to lag slightly and "catch up," with React able to skip intermediate filter computations entirely if the user keeps typing.
3. **For the live tick stream**, avoid triggering a full-table re-render on every 200ms tick if only a handful of visible cells actually changed value — this isn't really a Fiber-scheduling problem to solve away, it's a data-shape problem: batch/throttle tick updates (e.g., collect ticks and flush at a fixed interval, or only update state for rows currently in the visible viewport) so you're not creating 5 renders/second across the *entire* 2,000-row tree regardless of filter activity.
4. Consider marking tick-driven state updates as `startTransition`-wrapped too, if they're not tied to something the user is actively watching change in real time (e.g., off-screen rows) — but be careful: if ticks are the *entire point* of the dashboard (visible, watched prices), deprioritizing them defeats the product requirement, so this needs product input, not just a technical default.

**Why this is the honest staff-level answer:** it doesn't reach for "just wrap everything in `startTransition`" — it separates *which* updates are genuinely urgent (what's typed, what's currently visible and being watched) from which are deferrable, and it flags where a scheduling fix (Fiber priority) is the wrong tool and a data/architecture fix (throttling, viewport-based updates) is the right one instead.

**The trap:** candidates who only know the API surface (`startTransition`) apply it uniformly to "make everything fast," without reasoning about which specific updates are actually competing for the same priority budget, and without recognizing that some of this problem isn't a scheduling problem at all.
</details>

---

## Section 4 — Framework Judgment & "Is React Fast?" (senior-level opinion questions)

### Q13. 🟡 Pushback scenario
A junior engineer says in a design review: *"Let's just use React here instead of vanilla JS for this small widget — React is faster since it only updates what changed."*

**How do you respond, in the room, without being condescending?**

<details>
<summary>Model answer</summary>

I'd gently correct the specific technical claim while validating the instinct: "React not updating everything unnecessarily is real, but that's React optimizing *its own* re-render/diff computation — not React being faster than vanilla JS at the actual DOM-mutation step, which uses the exact same native DOM APIs either way. For a small, simple widget, hand-written vanilla JS that knows exactly which node to touch can be just as fast or faster, with less overhead (no virtual DOM diffing pass at all). The reason to reach for React here isn't raw speed — it's whether this widget's state/UI relationships are complex enough that React's declarative model saves us real development and maintenance cost. If it's genuinely small and static, vanilla JS might be the more defensible, lower-overhead choice." This keeps the conversation about the *actual* trade-off (developer ergonomics vs. runtime overhead for a small widget) rather than a false performance argument that will fall apart under scrutiny later.

**The trap:** shutting down the junior engineer instead of using it as a teaching moment — the interviewer is watching communication style as much as technical correctness here.
</details>

---

### Q14. 🔴 "Convince me to migrate away from React" — devil's advocate
Leadership asks you, hypothetically, to argue *for* migrating a large, mature React codebase to a different framework, purely as a thought exercise to stress-test the team's assumptions.

**What's a defensible, non-strawman case?**

<details>
<summary>Model answer</summary>

The honest, defensible case isn't "React is bad" — it's scale- and constraint-specific: at the very largest traffic scale (Meta-scale), some organizations have deliberately moved toward alternatives like Svelte specifically because React carries known scaling trade-offs at that extreme (e.g., the overhead of shipping/parsing a runtime and doing virtual-DOM diffing at all, versus a compile-time approach that produces more surgical, framework-less output). I'd frame the argument around: (1) bundle-size and runtime-overhead sensitivity if this product is unusually performance-critical (e.g., a low-end-device-heavy user base where every KB of JS matters), (2) whether the team's actual usage of React is idiomatic enough to benefit from a rewrite, or whether accumulated legacy patterns would just get re-encoded in the new framework, (3) migration cost as the dominant real-world factor — a mature codebase has enormous switching costs that almost always outweigh a framework-level performance argument unless you're operating at genuinely extreme scale. I'd be explicit that this is a scale- and context-dependent argument, not a categorical "framework X beats framework Y" claim, since no rigorous, apples-to-apples benchmark supports that categorically for mainstream frameworks.

**The trap:** either refusing to engage ("React is always right for us") or overcorrecting into an exaggerated anti-React stance — the interviewer wants to see nuanced, scale-aware reasoning, not a side picked reflexively.
</details>

---

### Q15. 🟡 Rapid distinction test
**In one or two sentences each, distinguish:**
1. Recreation vs. replacement of a subtree during diffing.
2. `startTransition` vs. `useDeferredValue`.
3. Reconciliation vs. Fiber.

<details>
<summary>Model answer</summary>

1. *Recreation* fully tears down and rebuilds a node/subtree from scratch, discarding any existing references; *replacement* is related but distinct — it can involve reusing some existing references/DOM nodes in place rather than a full teardown-and-rebuild.
2. `startTransition` wraps a **state update** you're triggering, marking it explicitly low priority; `useDeferredValue` instead gives you a **lagging copy of a value** you already have, letting expensive downstream work read the stale-but-catching-up version while the real value updates instantly elsewhere.
3. *Reconciliation* is the **concept/algorithm** — comparing old vs. new virtual DOM to compute a minimal update — and it exists in both the old Stack Reconciler and current Fiber architecture; *Fiber* is the **scheduling and data-structure implementation** that changed *how* that same reconciliation work gets executed (interruptible, priority-aware, resumable), not *what* it computes.
</details>

---

## Section 5 — Class vs. Function Components & Error Boundaries

### Q16. 🔴 Debug: a subtle `useEffect` cleanup bug from a "converted" class component
A teammate converted this from a class component and asks why a memory-leak warning (`Can't perform a React state update on an unmounted component`) still appears intermittently:

```jsx
function PriceTicker({ symbol }) {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const socket = subscribeToPriceFeed(symbol, (newPrice) => {
      setPrice(newPrice);
    });
  }, [symbol]);

  return <span>{price ?? 'loading...'}</span>;
}
```

**Find the bug and explain why Hooks were supposed to make this exact class of bug less likely — and why it still happened here.**

<details>
<summary>Model answer</summary>

The `useEffect` never returns a cleanup function, so `subscribeToPriceFeed`'s subscription is never torn down — identical in spirit to the classic class-component bug of setting up a listener in `componentDidMount` and forgetting the matching `componentWillUnmount` cleanup. When `symbol` changes (re-running the effect) or the component unmounts, the old subscription keeps firing and calling `setPrice` on a component instance that's gone, producing the warning.

Fix — return the unsubscribe function directly from the same effect body:
```jsx
useEffect(() => {
  const socket = subscribeToPriceFeed(symbol, (newPrice) => {
    setPrice(newPrice);
  });
  return () => socket.unsubscribe(); // cleanup co-located, same function
}, [symbol]);
```

Why Hooks were *supposed* to prevent this: `useEffect` co-locates setup and cleanup in the same function body, right next to each other, instead of splitting them across `componentDidMount`/`componentWillUnmount` in a class — the theory being that a developer is far less likely to forget cleanup when it's written two lines below the setup, in the same visual block, rather than in a separate method that could be scrolled far away. This bug still happened because co-location makes forgetting *less likely*, not *impossible* — it's a discipline aid, not a compiler-enforced guarantee. This is a good moment to note the trade-off honestly rather than overselling Hooks as a silver bullet.

**The trap:** stopping at "just add the cleanup function" without connecting it back to *why* the Hooks model exists and being honest that Hooks reduce, but don't eliminate, this bug class.
</details>

---

### Q17. 🟡 Opinion, defended
**"Should new features on your team rely on Error Boundaries as the primary error-handling strategy?" Give a real position, not just "it depends."**

<details>
<summary>Model answer</summary>

My default position: no — I'd rather handle errors explicitly, close to where they actually occur (try/catch around a risky async call, explicit error state in the component that owns the risky operation), than lean on a catch-all Error Boundary that prevents a hard crash but doesn't communicate anything useful to the user about *what* went wrong or *how to recover*. In large-scale production systems, an Error Boundary firing usually just means "something upstream failed silently, and now the user sees a generic fallback" — it's a safety net, not a strategy. That said, I wouldn't rip Error Boundaries out entirely: I'd keep one at a high level as a last-resort safety net for truly unexpected failures, while pushing the team toward explicit, localized error handling as the primary pattern for anything predictable (network failures, validation errors, known-flaky third-party widgets). I'd frame this as an opinion I hold with moderate confidence, not a fact — reasonable teams land differently here, and the more common industry pattern actually does combine some boundary usage with disciplined explicit handling.

**The trap:** giving a wishy-washy non-answer. This question is explicitly testing whether a senior/staff candidate can hold and defend an actual opinion under scrutiny, while still being calibrated about how confident to be.
</details>

---

## Section 6 — Rapid-Fire "Under Pressure" Round
*(Ask these back-to-back, out loud, no more than ~20 seconds thinking time each — this is how the source material's own rapid-fire section is meant to be drilled.)*

1. A component re-renders 10 times in a row but the real DOM is touched once. Why is this *not* wasted work?
2. Why can't the commit phase ever be paused, even for a higher-priority update?
3. You see `key={Math.random()}` in a code review. What immediately breaks, and why is this worse than `key={index}`?
4. Give one concrete scenario where CLS could be "Good" (`<0.1`) but users still complain about jumpy content.
5. Why is `onload` a worse loading metric than LCP, specifically for a client-side-rendered React app?
6. True or false, and defend it: "The virtual DOM must run inside a browser." 
7. Name the one thing `useDeferredValue` does *not* let you specify, that `debounce` requires you to specify.

<details>
<summary>Model answers (compressed)</summary>

1. Rendering is cheap, in-memory computation (recomputing the virtual DOM); the expensive step is committing to the real DOM. 10 renders producing an identical diff result means React correctly determined only one real DOM write was needed — the other 9 renders "did their job" by confirming no update was necessary, which is the entire point of diffing.
2. Because partially-applied DOM mutations would leave the UI in an inconsistent, half-updated visual state — worse than a brief delay before the update starts.
3. `Math.random()` generates a *new* key every single render, so React sees "a completely new node" every time regardless of whether the underlying item actually changed — this forces full unmount+remount of every item on every render, losing all internal state and DOM node identity constantly. It's strictly worse than index-as-key, which is at least stable across renders where the list itself doesn't change (index-as-key only breaks on insert/delete/reorder; random keys break on *every* render).
4. Late-loading web fonts causing a small amount of text reflow that stays just under the 0.1 threshold numerically, but visually happens right as the user is about to click something near that text — CLS being "Good" is an aggregate score, not a guarantee that zero perceptible shift occurred.
5. `onload` waits for every resource (including things the user may never see, like footer images or analytics scripts) — for a CSR React app specifically, this can fire *after* the user has already been productively interacting with the hydrated, meaningful content for seconds, making it wildly disconnected from actual perceived usability.
6. **False.** It's a plain JS object tree with no browser dependency — proven by the fact that it's computed identically in React Native (no DOM at all) and SSR contexts.
7. A fixed time delay — `useDeferredValue`/`startTransition` are priority-based, letting React's own scheduler decide dynamically based on actual engine capacity, with no developer-specified millisecond value at all.
</details>

---

## Interviewer's Note (meta-level calibration)

A candidate who *only* nails the rapid-fire round but freezes on Q6, Q8, or Q12 has memorized the notes without internalizing them — that's a signal, not a pass. A candidate who fumbles a rapid-fire definition but reasons correctly through Q6/Q8/Q12 live, out loud, with the right trade-offs, is closer to what a staff/senior hire actually needs to look like day-to-day: someone who can *derive* the right answer under ambiguity, not just recite one.
