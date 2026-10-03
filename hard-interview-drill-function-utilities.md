# Hard Interview Drill: Function Utilities in JavaScript

A principal-level walkthrough of seven classic "implement the utility" questions. Each section follows the same structure:

1. **Problem framing**: what is really being asked, and what the interviewer is probing
2. **Approach, step by step**: the reasoning before the code
3. **Implementation**
4. **Real use cases**
5. **Trade-offs and edge cases**: where senior candidates separate themselves

All code is plain ES2020+ with no dependencies. Snippets share one scope: the placeholder `_` from Q1 is reused in Q3.

---

## Q1. `curry` with placeholders (`_`)

### Problem framing
Plain `curry` collects arguments until `fn.length` is reached, then calls `fn`. Placeholders add a twist: `curried(_, 2)(1)` must produce `fn(1, 2)`. The call is no longer "append and count". We must track **which positions are still holes** and **fill them left to right** on the next call.

### Approach, step by step
1. **Represent a placeholder as a unique `Symbol`.** A string or `undefined` can collide with legitimate arguments (`undefined` is a valid argument). A symbol is unforgeable.
2. **Keep state as two things:** `slots` (the args so far, with `_` where a hole is) and `holes` (sorted indices of holes). Tracking `holes` explicitly means we never rescan `slots` to find them.
3. **On each call, fill holes first, left to right.** New args consume holes in index order.
4. **Remaining new args append at the end.**
5. **If a new arg is itself `_`**, it fills a hole *with another hole*, so the position stays open. Likewise, an appended `_` registers a new hole.
6. **Ready check:** `slots.length >= arity` AND no hole index `< arity`. Because `holes` is sorted, that is just `holes.length === 0 || holes[0] >= arity`.
7. **Immutability:** every call builds a *new* state and returns a *new* curried function, so partial applications can be safely reused and branched (`const add5 = add(5)` used many times).
8. **Preserve `this`** by using a regular `function` and `fn.apply(this, ...)`.

### Implementation

```js
const _ = Symbol('curry.placeholder');

function curry(fn, arity = fn.length) {
  if (typeof fn !== 'function') throw new TypeError('curry expects a function');

  const make = (slots, holes) =>
    function curried(...args) {
      const next = slots.slice();
      const nextHoles = [];
      let a = 0;
      let h = 0;

      // 1) Fill existing holes, in order. A placeholder arg keeps the hole open.
      for (; h < holes.length && a < args.length; h++, a++) {
        next[holes[h]] = args[a];
        if (args[a] === _) nextHoles.push(holes[h]);
      }
      // 2) Holes we had no argument for stay open (indices stay sorted).
      for (; h < holes.length; h++) nextHoles.push(holes[h]);
      // 3) Remaining args are appended; appended placeholders become new holes.
      for (; a < args.length; a++) {
        if (args[a] === _) nextHoles.push(next.length);
        next.push(args[a]);
      }

      const ready = next.length >= arity && (nextHoles.length === 0 || nextHoles[0] >= arity);
      return ready ? fn.apply(this, next) : make(next, nextHoles);
    };

  return make([], []);
}

curry.placeholder = _;
```

```javascript
// Usage
const f = curry((a, b, c) => [a, b, c]);
f(1)(2)(3);          // [1, 2, 3]
f(1, 2)(3);          // [1, 2, 3]
f(_, 2)(1)(3);       // [1, 2, 3]  (hole at 0 filled by 1, then 3 appended)
f(_, _, 3)(1, 2);    // [1, 2, 3]
f(_, 2, _)(1, 3);    // [1, 2, 3]
f(_, _)(_, 2)(1)(3); // [1, 2, 3]  (placeholder re-opens a hole)
```

### Real use cases
- **Point-free data pipelines** (`map(curry(prop)(_, 'id'))`): fix the *second* argument of a data-last function without wrapping it in a lambda.
- **Config-first utilities** such as `log(level)(module)(message)`, where earlier arguments are specialized once and reused.
- Functional libraries (Lodash/fp, Ramda) ship exactly this feature for argument-order flexibility.

