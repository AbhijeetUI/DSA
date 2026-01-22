/**
 * ============================================
 * CONCURRENCY LIMIT TASK RUNNER
 * ============================================
 *
 * PURPOSE:
 * Execute multiple asynchronous tasks with a maximum concurrency limit.
 * Only `limit` tasks run simultaneously; when one finishes, the next queued
 * task starts. This prevents resource exhaustion and API rate limits.
 *
 * WHY IS THIS IMPORTANT?
 * - Browser/Server can crash with too many simultaneous requests
 * - API rate limits (e.g., Uber, Twitter API only allow N requests/second)
 * - Database connection pools have limited size
 * - Memory constraints (each Promise consumes memory)
 * - Network bandwidth is finite
 *
 * @param {Array<() => Promise<any>>} tasks - Array of functions returning promises
 * @param {number} limit - Maximum concurrent executions (default: 2-10)
 * @returns {Promise<Array>} - Array of results in original order
 */
async function promiseAllWithConcurrencyLimit(tasks, limit) {
  // Validate inputs
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return [];
  }
  if (limit <= 0) {
    throw new Error("Concurrency limit must be greater than 0");
  }

  const results = new Array(tasks.length); // Maintains order
  const executing = []; // Currently running promises
  let index = 0; // Next task to start

  /**
   * STEP 1: Execute a single task by index
   * - Handles errors gracefully (stores them in results)
   * - Ensures results maintain original order
   */
  const executeTask = async (taskIndex) => {
    const task = tasks[taskIndex];
    try {
      results[taskIndex] = await task();
    } catch (error) {
      results[taskIndex] = error; // Stores error, doesn't throw
    }
  };

  /**
   * STEP 2: Queue Manager
   * - Continuously starts new tasks from the queue
   * - Respects concurrency limit using Promise.race()
   * - When limit reached, waits for any task to complete
   */
  const execute = async () => {
    while (index < tasks.length) {
      const taskIndex = index++;
      const promise = executeTask(taskIndex);

      executing.push(promise);

      /**
       * CLEANUP LOGIC:
       * When a promise completes, remove it from executing array
       * This frees up a slot for the next task
       */
      promise.then(() => {
        executing.splice(executing.indexOf(promise), 1);
      });

      /**
       * CONCURRENCY CONTROL:
       * If executing array reaches limit, BLOCK until one task finishes
       * Promise.race() returns when ANY promise settles (success/error)
       */
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }

    /**
     * FINAL WAIT:
     * After all tasks are queued, wait for remaining ones to finish
     * Promise.all() ensures no task is left behind
     */
    await Promise.all(executing);
  };

  await execute();
  return results;
}

// ============================================
// --- Input Data for Testing ---
// ============================================

const createDriverTask = (id, delay) => () =>
  new Promise((resolve) => {
    console.log(`🔄 Fetching Driver ${id}...`);
    setTimeout(() => {
      console.log(`✅ Driver ${id} loaded`);
      resolve(`Data for Driver ${id}`);
    }, delay);
  });

// Create tasks with varying delays
const tasks = [
  createDriverTask(1, 300), // 0.3s
  createDriverTask(2, 500), // 0.5s
  createDriverTask(3, 200), // 0.2s
  createDriverTask(4, 400), // 0.4s
  createDriverTask(5, 100), // 0.1s
  createDriverTask(6, 600), // 0.6s
];

// Test execution
console.log("📍 Starting with concurrency limit of 2...\n");
const startTime = Date.now();

promiseAllWithConcurrencyLimit(tasks, 2).then((results) => {
  const endTime = Date.now();
  console.log("\n✅ All tasks completed:", results);
  console.log(`⏱️  Total time: ${endTime - startTime}ms`);
});

/**
 * ============================================
 * PRACTICAL USE CASES IN REAL-WORLD APPLICATIONS
 * ============================================
 */

/**
 * USE CASE 1: UBER - FETCHING NEARBY DRIVERS
 * Problem: Uber has 100,000 available drivers, but server can only
 * handle 20 concurrent database queries without timing out.
 *
 * Solution: Instead of fetching all drivers at once:
 * - Queue all driver fetch requests
 * - Only 20 fetch operations run simultaneously
 * - As each completes, next driver is fetched
 * - Results returned in original order
 *
 * Benefits:
 * - Prevents database connection pool exhaustion
 * - Predictable resource usage
 * - Faster than sequential, cheaper than unrestricted parallel
 */
const createFetchDriverTask = (driverId) => () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ driverId, rating: Math.random() * 5 });
    }, Math.random() * 1000);
  });

// Example: Fetch 100 drivers with limit of 20 concurrent requests
// const driverTasks = Array.from({ length: 100 }, (_, i) =>
//   createFetchDriverTask(i)
// );
// promiseAllWithConcurrencyLimit(driverTasks, 20);

/**
 * USE CASE 2: BATCH IMAGE PROCESSING
 * Problem: Process 1000 images (resize, compress, watermark)
 * Each image takes 500ms, but processing >10 images simultaneously
 * consumes all RAM.
 *
 * Solution: Process in batches of 10
 * - Start processing images 0-9
 * - When image 0 finishes, start image 10
 * - Keep exactly 10 images in memory at any time
 */
const createImageTask = (imageId) => async () => {
  // Simulate: read → resize → compress → save
  await new Promise((r) => setTimeout(r, 500));
  return `Image ${imageId} processed`;
};

// const imageTasks = Array.from({ length: 1000 }, (_, i) =>
//   createImageTask(i)
// );
// promiseAllWithConcurrencyLimit(imageTasks, 10);

/**
 * USE CASE 3: PAYMENT PROCESSING FOR TRANSACTIONS
 * Problem: Process 10,000 credit card transactions
 * Payment gateway has rate limit: 50 requests per second
 * Exceeding limit results in IP block or failed transactions
 *
 * Solution: Queue all transactions, limit to 50 concurrent
 * - Respects API rate limits
 * - No failed requests due to throttling
 * - Consistent processing speed
 */
const createPaymentTask = (transactionId, amount) => () =>
  new Promise((resolve) => {
    // Simulating payment gateway API call
    setTimeout(() => {
      resolve({ transactionId, amount, status: "completed" });
    }, 100);
  });

// Example: Process 10,000 transactions at 50/sec rate
// const paymentTasks = Array.from({ length: 10000 }, (_, i) =>
//   createPaymentTask(i, Math.random() * 1000)
// );
// promiseAllWithConcurrencyLimit(paymentTasks, 50);

/**
 * PERFORMANCE COMPARISON:
 *
 * Task: 100 operations, each taking 100ms
 *
 * 1. SEQUENTIAL (limit = 1):
 *    Time: 100 * 100ms = 10 seconds
 *    Resource: Minimal (1 task at a time)
 *    Throughput: Low
 *
 * 2. UNRESTRICTED PARALLEL (all at once):
 *    Time: ~100ms (all run together)
 *    Resource: EXHAUSTED (100 tasks = crash)
 *    Throughput: High but system unstable
 *
 * 3. SMART CONCURRENCY (limit = 10):
 *    Time: 100 * 100ms / 10 = 1 second
 *    Resource: Controlled (10 tasks max)
 *    Throughput: High and stable ✅
 *
 * → This approach is the sweet spot for production!
 */
