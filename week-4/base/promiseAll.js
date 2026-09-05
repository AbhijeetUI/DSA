function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable);
    const results = [];
    let completed = 0;

    if (items.length === 0) {
      resolve(results);
      return;
    }

    items.forEach((item, index) => {
      Promise.resolve(item).then((value) => {
        results[index] = value;
        completed += 1;

        if (completed === items.length) {
          resolve(results);
        }
      }, reject);
    });
  });
}

if (!Promise.all) {
  Promise.all = promiseAll;
}

const firstTask = new Promise((resolve) => {
  setTimeout(() => resolve("first result"), 300);
});

const secondTask = new Promise((resolve) => {
  setTimeout(() => resolve("second result"), 100);
});

promiseAll([firstTask, secondTask, "normal value"])
  .then((results) => {
    console.log(results);
    // ["first result", "second result", "normal value"]
  })
  .catch((error) => {
    console.error(error);
  });

const failedTask = Promise.reject(new Error("second task failed"));

promiseAll([Promise.resolve("first result"), failedTask])
  .then((results) => {
    console.log(results);
  })
  .catch((error) => {
    console.error("Rejected:", error.message);
    // Rejected: second task failed
  });