### Trade-offs and edge cases
- **`fn.length` lies** for functions with defaults or rest parameters (`(a, b = 1) => ...` has length 1). That is why `arity` is an explicit override. This links directly to Q7.
- **Calling with zero args** returns an equivalent curried function and never invokes `fn`. Some libraries treat that as "call now". Document whichever you choose.
- **Extra args beyond arity** are passed through to `fn`, matching normal JS call semantics.
- **Cost:** each partial call allocates two small arrays and one closure. That is fine for application code, and wrong for a hot inner loop. Use a hand-written lambda there.
- **Alternative:** a single `slots` array scanned for `_` is simpler (O(arity) per call) and perfectly acceptable. Tracking `holes` pays off only when arity is large.

---

## Q2. `memoize` with LRU (capacity N) and TTL

### Problem framing
Three concerns in one cache: **key derivation**, **recency-based eviction**, and **time-based expiry**. The trick the interviewer wants is that a plain `Map` iterates in **insertion order**, so it can serve as the LRU ordering structure without a hand-built doubly linked list.

### Approach, step by step
1. **Key function:** default `JSON.stringify(args)`. It distinguishes `1` from `"1"` and handles multiple arguments. It is overridable for objects, `Map`s, or identity keys.
2. **Entry shape:** `{ value, expiresAt }`. An absolute timestamp makes the expiry check a single comparison with no timers. Lazy expiry means no `setTimeout` per entry, no timer leaks, and no keeping the process alive.
3. **Read path (hit):**
   - If `expiresAt > now`, it's a valid hit. **Delete and re-insert the key** so it moves to the end of the `Map` (most recently used), then return the value.
   - If expired, delete it and treat it as a miss.
4. **Write path (miss):** call `fn`, insert the entry at the end, then if `size > capacity`, evict `map.keys().next().value`, which is the **least recently used**.
5. **Async safety:** if `fn` returns a promise, a rejection must not be cached forever. Attach a handler that removes *that specific entry* (identity check) on rejection.
6. **Injectable clock** (`now`) makes TTL deterministic to test.
7. **Expose** `clear()` and `size` for operability.

### Implementation

```js
function memoize(
  fn,
  {
    capacity = Infinity,
    ttl = Infinity,
    key = (...args) => JSON.stringify(args),
    now = Date.now,
  } = {}
) {
  if (!(capacity >= 1)) throw new RangeError('capacity must be >= 1');
  const cache = new Map(); // insertion order == recency order (oldest first)

  const memoized = function (...args) {
    const k = key(...args);
    const t = now();

    const hit = cache.get(k);
    if (hit !== undefined) {
      if (hit.expiresAt > t) {
        cache.delete(k); // refresh recency: re-insert at the tail
        cache.set(k, hit);
        return hit.value;
      }
      cache.delete(k); // expired: fall through to recompute
    }

    const value = fn.apply(this, args);
    const entry = { value, expiresAt: t + ttl };
    cache.set(k, entry);
    if (cache.size > capacity) cache.delete(cache.keys().next().value); // evict LRU

    // Never cache failures of async functions.
    if (value && typeof value.then === 'function') {
      value.then(undefined, () => {
        if (cache.get(k) === entry) cache.delete(k);
      });
    }
    return value;
  };

  memoized.clear = () => cache.clear();
  Object.defineProperty(memoized, 'size', { get: () => cache.size });
  return memoized;
}
```

```javascript
// Usage
const getUser = memoize(fetchUser, { capacity: 500, ttl: 30_000 });
await getUser(42); // miss -> network
await getUser(42); // hit  -> same promise (concurrent callers share one request)
```

### Real use cases
- **Request deduplication:** caching the *promise* means 50 concurrent components asking for user 42 trigger one network call.
- **Expensive pure computation** (formatters, parsers, selectors) with bounded memory.
- **Config or feature-flag lookups** where staleness is acceptable for N seconds.

