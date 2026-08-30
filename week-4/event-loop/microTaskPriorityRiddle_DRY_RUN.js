/**
 * MICROTASK PRIORITY RIDDLE - EXECUTABLE DRY RUN WITH DETAILED TRACES
 * Level: Senior/Staff Engineer
 * Use this file to demonstrate event loop understanding in interviews
 */

// ============================================================================
// VERSION 1: ORIGINAL CODE WITH EXECUTION TRACE COMMENTS
// ============================================================================
console.log("\n=== VERSION 1: ORIGINAL RIDDLE ===\n");

console.log("1 - Sync");
// TRACE: Executes immediately in call stack
// Output at this point: "1 - Sync"

setTimeout(() => {
  console.log("2 - Macrotask");
  // This callback is enqueued to MACROTASK QUEUE
  // Will execute AFTER all synchronous code + all microtasks complete
}, 0);
// TRACE: setTimeout registers timer callback to macrotask queue (not executed yet!)

async function asyncFn() {
  console.log("3 - Inside Async");
  // TRACE: This is synchronous code INSIDE an async function
  // Executes immediately when function is called
  // Output at this point: "3 - Inside Async"

  await Promise.resolve();
  // TRACE: Encountered await. The code AFTER this line becomes a microtask
  // asyncFn() returns immediately (returns a pending promise)
  // The next line schedules as a microtask continuation

  console.log("4 - After Await");
  // TRACE: This is NOT executed yet. It's scheduled as a microtask
  // Will run after all synchronous code completes + before macrotasks
}

asyncFn();
// TRACE: Function is called
// - Prints "3 - Inside Async" immediately
// - Encounters await, schedules continuation as microtask
// - Function returns immediately

Promise.resolve().then(() => {
  console.log("5 - Microtask");
  // TRACE: Promise microtask callback
  // Will execute after all sync code, along with other microtasks
});
// TRACE: Promise .then() schedules callback to MICROTASK QUEUE

console.log("6 - Sync End");
// TRACE: Executes immediately in call stack
// Output at this point: "6 - Sync End"

// ============================================================================
// EXECUTION SUMMARY AT THIS POINT:
// Call Stack is now empty after all synchronous code
// Event Loop performs: MICROTASK QUEUE → MACROTASK QUEUE
// ============================================================================

/*
CURRENT QUEUE STATE:
┌─────────────────────────────────────────┐
│          MICROTASK QUEUE                │
├─────────────────────────────────────────┤
│ 1. await Promise.resolve() continuation│
│ 2. Promise.resolve().then() callback    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          MACROTASK QUEUE                │
├─────────────────────────────────────────┤
│ 1. setTimeout callback                  │
└─────────────────────────────────────────┘

EXECUTION ORDER FROM HERE:
1. Process ALL microtasks (FIFO)
2. Check for repaint
3. Process ONE macrotask
4. Repeat
*/

// ============================================================================
// VERSION 2: STEP-BY-STEP WITH INLINE TRACING
// ============================================================================
console.log("\n\n=== VERSION 2: DETAILED STEP-BY-STEP TRACE ===\n");

let executionLog = [];

function logExecution(step, phase, description) {
  const entry = `Step ${step} [${phase}] ${description}`;
  executionLog.push(entry);
  console.log(`  > ${entry}`);
}

// Phase 1: Synchronous Execution
console.log("PHASE 1: SYNCHRONOUS CODE EXECUTION");
console.log("─".repeat(50));

logExecution(1, "SYNC", "console.log('1 - Sync')");
console.log("1 - Sync");

logExecution(2, "SYNC", "setTimeout(...) → enqueued to MACROTASK_QUEUE");
setTimeout(() => {
  console.log("2 - Macrotask");
}, 0);

logExecution(3, "SYNC", "asyncFn() called");
async function asyncFn2() {
  logExecution(3.1, "SYNC-INSIDE-ASYNC", "console.log('3 - Inside Async')");
  console.log("3 - Inside Async");

  await Promise.resolve();
  logExecution(5, "MICROTASK", "Code after await (becomes microtask)");
  console.log("4 - After Await");
}
asyncFn2();

logExecution(
  4,
  "SYNC",
  "Promise.resolve().then(...) → enqueued to MICROTASK_QUEUE",
);
Promise.resolve().then(() => {
  logExecution(5, "MICROTASK", "Promise.then() callback executes");
  console.log("5 - Microtask");
});

logExecution(6, "SYNC", "console.log('6 - Sync End')");
console.log("6 - Sync End");

console.log("─".repeat(50));
console.log("PHASE 1 COMPLETE: Call stack is now empty\n");

// Phase 2: Microtask Processing
console.log("PHASE 2: MICROTASK QUEUE PROCESSING");
console.log("─".repeat(50));
console.log("Event loop checks: 'Are there microtasks?' → YES");
console.log("Processing all microtasks before next macrotask...");
console.log("─".repeat(50));
console.log("(microtasks execute in PHASE 1 output above)");

