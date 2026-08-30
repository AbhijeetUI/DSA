# Event Loop Visual Reference Card

**Print this out and study during breaks!**

---

## 📊 EXECUTION ORDER AT A GLANCE

```
YOUR CODE:
┌─────────────────────────────────────┐
│ console.log("1 - Sync")             │ ← SYNCHRONOUS
│ setTimeout(() => ..., 0)            │ ← Queued to MACROTASK
│ asyncFn() { console.log("3")... }   │ ← Function call: prints "3" sync
│   await Promise.resolve()           │ ← Queued to MICROTASK
│ Promise.resolve().then(...)         │ ← Queued to MICROTASK
│ console.log("6 - Sync End")         │ ← SYNCHRONOUS
└─────────────────────────────────────┘

EXECUTION:
┌──────────────────────────────────────────────────────┐
│ PHASE 1: CALL STACK                                  │
│ Prints: 1, 3, 6                                      │
├──────────────────────────────────────────────────────┤
│ PHASE 2: MICROTASK QUEUE (FIFO)                      │
│ Prints: 4, 5                                         │
├──────────────────────────────────────────────────────┤
│ PHASE 3: MACROTASK QUEUE                             │
│ Prints: 2                                            │
└──────────────────────────────────────────────────────┘

FINAL OUTPUT: 1 3 6 4 5 2
```

---

## 🎯 THE ALGORITHM (One Page)

```javascript
while (eventLoop.hasWork()) {
  // 1️⃣ EXECUTE ALL SYNCHRONOUS CODE
  while (callStack.hasCode()) {
    execute(callStack.pop());
    // Executes in LIFO order
  }

  // 2️⃣ PROCESS ALL MICROTASKS (DRAIN COMPLETELY)
  while (microtaskQueue.hasTasks()) {
    microtask = microtaskQueue.shift(); // FIFO
    execute(microtask);
    // Promises, async/await, queueMicrotask()
  }

  // 3️⃣ BROWSER PAINTS IF NEEDED
  if (timeForRepaint) {
    paint(); // 60fps target
  }

  // 4️⃣ PROCESS ONE MACROTASK
  if (macrotaskQueue.hasTasks()) {
    macrotask = macrotaskQueue.shift();
    execute(macrotask);
    // setTimeout, setInterval, I/O

    // GO BACK TO STEP 2️⃣ AFTER EACH MACROTASK!
  }
}
```

**KEY INSIGHT**: After EVERY macrotask, check microtasks again!

---

## 📋 WHAT GOES WHERE

| Code                      | Queue      | Timing        | Example                          |
| ------------------------- | ---------- | ------------- | -------------------------------- |
| Direct execution          | CALL STACK | Immediately   | `console.log("hi")`              |
| `.then()` callback        | MICROTASK  | After sync    | `Promise.resolve().then()`       |
| `async/await` after await | MICROTASK  | After sync    | `await something; console.log()` |
| `queueMicrotask()`        | MICROTASK  | After sync    | `queueMicrotask(() => {})`       |
| `setTimeout` callback     | MACROTASK  | Last          | `setTimeout(() => {}, 0)`        |
| `setInterval` callback    | MACROTASK  | Last          | `setInterval(() => {})`          |
| I/O callbacks             | MACROTASK  | Last          | Network, file read               |
| Animation frame           | SPECIAL    | Sync to paint | `requestAnimationFrame()`        |

---

## ⚡ QUICK DECISION MATRIX

```
Need code to run?

├─ RIGHT NOW?
│  └─ Write it directly (no delay)
│
├─ BEFORE NEXT FRAME?
│  ├─ Data-dependent (promise-based)?
│  │  └─ Use: .then() or async/await
│  │
│  └─ Not promise-based?
│     └─ Use: queueMicrotask()
│
├─ AFTER RENDERING?
│  ├─ Animation?
│  │  └─ Use: requestAnimationFrame()
│  │
│  └─ Deferred work?
│     └─ Use: setTimeout()
│
└─ POLLING/REPEATED?
   └─ Use: setInterval()
```

---

## 🚨 THE TRICKY PARTS

### ❌ FALSE: "setTimeout(fn, 0) runs immediately"

### ✅ TRUE: "setTimeout(fn, 0) runs in next macrotask cycle"

```
setTimeout(() => console.log("B"), 0);  // Runs LAST
Promise.resolve().then(() => console.log("A"));  // Runs FIRST
// Output: A, B
```

---

### ❌ FALSE: "async/await is faster than promises"

### ✅ TRUE: "Both use the same microtask queue"

```
async function test() { await x; }  // Microtask
test();
Promise.resolve().then(() => {});  // Also microtask
// Both execute in microtask phase
```

---

### ❌ FALSE: "More microtasks = better performance"

### ✅ TRUE: "Fewer repaint cycles = better performance"

