/**
 * @param {Array<() => Promise<any>>} tasks - Array of functions returning promises
 * @param {number} limit - Maximum concurrent executions
 */
/*
Interview Pseudocode

results = empty array
nextTask = 0

worker:
  while nextTask is less than total tasks:
    index = nextTask
    nextTask++
    results[index] = await run task[index]

create limit workers
wait for all workers
return results
*/
// I use a shared index and a fixed number of async workers. Each worker claims one task, awaits it,
// stores the result at the original index, and continues until the queue is empty.
// Promise.all waits for all workers.
async function promiseAllWithConcurrencyLimit(tasks, limit) {
  const results = new Array(tasks.length);
  let currentIndex = 0; // points to the next task that needs to be claimed

  // 1. Define the worker that pulls tasks from the queue
  async function worker() {
    // Keep pulling tasks as long as there are tasks left in the queue
    while (currentIndex < tasks.length) {
      // 2. Claim the current index, then immediately advance the pointer
      const taskIndex = currentIndex++; // This gives each worker a different task.

      try {
        // 3. Execute the task and store the result in its original position
        results[taskIndex] = await tasks[taskIndex]();
      } catch (error) {
        // Match standard Promise.all behavior: fail fast if any task rejects
        throw error;
      }
    }
  }

  // 4. Create an array of workers up to the concurrency limit
  const workers = [];
  const poolSize = Math.min(limit, tasks.length); // Don't spawn unnecessary workers

  for (let i = 0; i < poolSize; i++) {
    workers.push(worker());
  }

  // 5. Wait for all workers in the pool to finish emptying the queue
  await Promise.all(workers);

  return results;
}

// --- Input Data for Testing ---
const createDriverTask = (id, delay) => () =>
  new Promise((resolve) => {
    console.log(` Fetching Driver ${id}...`);
    setTimeout(() => {
      console.log(` Driver ${id} loaded`);
      resolve(`Data for Driver ${id}`);
    }, delay);
  });

// Two tasks: run them sequentially by setting the limit to 1
const sequentialTasks = [
  createDriverTask(1, 1000), // Takes 1s
  createDriverTask(2, 500), // Starts only after Task 1 finishes
];

// Three tasks: run them concurrently by setting the limit to 3
const concurrentTasks = [
  createDriverTask(3, 800), // Starts immediately
  createDriverTask(4, 300), // Starts immediately
  createDriverTask(5, 600), // Starts immediately
];

// Execution
console.log("Running 2 tasks sequentially (limit = 1)...");
promiseAllWithConcurrencyLimit(sequentialTasks, 1)
  .then((results) => {
    console.log("Sequential tasks completed:", results);
  })
  .catch((err) => {
    console.error("Sequential queue failed:", err);
  });

console.log("Running 3 tasks concurrently (limit = 3)...");
promiseAllWithConcurrencyLimit(concurrentTasks, 3)
  .then((results) => {
    console.log("Concurrent tasks completed:", results);
  })
  .catch((err) => {
    console.error("Concurrent queue failed:", err);
  });
