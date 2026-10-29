# JavaScript Event Loop

## Interview Question

**Explain how the JavaScript event loop works and why it is essential for asynchronous programming.**

### Skills tested

- JavaScript runtime
- Asynchronous programming
- Browser internals
- Performance optimization

### Interview approach

1. Explain the JavaScript runtime architecture.
2. Describe the call stack and execution flow.
3. Explain browser APIs or Node.js APIs.
4. Compare the microtask queue and macrotask queue.
5. Walk through the event loop execution cycle.
6. Connect the concept to React rendering and performance.

### Follow-up questions

1. Why are microtasks executed before macrotasks?
2. What happens when `Promise.resolve()` and `setTimeout(fn, 0)` are scheduled together?
3. What is microtask starvation, and how can it affect an application?
4. How does the event loop influence React's rendering behavior?
5. Why doesn't `setTimeout(fn, 0)` execute immediately?
6. How would you debug a production application blocked by long-running JavaScript tasks?

---

## Event Loop: Interview Answer

### 30-second opening

> “JavaScript is single-threaded and synchronous by default. It can do only one thing at a time. All the asynchronous behaviour we see, like `setTimeout`, `fetch` and promises, does not come from the language itself. It comes from the browser runtime. The event loop is the algorithm that decides what goes to the call stack next.”

Vasanth stressed this point:

> “Please remember this very carefully. JavaScript is single-threaded, synchronous by default. The asynchronous part comes from the browser.”

## 1. Runtime: Engine + Browser Capabilities

In simple terms, the JavaScript runtime has two big parts:

| Part                                           | What it has                                                | Job                             |
| ---------------------------------------------- | ---------------------------------------------------------- | ------------------------------- |
| JavaScript engine (V8, JavaScriptCore, Chakra) | Memory heap and call stack                                 | Executes the code               |
| Browser capabilities                           | Web APIs, microtask queue, macrotask queue, and event loop | Handles work outside the engine |

- **Memory heap:** Where variables, objects, arrays, functions, and closures are stored. It is essentially RAM.
- **Call stack:** Holds references and executes code. It follows last in, first out (LIFO), and only one piece of code executes at a time.

> **Tip for senior developers:** When you pass an object to a function, you are passing a reference, not the object itself. Passing a big object to a utility function and getting it back is not a performance problem. Don’t shy away from it in code reviews.

## 2. Call Stack: Why Is It a “Stack”?

Interviewers may ask: “Why is the call stack a stack? Why not a queue?”

Say A calls B, and B calls C. The stack maintains the chronological order of function calls. It tells us which function to pop and where the return value should go.

It is not quite like a “pile of plates, take the top one first”: each statement executes as soon as it enters the stack. Nothing waits in the call stack.

### Execution context

In reality, individual statements do not enter the call stack; an execution context does. There are two types:

- **Global execution context:** Created once per page and sits at the bottom of the stack.
- **Function execution context:** Created every time a function is called.

Each has two phases:

1. **Memory creation:** Hoisting and allocation.
2. **Code execution:** Runs line by line.

## 3. Web APIs

> “Web APIs are not only for async things. They handle anything the JS engine cannot handle by itself.”

Examples include `setTimeout`, `setInterval`, `fetch`, the DOM, geolocation, and `localStorage`.

An interesting point from the class: `localStorage` is synchronous, yet it is a Web API. The JavaScript engine executes code; storage and timers are outside its job.

> **Common mistake:** `await localStorage.setItem(...)` in React is wrong because it is synchronous. Libraries like AsyncStorage return promises, and those can be awaited.

Another common misconception is that `setTimeout` goes directly to Web APIs. Everything first comes to the call stack. The engine sees “this I cannot handle” and offloads it to the Web API. Later, the callback comes back through the queue to the stack.

## 4. Microtask Queue vs. Macrotask Queue

| Queue           | Priority | Examples                                                                           |
| --------------- | -------- | ---------------------------------------------------------------------------------- |
| Microtask queue | Higher   | `promise.then`, `async`/`await`, `queueMicrotask`, `MutationObserver`              |
| Macrotask queue | Lower    | `setTimeout`, `setInterval`, DOM events such as `click`, `scroll`, and `mouseover` |

**MutationObserver, in simple terms:** Instead of polling, it waits for something to change. For example, a third-party chat widget might inject a button into your page, and the observer tells you when it happens.

Many people think only promises go into the microtask queue. That is not true.

## 5. Event Loop

There are two correct ways to explain it in an interview:

- **As a combination:** The call stack, Web APIs, microtask queue, and macrotask queue work together.
- **As an algorithm:** It keeps checking, “Is the call stack empty? If yes, what is the next thing to push?”

### Execution order

1. Execute everything in the call stack.
2. When the stack is empty, execute all microtasks.
3. Then execute one macrotask.
4. Repeat the cycle.