### Trade-offs and edge cases
- **Lazy expiry** means expired entries still occupy memory until touched or evicted by capacity. Capacity bounds the worst case. If you need eager cleanup, add a periodic sweep (`setInterval(...).unref()`) or evict expired entries first on insert.
- **Absolute vs sliding TTL:** here a hit does *not* extend `expiresAt`. A sliding TTL (refresh on read) suits session caches. An absolute TTL suits data with a freshness SLA.
- **`JSON.stringify` keys** are O(size of args), drop `undefined`/functions, order object keys by insertion, and throw on cycles. For object arguments, use a `WeakMap` identity cache or a custom `key`.
- **`this` is not part of the key.** Memoizing methods that depend on `this` is a bug waiting to happen.
- **Thundering herd after expiry** is *not* solved: many callers can recompute simultaneously. Caching the promise mitigates it, since the in-flight promise is already stored.
- **Time is measured from call start.** For slow async functions, the TTL includes the latency.
- **Delete + set per hit** is O(1) amortized. A linked-list LRU has the same big-O but more allocation, so the `Map` trick wins in practice in V8.

---

## Q3. `once`, `after(n)`, `before(n)`, `partial`, `pipe`, `compose`

### Problem framing
Six small utilities that test **closure state**, **`this` forwarding**, **argument forwarding**, and **semantics precision** (what exactly is "the nth call"?). State the semantics out loud before coding.

### Approach, step by step

**Semantics (agree with the interviewer first)**

| Utility | Contract |
|---|---|
| `before(n, fn)` | `fn` runs on calls `1 … n-1`. From call `n` on, returns the last result without invoking. |
| `once(fn)` | `before(2, fn)`: first call only, then cached result. |
| `after(n, fn)` | `fn` is ignored until the `n`th call, then runs on every call from the `n`th onward. |
| `partial(fn, ...preset)` | Pre-fill leading args; later args fill `_` holes first, then append. |
| `pipe(f, g, h)` | `h(g(f(...args)))`: left to right; only the first function may take multiple args. |
| `compose(f, g, h)` | `f(g(h(...args)))`: right to left, which is `pipe` reversed. |

1. **Capture state in a closure** (`count`, `last`) rather than on a property. It is private and cannot be tampered with.
2. **Forward `this` and `...args`** with a regular `function` and `fn.apply(this, args)`.
3. **Release references.** After `once` fires, drop `fn` so the closure (and anything it captured) can be garbage-collected.
4. **Failure policy for `once`:** if `fn` throws, we do *not* mark it as called, so the next call retries. This is a deliberate choice, and the opposite policy is also defensible.
5. **Derive, don't duplicate:** `compose` is `pipe` over a reversed copy. `once` is conceptually `before(2, ...)`.

### Implementation

```js
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      result = fn.apply(this, args); // if this throws, `called` stays false -> retry allowed
      called = true;
      fn = null; // release closure references
    }
    return result;
  };
}

function before(n, fn) {
  let count = 0;
  let last;
  return function (...args) {
    if (count < n - 1) {
      count++;
      last = fn.apply(this, args);
      if (count === n - 1) fn = null; // done invoking, release
    }
    return last;
  };
}

function after(n, fn) {
  let calls = 0;
  return function (...args) {
    if (calls < n) calls++; // clamp: avoid unbounded counter growth
    if (calls >= n) return fn.apply(this, args);
    return undefined;
  };
}

// Placeholder-aware partial (reuses `_` from Q1).
function partial(fn, ...preset) {
  return function (...later) {
    const args = preset.slice();
    let i = 0;
    for (let k = 0; k < args.length && i < later.length; k++) {
      if (args[k] === _) args[k] = later[i++];
    }
    while (i < later.length) args.push(later[i++]);
    return fn.apply(this, args);
  };
}

function pipe(...fns) {
  for (const f of fns) {
    if (typeof f !== 'function') throw new TypeError('pipe expects functions');
  }
  return function (...args) {
    if (fns.length === 0) return args[0];
    let result = fns[0].apply(this, args); // first fn may be variadic
    for (let i = 1; i < fns.length; i++) result = fns[i].call(this, result);
    return result;
  };
}

const compose = (...fns) => pipe(...[...fns].reverse());

// Async variant: awaits each stage.
const pipeAsync = (...fns) => (x) => fns.reduce((p, f) => p.then(f), Promise.resolve(x));
```

