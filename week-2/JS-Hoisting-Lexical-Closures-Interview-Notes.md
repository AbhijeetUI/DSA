# JavaScript Deep Dive #2 — Interview Revision Notes

### Hoisting · Temporal Dead Zone · Lexical Environment · Lexical Scoping · Closures

> Continuation of the JS internals series (builds directly on Execution Context / Call Stack / Event Loop from Session 1). Rewritten as staff-level interview prep — the _why_, not just the _what_, plus every trick question raised live.

---

## 0. How This Session Connects to Session 1

```
Execution Context (from Session 1)
        │
        ├── Phase 1: Memory Creation  ───▶  HOISTING happens here
        │
        └── Phase 2: Code Execution   ───▶  values get assigned, functions invoked

Every Execution Context also owns a LEXICAL ENVIRONMENT
        │
        ├── Environment Record        ───▶  the actual variables/functions in this scope
        └── Outer Lexical Environment reference ───▶  pointer to parent scope

A function that keeps a live reference to its Lexical Environment
after its own Execution Context has been destroyed  ───▶  CLOSURE
```

---

## 1. Hoisting

### 1.1 Definition (say this exact shape in an interview)

> _"Hoisting is JavaScript's behavior of processing declarations before executing the code — it is a side effect of how JavaScript builds the Execution Context. During the memory creation phase, JavaScript already knows about all variables and functions, before it starts actually running any code."_

### 1.2 The #1 misconception to explicitly avoid

> ❌ **"Hoisting moves your code to the top of the file."**
> This is technically wrong, and saying it out loud in an interview to an interviewer who knows better will make you sound junior.

✅ **What's actually true:** Nothing moves. Memory is simply **allocated and identifiers are registered upfront**, during the memory creation phase, _before_ the code execution phase begins. This is why a function can be called before its textual definition, and why variables are "known" to exist even before the line that declares them runs.

### 1.3 Why hoisting exists at all

- JavaScript's two-phase execution model (Memory Creation → Code Execution) requires the engine to know, in advance, **which identifiers exist and what scope they belong to**, so that:
  - Functions can call each other regardless of declaration order.
  - Scope resolution is predictable and can be computed once, upfront.
- **Practical value, from a decade+ engineer's perspective:** Variable hoisting itself gives you almost no benefit as a developer. The _real_ value of hoisting is that **function declarations can be called from anywhere** in the file — this matters because JavaScript is not a strictly class-bound OOP language (unlike Java, where everything lives inside a class boundary); hoisting is the mechanism that lets you reference functions across a file without needing them pre-declared.

### 1.4 Hoisting by Declaration Type

**`var`**

```js
console.log(a); // undefined — NOT a ReferenceError
var a = 10;
console.log(a); // 10
```

- `var` is hoisted **and initialized with `undefined`** during the memory creation phase.
- Once execution reaches the assignment line, the real value is set.

**`let` / `const`**

```js
console.log(b); // ❌ ReferenceError: Cannot access 'b' before initialization
let b = 20;
```

