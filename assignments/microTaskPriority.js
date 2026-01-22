//Technical Round: The Microtask Priority Riddle**

// **Question:** Predict the exact output. Explain why the `asyncFn` behaves differently than a standard promise chain.

console.log("1 - Sync");

setTimeout(() => {
  console.log("2 - Macrotask");
}, 0);

async function asyncFn() {
  console.log("3 - Inside Async");
  await Promise.resolve();
  console.log("4 - After Await");
}

asyncFn();

Promise.resolve().then(() => {
  console.log("5 - Microtask");
});

console.log("6 - Sync End");

/*
Key Difference: await pauses function execution until promise resolves, then schedules the rest as a microtask.
Detailed timeline: 

TIME | EVENT                          | OUTPUT
─────┼────────────────────────────────┼─────────────────
  1  | Execute: console.log('1')      | 1 - Sync
  2  | Call: asyncFn()                |
  3  | Execute: console.log('3')      | 3 - Inside Async
  4  | Hit: await Promise.resolve()   | (pause & schedule)
  5  | Execute: console.log('6')      | 6 - Sync End
  6  | Call Stack empty               |
  7  | Execute Microtask #1           | 4 - After Await
  8  | Execute Microtask #2           | 5 - Microtask
  9  | Microtask Queue empty          |
  10 | Execute Macrotask #1           | 2 - Macrotask

┌──────────────────────────────────────┐
│         EVENT LOOP                   │
├──────────────────────────────────────┤
│                                      │
│  ┌─ CALL STACK (runs first)         │
│  │  1 - Sync                        │
│  │  3 - Inside Async                │
│  │  6 - Sync End                    │
│  └─                                 │
│                                      │
│  ┌─ MICROTASK QUEUE (runs second)   │
│  │  4 - After Await                 │
│  │  5 - Microtask                   │
│  └─                                 │
│                                      │
│  ┌─ MACROTASK QUEUE (runs last)     │
│  │  2 - Macrotask                   │
│  └─                                 │
│                                      │
└──────────────────────────────────────┘

Key Insights:
✅ await = Pause + Schedule Microtask (higher priority than setTimeout)
✅ Promise.then() = Microtask (same priority as await)
✅ setTimeout = Macrotask (lowest priority)
✅ Always drain microtask queue BEFORE macrotask
*/