```javascript
// Usage
const init = once(() => connectToDb());
init(); init(); // connects exactly once

const onReady = after(3, () => console.log('all 3 loaded'));
['a', 'b', 'c'].forEach(load => load && onReady()); // fires on the 3rd call

const slug = pipe(s => s.trim(), s => s.toLowerCase(), s => s.replace(/\s+/g, '-'));
slug('  Hello World '); // "hello-world"

const log = partial(console.log, '[app]');
log('started'); // [app] started
```

### Real use cases
- **`once`:** lazy singletons, one-time initialization, idempotent cleanup/`dispose`, guarding event handlers that must not double-fire (payment submit).
- **`after(n)`:** a "barrier" that fires when `n` parallel callbacks have finished (legacy callback-style fan-in).
- **`before(n)`:** cap retries or free-tier usage (first 3 calls only).
- **`pipe`/`compose`:** middleware chains, data transformation, selectors. Redux's `compose` is exactly this.

### Trade-offs and edge cases
- **Throw policy in `once`:** retry-on-throw suits initialization with transient failures. Lodash and Ramda mark it as called first, so a failed init is never retried. Pick deliberately and document it.
- **`once` and recursion:** if `fn` re-enters the wrapper before returning, `called` is still `false`, so it re-enters. Set `called = true` *before* the call if re-entrancy is a concern, at the cost of the retry semantic.
- **`pipe` with async stages:** plain `pipe` passes a promise to the next function. Use `pipeAsync`, or make the contract explicit.
- **Wrappers lose `length`/`name`.** See Q7 for how to preserve them.
- **Runtime validation in `pipe`** fails fast at *composition* time instead of deep inside a call.
- **Stack traces:** deeply composed anonymous functions are painful to debug. Name your stages.

---

## Q4. Debounce with `immediate`, `cancel`, `flush`

### Problem framing
Debounce: *"run only after calls stop for `wait` ms."* The hard part is the surface area. Leading vs trailing mode, preserving the **last** arguments and `this`, and defining what `cancel` and `flush` mean in each mode.

### Approach, step by step
1. **State:** `timer`, `pendingArgs`, `pendingThis`, `result`. `pendingArgs !== null` is the single source of truth for "a trailing call is waiting."
2. **Every call resets the timer** (clear then set). The timer callback marks the end of a burst.
3. **Trailing mode (default):** store the **latest** `args`/`this`. When the timer fires and `pendingArgs` is set, run it.
4. **Immediate (leading) mode:** a call that arrives with *no active timer* starts a burst, so run `fn` now. Calls during the burst only extend the timer and are ignored. When the timer fires, the burst is over and the next call fires immediately again.
5. **`cancel()`:** clear the timer, drop pending state. Nothing runs.
6. **`flush()`:** if a trailing call is pending, clear the timer and **run it now with the last args**. If nothing is pending, return the last result. In immediate mode, `flush` ends the cooldown early.
7. **Return value:** debounced functions can't return the *future* result, so return the *last computed* result (the lodash convention).

### Implementation

