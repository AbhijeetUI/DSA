/*
DEBOUNCE UTILITY FUNCTION

Definition: A function that delays the execution of another function
until after a specified time has passed without the function being called again.

Use Cases:
- Search input fields (API calls on user input)
- Window resize events
- Auto-save functionality
- Form validation

ALGORITHM:
1. Create a timeout variable to store the timeout ID
2. Return a debounced function that:
   - Clears the previous timeout
   - Sets a new timeout with the specified wait time
   - When timeout fires, execute the original function
3. The "immediate" flag allows execution on the leading edge (first call)
*/

function debounce(func, wait, immediate = false) {
  let timeout = null;

  return function (...args) {
    // Clear the previous timeout if it exists
    if (timeout) {
      clearTimeout(timeout);
    }

    // If immediate flag is true, execute function on the leading edge
    if (immediate && !timeout) {
      func.apply(this, args);
    }

    // Set a new timeout for the trailing edge execution
    timeout = setTimeout(() => {
      // If not immediate, execute the function after wait time
      if (!immediate) {
        func.apply(this, args);
      }
      timeout = null; // Reset timeout
    }, wait);
  };
}

/*
EXAMPLE 1: Normal Debounce (Trailing Edge)
Without "immediate", function executes AFTER user stops typing

User types: S -> e -> a -> r -> c -> h
Events:     |    |    |    |    |    | (stops)
Timeline:   0   100  200  300  400  500  (milliseconds)
                                        [Wait 300ms]
                                              500+ Execute

So with wait = 300ms, execution happens at ~800ms (500 + 300)
*/

function searchAPI(query) {
  console.log(`Searching for: "${query}"`);
  // Would call API here
}

const debouncedSearch = debounce(searchAPI, 300);

// Simulate typing
console.log("\n--- Example 1: Normal Debounce (Trailing Edge) ---");
console.log("Typing: 'hello'");
debouncedSearch("h");
debouncedSearch("he");
debouncedSearch("hel");
debouncedSearch("hell");
debouncedSearch("hello");
// Only executes ONCE after 300ms of no additional calls

/*
EXAMPLE 2: Immediate Debounce (Leading Edge)
With immediate = true, function executes IMMEDIATELY on first call,
then prevents execution for the next "wait" milliseconds

User types: S -> e -> a -> r -> c -> h
Events:     | (Execute)      [Lock for 300ms]
Timeline:   0   100  200  300  400  500
            ✓ (Executes immediately at 0ms)
*/

const debouncedSearchImmediate = debounce(searchAPI, 300, true);

console.log("\n--- Example 2: Immediate Debounce (Leading Edge) ---");
console.log("Typing: 'world'");
debouncedSearchImmediate("w"); // Executes IMMEDIATELY
debouncedSearchImmediate("wo"); // Ignored (within debounce period)
debouncedSearchImmediate("wor"); // Ignored
debouncedSearchImmediate("worl"); // Ignored
debouncedSearchImmediate("world"); // Ignored

setTimeout(() => {
  console.log("\n--- More detailed trace ---");

  // Example with timestamps
  function logEvent(name) {
    console.log(`[${Date.now() % 10000}ms] Event: ${name}`);
  }

  const debouncedLog = debounce(logEvent, 500);

  console.log("Starting debounce test with 500ms delay:");
  debouncedLog("Call 1");

  setTimeout(() => debouncedLog("Call 2"), 200);
  setTimeout(() => debouncedLog("Call 3"), 400);
  setTimeout(() => debouncedLog("Call 4"), 600); // This will trigger new debounce

  setTimeout(() => {
    console.log("\nTest completed!");
  }, 1500);
}, 100);

/*
TIME COMPLEXITY: O(1) for the debounce wrapper creation
SPACE COMPLEXITY: O(1) - stores single timeout reference

KEY POINTS:
1. Without immediate: Executes on TRAILING edge (after waiting)
2. With immediate: Executes on LEADING edge (immediately)
3. Use case: immediate=true for buttons, false for search/resize
4. Each new call resets the timer (clears previous timeout)
5. Arrow functions with "this" context need special handling

*/