// Phase 3: Macrotask Processing
console.log("\nPHASE 3: MACROTASK QUEUE PROCESSING");
console.log("─".repeat(50));
console.log("All microtasks done.");
console.log("Event loop checks: 'Are there macrotasks?' → YES");
console.log("Processing macrotask...");
console.log("─".repeat(50));
console.log("(macrotask executes in PHASE 1 output above)");

// ============================================================================
// VERSION 3: INTERACTIVE COMPARISON
// ============================================================================
console.log("\n\n=== VERSION 3: COMPARING DIFFERENT SCENARIOS ===\n");

console.log("Scenario A: Promise vs setTimeout");
console.log("─".repeat(50));

const startA = Date.now();
Promise.resolve().then(() => {
  console.log(`  Promise executed after ${Date.now() - startA}ms`);
});
setTimeout(() => {
  console.log(`  setTimeout executed after ${Date.now() - startA}ms`);
}, 0);

// Add a small sync task to let microtask run
let counter = 0;
while (counter < 1000000) counter++; // Busy wait

// ============================================================================
// VERSION 4: ADVANCED - MULTIPLE PROMISE CHAINS
// ============================================================================
console.log("\n\n=== VERSION 4: PROMISE CHAIN WITH MICROTASK ORDERING ===\n");

console.log("Start Promise Chain Test");

Promise.resolve()
  .then(() => {
    console.log("Promise Chain 1: Step 1");
    return "data1";
  })
  .then((data) => {
    console.log("Promise Chain 1: Step 2 (received:", data + ")");
  });

Promise.resolve().then(() => {
  console.log("Promise Chain 2: Step 1");
});

setTimeout(() => {
  console.log("Macrotask: After all promises");
}, 0);

console.log("End of sync code");

/*
EXPECTED OUTPUT:
Start Promise Chain Test
End of sync code
Promise Chain 1: Step 1
Promise Chain 2: Step 1
Promise Chain 1: Step 2 (received: data1)
Macrotask: After all promises

WHY THIS ORDER:
1. "Start..." and "End..." → Sync execution
2. All .then() callbacks queued as microtasks
3. Microtasks execute in order: Chain1-Step1, Chain2-Step1, Chain1-Step2
4. setTimeout (macrotask) executes last
*/

// ============================================================================
// VERSION 5: ASYNC/AWAIT DEEP DIVE
// ============================================================================
console.log("\n\n=== VERSION 5: ASYNC/AWAIT EXECUTION ORDER ===\n");

async function deepDive() {
  console.log("A: Before first await");

  await new Promise((resolve) => {
    console.log("B: Inside Promise constructor (sync)");
    setTimeout(() => {
      console.log("C: Inside setTimeout (macrotask)");
      resolve();
    }, 0);
  });

  console.log("D: After first await");

  await Promise.resolve();
  console.log("E: After second await");
}

console.log("X: Before calling async function");
deepDive();
console.log("Y: After calling async function");

Promise.resolve().then(() => {
  console.log("Z: Microtask promise");
});

/*
EXPECTED OUTPUT:
X: Before calling async function
A: Before first await
B: Inside Promise constructor (sync)
Y: After calling async function
Z: Microtask promise
C: Inside setTimeout (macrotask)
D: After first await
E: After second await

ANALYSIS:
- X, Y: Sync code
- A, B: Async function call, constructor is sync
- Z: Microtask
- C: setTimeout from constructor
- D, E: Resumed after awaits
*/

// ============================================================================
// VERSION 6: MIXED SCENARIO - REAL WORLD EXAMPLE
// ============================================================================
console.log("\n\n=== VERSION 6: REAL-WORLD SCENARIO (User Data Loading) ===\n");

class UserDataLoader {
  constructor() {
    this.cache = new Map();
  }

  async fetchUser(userId) {
    console.log(`[FETCH] Loading user ${userId}`);

    // Simulate API call
    const userData = await this.simulateApiCall(userId);
    console.log(`[FETCH] Got user ${userId}:`, userData);

    // Update cache
    this.cache.set(userId, userData);
    console.log(`[FETCH] Cached user ${userId}`);

    return userData;
  }