```js
function debounce(fn, wait = 0, { immediate = false } = {}) {
  let timer = null;
  let pendingArgs = null; // non-null <=> a trailing invocation is waiting
  let pendingThis;
  let result;

  const runPending = () => {
    const args = pendingArgs;
    const ctx = pendingThis;
    pendingArgs = null;
    pendingThis = undefined;
    result = fn.apply(ctx, args);
    return result;
  };

  function debounced(...args) {
    const startingBurst = timer === null;
    clearTimeout(timer); // clearTimeout(null) is a safe no-op
    timer = setTimeout(() => {
      timer = null;
      if (pendingArgs) runPending();
    }, wait);

    if (immediate) {
      if (startingBurst) result = fn.apply(this, args);
    } else {
      pendingArgs = args; // latest call wins
      pendingThis = this;
    }
    return result;
  }

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
    pendingArgs = null;
    pendingThis = undefined;
  };

  debounced.flush = () => {
    if (timer === null) return result;
    clearTimeout(timer);
    timer = null;
    return pendingArgs ? runPending() : result;
  };

  debounced.pending = () => timer !== null;
  return debounced;
}
```

```javascript
// Usage
const save = debounce(saveDraft, 500);
input.addEventListener('input', e => save(e.target.value));
window.addEventListener('beforeunload', () => save.flush()); // don't lose the last edit
route.onLeave(() => save.cancel());                          // user discarded changes

const onResize = debounce(relayout, 200);                    // trailing
const onSubmit = debounce(submit, 1000, { immediate: true }); // first click wins, double-clicks ignored
```

### Real use cases
- **Search-as-you-type** (trailing): one request after the user pauses.
- **Autosave** with `flush` on blur or unload so the final keystrokes are not lost.
- **Double-submit prevention** (immediate): the first click fires, and the rest are swallowed.
- **Resize/scroll handlers** that trigger layout recalculation.

### Trade-offs and edge cases
- **No `maxWait`.** A user typing continuously for 10 seconds never triggers a trailing call. Lodash adds `maxWait` to guarantee a call at least every N ms. Mention it as the production extension.
- **Debounce vs throttle:** debounce collapses a burst into *one* call at the end. Throttle guarantees *regular* calls during the burst. Pick by whether intermediate updates matter (live scroll position: throttle; search request: debounce).
- **Errors inside the timer callback** surface as uncaught exceptions rather than reaching the caller, because the caller has already returned. Wrap with your own error reporting for production.
- **`this` capture** matters when debouncing methods. Store the latest `this` along with the latest args.
- **Memory:** a pending timer keeps the closure (and captured args) alive. Always `cancel()` on component unmount.
- **Server-side / Node:** use `timer.unref()` if a pending debounce must not keep the process alive.

---

## Q5. Throttling an async function so calls never overlap

### Problem framing
"Throttle" is overloaded. Clarify what happens to a call that arrives while one is in flight. There are four distinct policies, and each fits different problems:

| Policy | Behavior | Typical use |
|---|---|---|
| **Serialize (queue)** | Every call runs, one at a time, in order | Writes to a file or DB row, ordered mutations |
| **Concurrency limit (N)** | At most N in flight, others queue | Bulk API calls, crawlers |
| **Single-flight (coalesce)** | A call during flight returns the *same* promise | Cache fills, token refresh |
| **Drop / latest-wins** | Ignore or replace intermediate calls | Autocomplete requests |

The question asks for non-overlapping, so **serialize** is the core answer, and a **concurrency limiter** is its natural generalization (N = 1 is serialize).

### Approach, step by step
1. **Keep a promise `tail`** that represents "everything scheduled so far has finished."
2. **Each call chains onto `tail`:** `tail.then(run)`. `run` doesn't start until the previous task settles, so overlap is impossible by construction.
3. **Keep the chain alive on failure.** One rejected task must not poison every later task, so `tail` stores a *swallowed* version (`p.catch(() => {})`), while the caller still gets the *real* promise `p`.
4. **Preserve `this` and args** with an arrow around `fn.apply`.
5. **Generalize with a queue + counter** (`active < concurrency`) when you need N > 1, backpressure, or cancellation.
6. **Add single-flight** as a separate wrapper when the policy is "share the in-flight result."

### Implementation

