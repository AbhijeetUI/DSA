function promiseAllSettled(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable);
    const results = [];
    let completed = 0;

    if (items.length === 0) {
      resolve(results);
      return;
    }

    items.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => {
          results[index] = {
            status: "fulfilled",
            value,
          };
          completed += 1;

          if (completed === items.length) {
            resolve(results);
          }
        },
        (reason) => {
          results[index] = {
            status: "rejected",
            reason,
          };
          completed += 1;

          if (completed === items.length) {
            resolve(results);
          }
        },
      );
    });
  });
}

if (!Promise.allSettled) {
  Promise.allSettled = promiseAllSettled;
}

const successfulTask = Promise.resolve("success");
const failedTask = Promise.reject(new Error("request failed"));

promiseAllSettled([successfulTask, failedTask, "normal value"]).then(
  (results) => {
    console.log(results);
    // [
    //   { status: "fulfilled", value: "success" },
    //   { status: "rejected", reason: Error("request failed") },
    //   { status: "fulfilled", value: "normal value" },
    // ]
  },
);