  simulateApiCall(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[API] Response for user ${userId}`);
        resolve({ id: userId, name: `User${userId}` });
      }, 0);
    });
  }
}

console.log("[APP] Initializing app");

const loader = new UserDataLoader();

console.log("[APP] Requesting users");
loader.fetchUser(1);
loader.fetchUser(2);

Promise.resolve().then(() => {
  console.log("[APP] UI State: Ready to render");
});

console.log("[APP] Waiting for data...");

/*
EXPECTED OUTPUT:
[APP] Initializing app
[APP] Requesting users
[FETCH] Loading user 1
[FETCH] Loading user 2
[APP] UI State: Ready to render
[APP] Waiting for data...
[API] Response for user 1
[FETCH] Got user 1: { id: 1, name: 'User1' }
[FETCH] Cached user 1
[API] Response for user 2
[FETCH] Got user 2: { id: 2, name: 'User2' }
[FETCH] Cached user 2

WHY:
- "[APP] ..." messages are sync
- "[APP] UI State" is microtask
- "[FETCH]" and "[API]" resume after awaits (which are in setTimeout, so macrotasks)
- Order shows clear separation: SYNC → MICROTASK → MACROTASK
*/

// ============================================================================
// QUICK REFERENCE: QUEUE VISUALIZATION
// ============================================================================
console.log("\n\n=== QUEUE VISUALIZATION ===\n");
console.log(`
┌──────────────────────────────────────────────────────┐
│           JAVASCRIPT EVENT LOOP QUEUES               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. CALL STACK (LIFO - Last In, First Out)           │
│     └─ Synchronous code execution                   │
│     └─ Function calls                               │
│     └─ Currently executing code                     │
│                                                      │
│  2. MICROTASK QUEUE (Higher Priority, FIFO)          │
│     ├─ Promise.then(), Promise.catch(), .finally()  │
│     ├─ async/await continuations                    │
│     ├─ queueMicrotask()                             │
│     └─ MutationObserver callbacks                   │
│                                                      │
│  3. MACROTASK QUEUE (Lower Priority, FIFO)           │
│     ├─ setTimeout, setInterval                      │
│     ├─ setImmediate (Node.js only)                  │
│     ├─ I/O operations                               │
│     ├─ UI events (click, scroll, etc)               │
│     └─ requestAnimationFrame (browser repaint)      │
│                                                      │
├──────────────────────────────────────────────────────┤
│ EXECUTION FLOW:                                      │
│ 1. Execute all SYNC code in Call Stack              │
│ 2. Process ALL MICROTASKS (drain queue)             │
│ 3. Browser repaints if needed                       │
│ 4. Process ONE MACROTASK                            │
│ 5. Go to Step 2 (repeat until queues empty)         │
└──────────────────────────────────────────────────────┘
`);

// ============================================================================
// PERFORMANCE TIMING DEMONSTRATION
// ============================================================================
console.log("\n=== PERFORMANCE TIMING DEMONSTRATION ===\n");

const timings = {};

timings.syncStart = performance.now();
console.log("📊 Sync code starts");

Promise.resolve().then(() => {
  timings.microtask = performance.now();
  console.log(
    `📊 Microtask executes (${(timings.microtask - timings.syncStart).toFixed(3)}ms after sync)`,
  );
});

setTimeout(() => {
  timings.macrotask = performance.now();
  console.log(
    `📊 Macrotask executes (${(timings.macrotask - timings.syncStart).toFixed(3)}ms after sync)`,
  );
}, 0);

// Busy wait to simulate sync work
for (let i = 0; i < 10000000; i++) {}

timings.syncEnd = performance.now();
console.log(
  `📊 Sync code ends (${(timings.syncEnd - timings.syncStart).toFixed(3)}ms duration)`,
);

// ============================================================================
// INTERVIEW SUMMARY
// ============================================================================
console.log("\n\n=== INTERVIEW TALKING POINTS ===\n");
console.log(`
🎯 KEY CONCEPTS TO EXPLAIN:

1. SINGLE-THREADED EXECUTION
   - JavaScript runs on a single thread
   - Callbacks are scheduled, not immediately executed
   - Order matters, and is determined by queue priority

2. TWO-TIER QUEUE SYSTEM
   - Microtasks (Promises) execute BEFORE macrotasks (timers)
   - Even setTimeout(..., 0) doesn't beat promises
   - Ensures data consistency in async chains

3. WHY IT MATTERS IN PRODUCTION
   - Netflix: Personalized recommendations loaded atomically
   - Uber: Race-free booking state updates
   - Airbnb: UI updates without flickering
   - Google: Performance-critical rendering

4. COMMON MISTAKES
   ❌ Using setTimeout for animation (use requestAnimationFrame)
   ❌ Assuming setTimeout(..., 0) is instant
   ❌ Mixing promise chains with setTimeout
   ✅ Use promises for data synchronization
   ✅ Use setTimeout for deferred non-critical work

5. DEBUGGING TIPS
   - Use Chrome DevTools: Sources → Async Stacks
   - Log with timestamps
   - Check Network panel for actual request timing
   - Use console.time() / console.timeEnd()
`);

console.log("\n✅ Execution complete. This file demonstrates:");
console.log("   • Event loop fundamentals");
console.log("   • Microtask vs Macrotask behavior");
console.log("   • Practical production scenarios");
console.log("   • Interview-ready explanations\n");
