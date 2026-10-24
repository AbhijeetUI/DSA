/* function debounce(func, wait, immediate = false) {
  let timeout;
  return function (...args) {
    // 1. Clear the PREVIOUS pending timer to reset the clock
    clearTimeout(timeout);

    // 2. Capture the correct 'this' context of the event listener
    const context = this;

    // 3. Set a new timer
    timeout = setTimeout(() => {
      timeout = null;
      if (!timeout) func.apply(context, args);
    }, wait);
  };
} */

function debounce(fn, wait) {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

// Usage in UI:
const onSearch = debounce(
  (e) => console.log("Searching for:", e.target.value),
  300,
);
document.getElementById("search").addEventListener("input", onSearch);