> **Correction on the order:** In the recording, this order was explained a bit quickly, and it sounds like “one microtask, then all macrotasks.” The correct version for an interview is to drain **all microtasks**, then take **one macrotask**. If all macrotasks were drained at once, newly arrived high-priority work would get stuck.

### Example: The classic interview question

```js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
```

**Output:** `A`, `D`, `C`, `B`

1. `A` and `D` are synchronous, so they print first.
2. `setTimeout` goes to the Web API, and its callback waits in the macrotask queue.
3. The promise callback goes to the microtask queue.
4. The stack is empty, so the microtask runs (`C`), then the macrotask runs (`B`).

### More facts to mention

- The event loop belongs to the browser or host, not the JavaScript engine. Node.js uses V8 but has a different event loop.
- Why isn’t it inside the engine? JavaScript is host-agnostic. It runs in browsers, Node, Deno, and embedded systems, and ECMAScript leaves the implementation open.
- Each tab has its own event loop. That is why one slow tab does not freeze the others.
- JavaScript is concurrent, not parallel. It has one thread, and the browser handles waiting work on the side.

## Follow-up Questions: Answers

### 1. Why are microtasks executed before macrotasks?

> “Honestly, there is no strict ‘why’ in the spec. Two queues were created to segregate work by priority. Promises are used for API calls and data handling, which matter more to the developer or product, so they get higher priority.”

Add this: a promise continuation is part of the current operation, so it should finish before the browser moves to something new.

### 2. What happens when `Promise.resolve()` and `setTimeout(fn, 0)` are scheduled together?

The promise callback runs first, then `setTimeout`, always. Both are asynchronous, but the promise is in the microtask queue, which has higher priority. This is the `A`, `D`, `C`, `B` example above.

### 3. What is microtask starvation?

Since all microtasks are drained before the loop moves ahead, a microtask that keeps adding new microtasks means macrotasks never run:

```js
function loop() {
  Promise.resolve().then(loop);
}

loop(); // Clicks, timers, and rendering get no chance to run.
```

The page freezes even though no single function is “long.” Fix it by yielding to the macrotask queue with `setTimeout` or `scheduler.yield()`, or by adding a limit to the loop.

### 4. How does the event loop influence React rendering?

_(Not in the transcript.)_

- Rendering is JavaScript running on the same single thread. If a component takes 300 ms to render, the browser cannot paint or handle clicks for 300 ms.
- React 18 batches state updates and flushes them together.
- With `startTransition` and `useDeferredValue`, React splits non-urgent rendering into small chunks and gives control back to the event loop in between. That is how typing stays smooth while a big list updates.
- `useEffect` runs after paint. `useLayoutEffect` runs before paint, so heavy work there blocks the screen.

### 5. Why doesn’t `setTimeout(fn, 0)` run immediately?

> “Because it’s async in nature. It goes to Web APIs, then its callback waits in the macrotask queue. It runs only after the call stack is empty and all microtasks are done. Zero is only the minimum delay, not a guarantee.”

**Practical use:** In React, people use `setTimeout(0)` to run something after the component mounts and everything else has finished.

A question from the class: If `sayHi()` contains a `setTimeout`, does `sayHi`’s execution context wait for it? No. `sayHi` finishes and is popped immediately. Even the global execution context is removed once the script is done, because the callback can only enter when the stack is empty. The callback later gets its own new execution context.

### 6. How would you debug a production app blocked by long-running JavaScript?

_(Not in the transcript.)_

1. **Find it:** Use the Chrome DevTools Performance tab and look for long tasks (over 50 ms). Check INP and Total Blocking Time in production monitoring.
2. **Read the flame chart:** Find which function takes the most time.
3. **Fix it in this order:**
   - Remove work with memoization, list virtualization, or debouncing.
   - Delay work with lazy loading or `startTransition`.
   - Break big loops into small chunks and yield between them.
   - Move heavy calculations to a Web Worker.
4. **Test on a slow device** using CPU throttling, because your laptop can hide the problem.

## Closing Line for the Interview

> “In a nutshell: JavaScript is single-threaded and synchronous. The browser gives us async behaviour through Web APIs. The event loop checks whether the call stack is empty, then runs all microtasks first, then one macrotask, and repeats. So as engineers, we keep the main thread free by keeping tasks short.”

## Quick Revision Checklist

- JavaScript is single-threaded and synchronous by default. Async behaviour comes from the browser.
- The engine has only the heap and the call stack. It only executes code.
- `localStorage` is synchronous, so don’t `await` it.
- Everything first goes to the call stack, then it is offloaded.
- Microtasks (`promise`, `await`, `queueMicrotask`, `MutationObserver`) run before macrotasks (timers, DOM events).
- The event loop is an algorithm owned by the host. There is one per tab.
- JavaScript is concurrent, not parallel.
- `setTimeout(0)` is not immediate.
