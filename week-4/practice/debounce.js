function debounce(func, wait, immediate = false) {
  let timeout = null;

  function debounced(...args) {
    const context = this;
    const callImmediately = immediate && timeout === null;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;

      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);

    if (callImmediately) {
      func.apply(context, args);
    }
  }

  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

const searchInput = document.getElementById("searchInput");
const output = document.getElementById("output");

function log(message) {
  output.textContent += `${new Date().toLocaleTimeString()} - ${message}\n`;
}

function searchApi(value) {
  log(`API call executed for: "${value}"`);
}

const debouncedSearch = debounce(searchApi, 500);

searchInput.addEventListener("input", function (event) {
  log(`Input event: "${event.target.value}"`);
  debouncedSearch(event.target.value);
});