```js
// 1) Serialize: strictly one at a time, FIFO, failures isolated.
function serialize(fn) {
  let tail = Promise.resolve();
  return function (...args) {
    const p = tail.then(() => fn.apply(this, args));
    tail = p.catch(() => {}); // chain survives rejection; caller still sees p
    return p;
  };
}

// 2) Concurrency limiter: serialize is limit(1).
function createLimiter(concurrency = 1) {
  const queue = [];
  let active = 0;

  const pump = () => {
    if (active >= concurrency || queue.length === 0) return;
    active++;
    const { task, resolve, reject } = queue.shift();
    Promise.resolve()
      .then(task) // converts sync throws into rejections
      .then(resolve, reject)
      .finally(() => {
        active--;
        pump();
      });
  };

  return (task) =>
    new Promise((resolve, reject) => {
      queue.push({ task, resolve, reject });
      pump();
    });
}

// 3) Single-flight: concurrent callers share one in-flight promise.
function singleFlight(fn) {
  let inflight = null;
  return function (...args) {
    if (!inflight) {
      inflight = Promise.resolve()
        .then(() => fn.apply(this, args))
        .finally(() => {
          inflight = null;
        });
    }
    return inflight;
  };
}
```

```javascript
// Usage
const saveSerial = serialize(saveToDisk);
await Promise.all([saveSerial(a), saveSerial(b), saveSerial(c)]); // runs a, then b, then c

const limit = createLimiter(3);
const results = await Promise.all(urls.map(u => limit(() => fetch(u))));

const refreshToken = singleFlight(doRefresh); // 20 simultaneous 401s -> one refresh request
```

### Real use cases
- **Serialize:** appending to a log file, read-modify-write on shared state, sequential UI animations, ordered WebSocket sends.
- **Limiter:** rate-friendly bulk API usage, parallel file uploads, crawlers.
- **Single-flight:** OAuth token refresh, cache population, deduplicated GETs.

### Trade-offs and edge cases
- **Head-of-line blocking:** one slow task delays everything behind it. Add per-task **timeouts** or `AbortSignal` support for production.
- **Unbounded queue = memory leak under load.** Add `maxQueue` and either reject with a "busy" error or drop oldest (**backpressure**).
- **`queue.shift()` is O(n)** on large arrays. For huge queues use an index-based ring buffer or linked list.
- **Error semantics:** with `tail = p.catch(() => {})`, a failing task does not cancel later tasks. If the policy is "abort the rest on first failure," chain differently.
- **Unhandled rejections:** the caller must handle `p`. The internal `tail` is already handled, so it never produces unhandled-rejection noise.
- **Ordering guarantee:** FIFO per wrapper instance. If two *different* wrapped functions touch the same resource, they need to **share one limiter**, not each own a private one.
- **Not a rate limiter:** this prevents *overlap*, not *frequency*. Add a minimum gap (`await sleep(gap)` after each task) or a token bucket if you also need requests per second.
- **Cross-process safety:** this only works inside one JS process. Multiple Node workers or tabs need a real lock (DB advisory lock, Redis, `navigator.locks` in browsers).

---

## Q6. Why `["1","2","3"].map(parseInt)` returns `[1, NaN, NaN]`

### The mechanism
`Array.prototype.map` calls its callback with **three arguments**: `(value, index, array)`. `parseInt` takes **two**: `(string, radix)`. So the *index* silently becomes the *radix*:

| Call | Radix | Result | Why |
|---|---|---|---|
| `parseInt("1", 0)` | 0 | `1` | Radix `0` (or `undefined`) means "auto": base 10 unless the string starts with `0x` |
| `parseInt("2", 1)` | 1 | `NaN` | Radix must be in `2…36`; `1` is invalid, so `NaN` |
| `parseInt("3", 2)` | 2 | `NaN` | Binary digits are only `0` and `1`; `"3"` is not valid in base 2, so there are no parseable digits |

### Fixes (in order of preference)

