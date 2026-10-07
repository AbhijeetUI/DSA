let leakContainer = [];

function setupLeak() {
  const largeData = new Array(1000000).fill("⚠️ Leaking Memory");
  const btn = document.getElementById("myButton");

  // This closure holds onto 'largeData' and 'leakContainer'
  const onClickHandler = function () {
    console.log("Button clicked!");
    // Referencing largeData inside the closure forces the browser
    // to keep the entire largeData array in memory
    if (largeData.length > 0) {
      leakContainer.push("clicked");
    }
    // FIX: Remove the listener when done to destroy the closure context
    cleanup();
  };

  btn.addEventListener("click", onClickHandler);
  function cleanup() {
    const btn = document.getElementById("myButton");
    btn.removeEventListener("click", onClickHandler);
    onClickHandler = null;
    console.log(
      "References cleared. Garbage collector can now free largeData.",
    );
  }
}

setupLeak();