```
// BAD: 10 repaint cycles
for (let i = 0; i < 10; i++) {
  Promise.resolve().then(() => updateDOM());
}

// GOOD: 1 repaint cycle
Promise.all(items.map(item => updateDOM(item)))
  .then(() => render());
```

---

## 💼 WHY COMPANIES CARE

| Company     | Why They Care                  | Impact            |
| ----------- | ------------------------------ | ----------------- |
| **Netflix** | Atomic recommendation loading  | No UI flicker     |
| **Uber**    | Race-free booking confirmation | No double-booking |
| **Airbnb**  | Smooth infinite scroll         | 60fps performance |
| **Google**  | Core Web Vitals compliance     | SEO ranking       |
| **Amazon**  | Shopping cart consistency      | No lost items     |

All these problems are solved by understanding the event loop!

---

## 🗣️ WHAT TO SAY (Exact Phrases)

### When explaining output order:

> "The JavaScript event loop processes three queues in priority order:
> first all synchronous code, then the entire microtask queue (promises),
> then one macrotask (timer). This ensures promise chains complete
> before rendering, preventing race conditions."

### When asked why it matters:

> "This design ensures data consistency. At Netflix, we can load
> personalized recommendations atomically using promises, without
> risking a UI flicker or state corruption."

### When asked to optimize:

> "I'd batch state updates into the microtask queue using Promise.all(),
> then do a single DOM update. This gives us one repaint cycle instead
> of multiple, improving performance significantly."

---

## 🧠 MEMORY TRICKS

### MICROTASK = MICRO = FAST

- Must finish before rendering
- Promises (data operations)
- Async/await

### MACROTASK = MACRO = SLOW

- Can wait for rendering
- Timers (deferred operations)
- I/O operations

### The Phrase:

**"Micro first, then Macro, then back to Micro"**

---

## 📊 TIMING VISUALIZATION

```
Timeline:
0ms  ─┬─ Sync Code
      │
1ms  ─┼─ [Microtask Queue Drains]
      │
2ms  ─┼─ Browser Paints (if needed)
      │
3ms  ─┼─ [Macrotask 1 Executes]
      │
4ms  ─┼─ [Microtask Queue Drains Again]
      │
5ms  ─┼─ Browser Paints (if needed)
      │
6ms  ─└─ [Macrotask 2 Executes]
      └─ Loop repeats...

KEY: Microtasks = Sub-1ms, Macrotasks = Deferred
```

---

## ✅ 5-MINUTE PRE-INTERVIEW CHECKLIST

- [ ] Recite output from memory: `1 3 6 4 5 2`
- [ ] Draw queue diagram without notes
- [ ] Explain one production scenario (Netflix/Uber)
- [ ] Answer: "Why setTimeout(0) isn't instant?"
- [ ] Know the algorithm by heart
- [ ] Have one debugging technique ready
- [ ] Confident tone is ready

---

## 📞 EXPECTED QUESTIONS & YOUR ANSWER

| Question                     | Your Answer                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| **What's the output?**       | "1, 3, 6, 4, 5, 2. Sync first, then microtasks, then macrotasks."                          |
| **Why that order?**          | "Event loop drains entire microtask queue before processing macrotasks."                   |
| **When to use promises?**    | "When you need guaranteed atomic operations, like loading data before rendering."          |
| **When to use setTimeout?**  | "For deferred non-critical work, like analytics or background polling."                    |
| **How to optimize?**         | "Batch updates in microtask queue, reduce repaint cycles."                                 |
| **What's a race condition?** | "When multiple async operations complete in unexpected order, causing inconsistent state." |

---

## 🔥 THE GOLDEN EXPLANATION (2 Minutes)

```
"The event loop has three execution phases:

1. CALL STACK: All synchronous code runs immediately
   This is where direct statements execute, blocking everything.

2. MICROTASK QUEUE: Promises and async/await continuations
   This ensures promise chains complete atomically, preventing
   race conditions. Critical for data consistency.

3. MACROTASK QUEUE: Timers and I/O callbacks
   This allows the browser to repaint between tasks, keeping
   the UI responsive.

Even setTimeout(..., 0) waits for the entire microtask queue.
This is by design—it ensures your promise chains complete
before anything else happens.

At Netflix, this is how we load personalized recommendations
without race conditions or UI flickers. The event loop gives
us predictable, reliable async execution."
```

---

## 🎯 CONFIDENCE LEVELS

**Before studying**: "I know async/await works but not sure why the order"
**After reading explanation**: "I understand the queues and ordering"
**After practicing**: "I can explain it to anyone"
**After this card**: "I'm ready for the interview!" ✅

---

## 💡 FINAL PRO TIP

Don't just memorize the output!
Understand the WHY behind each step.

When the interviewer asks a follow-up question, they want to see
you REASON through it, not just recall a memorized answer.

You've got this! 🚀

---

_Print this card, put it on your wall, study it before bed_
_Review it the morning of your interview_
_Confidence level: 📈 SKYROCKETING_
