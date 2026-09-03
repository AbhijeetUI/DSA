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
      console.log("immediate:", args);
      return func.apply(context, args);
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

/* const searchInput = document.getElementById("search");
const output = document.getElementById("output");

const searchHandler = debounce(
  (event) => {
    const value = event.target.value;

    console.log("Searching for:", value);
    output.textContent = `Searching for: ${value}`;
  },
  300,
  true,
);

searchInput.addEventListener("input", searchHandler); */