```javascript
["1", "2", "3"].map(Number);                 // [1, 2, 3]   clearest when you want numeric conversion
["1", "2", "3"].map(s => parseInt(s, 10));   // [1, 2, 3]   explicit radix, safest when parsing "12px"
["1", "2", "3"].map(unary(parseInt));        // [1, 2, 3]   reusable
```

```js
// Reusable arity-limiter: only pass the first argument along.
const unary = (fn) => (x) => fn(x);
// Generalization:
const ary = (n, fn) => (...args) => fn(...args.slice(0, n));
```

### Why this matters beyond the trivia
- **Root cause:** a **signature mismatch between a callback API and a function with optional trailing params**. It is a bug *class*, not a one-off.
- Same trap: `["a","b"].forEach(console.log)` prints index and array too; `promise.then(parseInt)`; `arr.map(Number.parseFloat)` is safe because `parseFloat` takes one parameter.
- `Number("")` is `0`, `parseInt("")` is `NaN`, `Number("12px")` is `NaN`, and `parseInt("12px", 10)` is `12`. Choose by whether you want strict conversion or lenient prefix parsing.
- **Defensive habits:** always pass an explicit radix to `parseInt`. Prefer arrow wrappers (`x => f(x)`) at API boundaries where the callee has optional parameters. Lint rule: `radix`.

---

## Q7. Function `length`, `name`, and preserving them in decorators

### What they are
- **`fn.length`**: the number of parameters *before the first default or rest parameter*.
  - `(a, b) => {}` has length 2.
  - `(a, b = 1, c) => {}` has length **1**.
  - `(...args) => {}` has length **0**.
- **`fn.name`**: the function's name, often **inferred** from context:
  - `const f = () => {}` has name `"f"`.
  - `{ m() {} }.m` has name `"m"`.
  - `foo.bind(x)` has name `"bound foo"`.
  - Getters are `"get x"`, and symbol-keyed methods are `"[description]"`.
- Both properties are **non-writable, non-enumerable, but configurable.** So `fn.length = 3` silently fails (or throws in strict mode), but `Object.defineProperty` works.