- `let` and `const` **are** hoisted (a common misconception is that they aren't — they _are_), but they are **not initialized**. They remain inaccessible until their declaration line executes — this window is the **Temporal Dead Zone** (see §2).
- Same behavior applies to `const`.

**Function Declarations**

```js
sayHi(); // works — prints "Hi"
function sayHi() {
  console.log("Hi");
}
```

- Fully hoisted — both the reference **and** the function body are available before execution reaches the declaration. Callable from above or below.

**Function Expressions (including Arrow Functions)**

```js
sayHello(); // ❌ TypeError: sayHello is not a function
var sayHello = function () {
  console.log("Hi");
};
```

- **Function expressions follow _variable_ hoisting rules, not function hoisting rules** — this is the key insight.
- With `var`: the variable `sayHello` is hoisted and initialized to `undefined`. Calling `undefined()` throws `TypeError: sayHello is not a function`.
- With `let`/`const`: you instead get a `ReferenceError` (TDZ) — same as any other `let`/`const` variable.
- **Arrow functions are never hoisted** in the "callable early" sense — because they are function expressions, they inherit whatever hoisting behavior their declaring keyword (`var`/`let`/`const`) provides, which is _not_ the same as a full function declaration.

### 1.5 Hoisting Summary Table

| Declaration                                    | Hoisted?                                        | Initial value                                   | Accessible before declaration line?         |
| ---------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| `var`                                          | Yes                                             | `undefined`                                     | Yes (but value is `undefined`)              |
| `let`                                          | Yes                                             | _Not initialized_ (TDZ)                         | No — `ReferenceError`                       |
| `const`                                        | Yes                                             | _Not initialized_ (TDZ)                         | No — `ReferenceError`                       |
| Function declaration (`function foo(){}`)      | Yes, fully                                      | Entire function body                            | Yes — fully callable                        |
| Function expression (`var foo = function(){}`) | Only the variable, per `var`/`let`/`const` rule | `undefined` (if `var`) / TDZ (if `let`/`const`) | No — either `TypeError` or `ReferenceError` |

### 1.6 Why does `var` behave differently from `let`/`const`?

Historically, `var` being auto-initialized to `undefined` was effectively a quirk from JavaScript's earliest design — by the time it was recognized as problematic, too many applications already depended on that behavior, so it couldn't be removed. `let` and `const` were introduced later specifically to fix this class of problem (accidental use of a not-yet-meaningfully-initialized variable) via the Temporal Dead Zone.

### 1.7 Hoisting granularity

Hoisting doesn't happen "line by line" globally — it happens **per Execution Context**. Every function call gets its own Execution Context, and hoisting is scoped to whichever context is being created (Global EC or that specific Function EC).

---

## 2. Temporal Dead Zone (TDZ)

### 2.1 What it actually is (correct the common misconception first)

> ❌ There is **no special "zone" that exists in memory.**
> ✅ TDZ is **a state of a binding** — specifically, the time window between when a scope is entered (hoisting happens) and when a `let`/`const` variable is actually initialized with a value.

If naming it yourself, "temporal time-frame" would arguably be a more accurate name than "zone" — but "Temporal Dead Zone" is the term to use in interviews since that's the accepted vocabulary.

```
[ block/scope starts ]  ─────────────────────▶  [ let/const declaration line executes ]
        ▲                        TDZ                              ▲
        │                (variable exists but                     │
        │                 cannot be accessed)                     │
   hoisting happens here                              variable becomes usable here
```

### 2.2 Key properties

- The variable **exists** (memory reference is registered) but **cannot be accessed** — this is by design, to prevent accidental use before a real value is assigned.
- TDZ begins at the start of the enclosing block/scope and ends the instant the variable's own initializer runs.
- Applies to `let` and `const` — **not** to `var`, because `var` is auto-initialized to `undefined` immediately during the memory creation phase (see §1.6 for why this historical inconsistency exists).

---

## 3. Lexical Environment

### 3.1 Formal definition (memorize precisely)

> _"A lexical environment is an internal JavaScript data structure that stores variable and function bindings (references), and is used to resolve identifiers according to lexical scope rules."_

- Every Execution Context is associated with (at least) **one** lexical environment.
- A lexical environment holds exactly two things:

| Component                               | What it holds                                                                                                         |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Environment Record**                  | The actual variables, functions, and parameter bindings that exist _in this scope_                                    |
| **Outer Lexical Environment reference** | A pointer to the parent scope's lexical environment (or `null` for the Global Execution Context, which has no parent) |

### 3.2 Visualizing the chain

```js
function A() {
  let b = 10;
  function C() {
    console.log(b);
  }
  return C;
}
```

```
┌─────────────────────────────┐
│ Global Execution Context     │
│  Environment Record: {}      │
│  Outer reference: null       │◀────────────────┐
└─────────────────────────────┘                  │
                                                    │
┌─────────────────────────────┐                  │
│ Function A's Lexical Env     │                  │
│  Environment Record: { b:10 }│                  │
│  Outer reference:  ──────────┼──────────────────┘
└─────────────────────────────┘
             ▲
             │
┌─────────────────────────────┐
│ Function C's Lexical Env     │
│  Environment Record: {}      │
│  Outer reference:  ──────────┼──── points to A's lexical env
└─────────────────────────────┘
```

- You can loosely visualize this outer-reference chain **like a linked list** for intuition — but note this is _not_ a literal linked-list data structure in the spec; it's conceptual.
- **A nested function has access to its parent's lexical environment even before it is ever called or returned** — this access is a _capability_ granted at creation time, not something that depends on whether/how the function is later invoked.

### 3.3 Lexical Environment vs Execution Context — the critical distinction

|              | Execution Context                                                                                               | Lexical Environment                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Purpose      | Controls **execution** — the "box" holding everything needed to run a block of code (memory + execution phases) | Controls **scope / identifier resolution** — knows what variables/functions exist and where to look next |
| Lifetime     | **Destroyed immediately** once its code finishes executing (popped off the call stack)                          | **Persists in memory as long as something still references it**                                          |
| Relationship | Uses its associated lexical environment to resolve variable names during execution                              | Is _used by_ the execution context; doesn't itself "execute" anything                                    |

> **The single most important line from this session:**
> _"Execution context will be removed as soon as that block of code completes execution — but the lexical environment will stay alive as long as there are still references to it."_

This is **not** magic — a lexical environment, underneath, is just a memory location like any other object. As long as **something, somewhere** still holds a reference to it (e.g., a pending promise sitting in a microtask/macrotask queue, or a closure), the garbage collector will not reclaim it. Once every reference is gone, it becomes eligible for garbage collection — same principle as any other JS memory management.

### 3.4 Real memory-leak example (this is genuinely interview-gold)

> Scenario: You're on Page A. A `useEffect` fires an API call that takes ~10 seconds. Before it resolves, the user navigates to Page B.

- "Pages" are a **logical concept for humans** — not necessarily a hard runtime boundary the browser enforces automatically for you (e.g. in an SPA).
- The in-flight promise from Page A's API call still holds a reference to its lexical environment (the variables/closures it needs to process the eventual response).
- Even though you're now on Page B and none of that data is logically needed anymore, **the reference is still alive**, so the memory tied to Page A's lexical environment **cannot be garbage collected** — this is a textbook memory leak.
- **Contrast case (no leak):** if the call stack, microtask queue, and macrotask queue are all fully empty by the time you navigate away, there's nothing left holding a reference — nothing leaks.

**Practical takeaway:** always think about "what still has a reference to this?" — not "did I navigate away?" — when reasoning about React `useEffect` cleanup, pending fetches, subscriptions, timers, etc.

---

## 4. Lexical Scoping

### 4.1 The rule

> _"Scope is determined by **where code is written**, not by where a function is called from."_

```js
let a = 20; // global

function outer() {
  let a = 10; // outer scope
  function inner() {
    console.log(a); // looks up the CHAIN of where it was WRITTEN
  }
  return inner;
}

outer()(); // 10 — resolved via lexical (write-time) location, not call-time
```

### 4.2 Resolution algorithm ("scope chain lookup")

```
Looking for variable "a" inside inner():
   1. Check inner()'s own Environment Record        → not found
   2. Walk to outer reference → outer()'s Env Record → found? use it. Else continue...
   3. Walk to outer reference → Global Env Record    → found? use it. Else...
   4. ReferenceError: a is not defined
```

- This chain-walk continues **outward** until the identifier is found or the chain terminates at the Global Execution Context's `null` outer reference (in which case: `ReferenceError`).
- Whichever scope in the chain **first** defines the variable "wins" — a variable of the same name declared further out is shadowed.

---

## 5. Closures

### 5.1 Definition

> _"A closure is formed when a function retains access to a variable (and its lexical environment) from an outer scope, even after that outer function has finished executing."_

### 5.2 The classic counter example

```js
function outer() {
  let count = 0;
  function increment() {
    count++;
    console.log(count);
  }
  return increment;
}

const counter = outer();
counter(); // 1
counter(); // 2
counter(); // 3
```

- `outer()` is called once, returns `increment`, and — from a call-stack perspective — is technically **finished / gone**.
- Yet every call to `counter()` still correctly increments the _same_ `count` variable.
- **Why:** `increment` retained a reference to `outer`'s lexical environment. The lexical environment is not destroyed just because `outer`'s Execution Context was popped off the stack — it lives on because `increment` still references it.

### 5.3 "Is a simple global-variable access also technically a closure?"

```js
let a = 10;
function test() {
  console.log(a);
}
```

- **By strict definition: yes**, this is technically a closure too (an inner function accessing a variable from an outer lexical scope).
- **Interview advice:** don't lead with this example — it's _technically correct but weak_. Use the more convincing "outer function has already returned, and the inner function still holds a reference" version (the counter example) to demonstrate real understanding.

### 5.4 Closures ≠ copying values

- A closure does **not** capture a snapshot/copy of a variable's value at creation time.
- It captures a **reference** to the variable's memory location. Whatever the value is _at the time the closure actually executes_ is what gets used.
- This is exactly why the classic `for (var i ...)` + `setTimeout` interview question behaves the way it does:
  - With `var`: all callbacks share **one** memory location (function-scoped), so by the time any timeout fires, they all read the same final value.
  - With `let`: each loop iteration gets its **own** block-scoped binding/memory location, so each closure captures a distinct value.

### 5.5 Practical, real-world uses of closures (use these in interviews, not the counter example)

**1. Config/URL-builder pattern**

```js
function formURLs() {
  const baseURL = "https://careerwithvasanth.com";

  function loginURL() {
    return baseURL + "/login";
  }
  function registrationURL() {
    return baseURL + "/register";
  }

  return { loginURL, registrationURL };
}

const { loginURL, registrationURL } = formURLs();
```

- `loginURL` and `registrationURL` both close over `baseURL`, sharing config without needing to pass it around explicitly or expose it globally.

**2. React parent → child prop closures**

- Whenever a parent component passes a function or variable down as a prop, and the child accesses the parent's scope through it — that access works **only because of closures**. This is the mechanism underpinning the entire React parent/child data-flow model for callbacks.

**3. Event handlers referencing component state**

- Any event handler that reads component state is also, technically, forming a closure over that state at the time the handler was created — this is directly relevant to the classic "stale closure" bug category in React (`useEffect`/handlers capturing an old value of state).

---

## 6. Quiz Walkthroughs (do these until they're automatic)

### Quiz 1 — `var` function-scope vs `let` block-scope

```js
let rate = 10;

function getRate() {
  if (rate === undefined) {
    var rate = 6;
  }
  return rate;
}

console.log(getRate());
```

**Naive first guess (most people, including experienced engineers, get this wrong the first time):** `10`
**Actual answer:** `6`

**Why:**

- `var rate = 6` inside the `if` block is **function-scoped**, not block-scoped. Because of hoisting, `var rate` is hoisted to the **top of the entire `getRate` function**, not just the `if` block, and initialized to `undefined`.
- So at the moment `if (rate === undefined)` is evaluated, the **local** `rate` (hoisted, `undefined`) shadows the outer global `rate = 10` entirely — the function never even looks at the global variable.
- `rate === undefined` → `true` → enters the `if` block → `rate` is now assigned `6` → returned.

**Now swap `var` for `let`:**

```js
let rate = 10;
function getRate() {
  if (rate === undefined) {
    let rate = 6; // BLOCK-scoped now
  }
  return rate;
}
console.log(getRate()); // 10
```

- `let rate` inside the `if` block is confined to that block only — it does **not** shadow the outer `rate` outside the `if` block.
- So `rate === undefined` resolves against the **global** `rate` (10) → `false` → skips the `if` block entirely → `return rate` resolves to the global `rate` = `10`.

**Bonus variant — remove the outer global `rate` entirely, keep `let` inside:**

```js
function getRate() {
  if (rate === undefined) {
    let rate = 6;
  }
  return rate;
}
console.log(getRate());
// ❌ ReferenceError: rate is not defined
```

- No global `rate` exists, and the `let rate` inside the `if` block isn't visible outside it → `return rate` fails entirely.

**Key lesson:** `var` is function-scoped (hoists to the top of the enclosing _function_), `let`/`const` are block-scoped (hoist only to the top of the enclosing _block_, and sit in TDZ until their line runs). This single distinction is what flips the answer between `6`, `10`, and a `ReferenceError`.

### Quiz 2 — nested `var` shadowing

```js
function outer() {
  console.log(x); // ?
  var x = 1;
  function inner() {
    var x = 2;
    console.log(x); // ?
  }
  inner();
}
outer();
```

**Answer: `undefined`, then `2`**

- Inside `outer`, `var x` is hoisted to the top of `outer`'s function scope → `undefined` at the first `console.log(x)`.
- `inner()` has its **own** `var x` in its **own** function scope — completely separate memory location from `outer`'s `x`. It logs `2`.

### Quiz 3 — closure formed even without a strict "outer function returns inner"

Revisit §5.3 — even a plain global-variable read inside a function technically satisfies the closure definition, but is not the example to lead with in an interview.

---

## 7. Quick-Reference Summary

| Concept                                  | One-liner                                                                                                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hoisting                                 | Memory + identifier registration happens **before** code execution; nothing physically "moves."                                                                       |
| `var` hoisting                           | Hoisted **and** initialized to `undefined`; function-scoped.                                                                                                          |
| `let`/`const` hoisting                   | Hoisted but **not initialized**; block-scoped; inaccessible until declared (TDZ).                                                                                     |
| Function declarations                    | Fully hoisted — callable from anywhere in scope.                                                                                                                      |
| Function expressions / arrow functions   | Follow the hoisting rule of their declaring keyword (`var`/`let`/`const`), **not** function-declaration hoisting.                                                     |
| TDZ                                      | A _time window_ (state of a binding) between scope entry and initialization — not a memory "zone."                                                                    |
| Lexical Environment                      | Data structure per Execution Context: `{ Environment Record, Outer reference }`. Resolves identifiers via the scope chain.                                            |
| Lexical Scoping                          | Scope is fixed by **where code is written**, not by where/how it's called.                                                                                            |
| Execution Context vs Lexical Environment | EC dies the instant its code finishes; Lexical Environment survives as long as _something_ references it.                                                             |
| Closures                                 | A function retaining a live reference to its outer lexical environment after the outer function has finished executing. Captures **references**, not value snapshots. |
| Memory leaks via closures                | Happen when a pending async operation (promise, timer, subscription) still references a lexical environment nobody logically needs anymore.                           |

---

## 8. Rapid-Fire Interview Q&A

**Q: What is hoisting, precisely?**
A: A side effect of JavaScript's two-phase execution model — during the memory creation phase, the engine registers all variable/function identifiers and allocates memory for them, before the code execution phase runs. Nothing is physically relocated in the source.

**Q: Are `let` and `const` hoisted?**
A: Yes — a common misconception says they aren't. They _are_ hoisted, but left uninitialized until their declaration line executes (Temporal Dead Zone).

**Q: What is the Temporal Dead Zone, really?**
A: Not a memory "zone" — it's a state of a binding: the time window between a scope being entered (hoisting) and a `let`/`const` variable actually being initialized.

**Q: Why does `var` not have a TDZ but `let`/`const` do?**
A: Historical/legacy reasons — `var`'s auto-initialization to `undefined` was an early design decision that couldn't be removed once apps depended on it; `let`/`const` were introduced later specifically to close that gap.

**Q: Do function expressions get hoisted the same way as function declarations?**
A: No — function expressions (including arrow functions) follow the hoisting rules of the variable they're assigned to (`var`/`let`/`const`), not full function-declaration hoisting. Calling one before its assignment line throws `TypeError` (`var`) or `ReferenceError` (`let`/`const`).

**Q: What exactly is a lexical environment?**
A: An internal data structure attached to every Execution Context, consisting of an Environment Record (the actual variables/functions in that scope) and a reference to the outer/parent lexical environment, used to resolve identifiers.

**Q: Does scope depend on where a function is called from?**
A: No — lexical scope is determined entirely by where the code is **written**, not by the call site.

**Q: If an Execution Context is destroyed, why can a callback still access its variables later?**
A: Because the _Execution Context_ and the _Lexical Environment_ are different things with different lifetimes. The EC is destroyed as soon as its code finishes; the lexical environment persists in memory as long as something (like a pending closure/callback) still references it.

**Q: What is a closure, formally?**
A: A function that retains access to variables from its lexical environment even after the outer function that created that environment has finished executing.

**Q: Does a closure copy the variable's value, or keep a live reference?**
A: A live reference — whatever the variable's value is _at the time the closure actually runs_ is what gets used, not a frozen snapshot from creation time.

**Q: Give a real memory-leak example caused by closures.**
A: A pending API call (e.g., inside a React `useEffect`) that hasn't resolved yet, whose promise still holds a reference to its lexical environment/variables, while the user has already navigated to a different page that no longer needs that data — the reference keeps that memory alive unnecessarily.

**Q: Is `let rate = 6` inside an `if` block visible outside that block?**
A: No — `let`/`const` are block-scoped. Only `var` would hoist to the entire enclosing function and remain visible outside the `if` block (with value `undefined` until assigned).

---

## 9. What to Say Out Loud in an Interview (elevator-pitch versions)

- _"Hoisting isn't code moving upward — it's the engine pre-registering identifiers and allocating memory during the execution context's memory-creation phase, before any code actually runs."_
- _"`let` and `const` are hoisted too — they're just left uninitialized in the Temporal Dead Zone until their declaration line executes, which is why accessing them early throws a ReferenceError instead of returning undefined."_
- _"A lexical environment and an execution context are different lifetimes — the execution context dies the moment its code finishes, but the lexical environment survives as long as something still references it, which is exactly the mechanism a closure relies on."_
- _"A closure isn't just 'a function inside a function' — it's specifically a function that keeps a live reference to its outer scope's variables even after that outer scope's execution context is gone, and it always reads the current value at call-time, not a frozen snapshot."_
- _"Scope is determined lexically — by where the code is physically written — never by where or how a function happens to be invoked."_
