async function promiseAllWithConcurrencyLimit(tasks, limit) {
  // TODO: Your implementation
  const results = new Array(tasks.length);
  let currentIndex = 0;
  async function worker() {
    while (currentIndex < tasks.length) {
      const taskIndex = currentIndex++;
      try {
        results[taskIndex] = await tasks[taskIndex]();
      } catch (error) {
        throw error;
      }
    }
  }
  const workers = [];
  const poolSize = Math.min(limit, tasks.length);
  for (let i = 0; i < poolSize; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
}