### The problem decorators create
A typical wrapper is `(...args) => original(...args)`, which has `length === 0` and `name === ""` (or the wrapper's name). Anything that *introspects* the function now misbehaves:

- `curry(wrapped)` reads `fn.length` and curries the wrong arity (Q1).
- **Express** distinguishes error middleware by `fn.length === 4`. A wrapped `(err, req, res, next)` handler is silently treated as normal middleware and never receives errors.
- Test runners such as **Mocha** check `fn.length` to decide whether a test is callback-style (`done`).
- DI frameworks, CLI parsers, and RPC layers that read parameter counts or names.
- **Stack traces and profilers** show `anonymous` or `wrapper` instead of the real function name.
- Logging or metrics keyed on `fn.name` become useless.

### Approach, step by step
1. Use `Object.defineProperty(wrapper, 'name' | 'length', { value, configurable: true })`. The property already exists, so unspecified attributes (`writable: false`, `enumerable: false`) are retained, which is exactly what built-ins do.
2. Default `name` and `length` to the original's, but allow overrides (a debounced function might want the name `debounced(save)`).
3. **Copy own static properties** too (e.g. `fn.displayName`, `fn.cache`) using `Reflect.ownKeys`, skipping `length`, `name`, `prototype`, and others that must not be overwritten.
4. For library-grade decorators, consider a **`Proxy` with an `apply` trap** instead, which preserves everything for free.

### Implementation

```js
function preserveMeta(wrapper, original, { name = original.name, length = original.length } = {}) {
  Object.defineProperty(wrapper, 'name', { value: name, configurable: true });
  Object.defineProperty(wrapper, 'length', { value: length, configurable: true });
  return wrapper;
}

// Also copy static own properties (e.g. fn.displayName) without clobbering core keys.
function copyStatics(wrapper, original) {
  const skip = new Set(['length', 'name', 'prototype', 'arguments', 'caller']);
  for (const key of Reflect.ownKeys(original)) {
    if (skip.has(key)) continue;
    Object.defineProperty(wrapper, key, Object.getOwnPropertyDescriptor(original, key));
  }
  return wrapper;
}

// A decorator that does it right.
function withLogging(fn) {
  const wrapped = function (...args) {
    console.log(`-> ${fn.name}`, args);
    const out = fn.apply(this, args);
    console.log(`<- ${fn.name}`, out);
    return out;
  };
  return copyStatics(preserveMeta(wrapped, fn, { name: `withLogging(${fn.name})` }), fn);
}

// Proxy alternative: name, length, and statics are forwarded automatically.
const withLoggingProxy = (fn) =>
  new Proxy(fn, {
    apply(target, thisArg, args) {
      console.log(`-> ${target.name}`, args);
      return Reflect.apply(target, thisArg, args);
    },
  });
```

```javascript
// Usage and verification
function errorHandler(err, req, res, next) { /* ... */ }

const bad = (...a) => errorHandler(...a);
bad.length;                      // 0   (Express would NOT treat this as error middleware)

const good = preserveMeta((...a) => errorHandler(...a), errorHandler);
good.length;                     // 4
good.name;                       // "errorHandler"

curry(withLogging(add))(1)(2);   // works: wrapper reports add's real arity
```

### Real use cases
- **Express/Koa middleware wrappers** (`asyncHandler(fn)`) must preserve `length` so the framework classifies the handler correctly.
- **Debounce/memoize/once/retry decorators** that should remain curryable and introspectable.
- **Observability:** APM tools and logs that display `fn.name`.
- **Test frameworks and DI containers** that read arity.

### Trade-offs and edge cases
- **`Function.prototype.toString()` can't be preserved.** It always returns the wrapper's source. Anything that parses function source (some DI frameworks) will still see the wrapper.
- **`Proxy` vs wrapper:** a proxy forwards `name`, `length`, statics, and works with `new`, but `proxy !== original` (identity checks fail), and it adds a small call overhead and extra debugging indirection. A plain wrapper plus `defineProperty` is cheaper and more explicit.
- **Constructors/classes:** wrapping a class in a plain function loses `prototype`, `new.target` semantics, and `instanceof`. Use a `Proxy` with `construct`, or subclass instead of wrapping.
- **Minification mangles `fn.name`.** Never put *business logic* on `name` (routing, DI by name). Use it for diagnostics only, or use an explicit registry key.
- **Declared `length` can be a lie.** For a wrapper over a variadic function, you may *want* a different `length`. The override parameter exists for that case.
- **Mutating the original** (adding properties to it) is a side effect. Wrappers should leave the original untouched and copy forward.

---

## Cheat Sheet

| # | Key idea | The one sentence to say in the interview |
|---|---|---|
| 1 | Symbol placeholder + sorted hole indices | "State is immutable `slots` plus `holes`; new args fill holes left to right, and I'm ready when no hole sits below arity." |
| 2 | `Map` insertion order as LRU + lazy TTL | "Re-insert on hit to move to the tail, evict `keys().next()` on overflow, and expire lazily by timestamp so there are no timers." |
| 3 | Closures, `this`/args forwarding, define semantics first | "I'd pin down the exact call-count semantics and failure policy before writing anything." |
| 4 | `pendingArgs` as the single source of truth | "Latest args win; `flush` runs the pending call now, `cancel` drops it; I'd add `maxWait` in production." |
| 5 | Promise-chain tail with a swallowed copy | "Chain on `tail`, keep the chain alive with `catch`, and generalize to a limiter with backpressure." |
| 6 | `map` passes `(value, index, array)` | "`index` becomes `radix`: 0 means auto, 1 is invalid, and 2 rejects `'3'`. Use `Number` or pass radix 10." |
| 7 | `length`/`name` are configurable, not writable | "`defineProperty` on `name` and `length`, copy statics, and consider a `Proxy` for library-grade decorators." |
