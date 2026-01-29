/*
SPREAD OPERATOR PITFALL: SHALLOW COPY vs DEEP COPY

The spread operator {...} creates a SHALLOW COPY, not a DEEP COPY.
This means:
- Top-level properties are copied
- But nested objects/arrays are still REFERENCED (not copied)

Example:
*/

const state = {
  user: { id: 101, details: { city: "Bangalore" } },
  theme: "dark",
};

const newState = { ...state };
// What happens here?

/*
Memory Layout After Spread:

state = {
  user: ──┐
  theme:  │
}         │
          ├──> { id: 101, details: ──┐
newState =│                          │
{         │                          ├──> { city: "Bangalore" }
  user: ──┤
  theme: ┤ (copied value "dark")
}         │

IMPORTANT: 
- newState.theme is a NEW property (different reference)
- newState.user is the SAME object reference as state.user
- Both point to the same nested object in memory
*/

newState.user.details.city = "Chennai";
// Changes the shared object!

console.log("Original state.user.details.city:", state.user.details.city);
// Output: Chennai (CHANGED! This is the pitfall)

console.log("New state.user.details.city:", newState.user.details.city);
// Output: Chennai (same reference)

console.log("\n--- Why This Happens ---");
console.log("state.user === newState.user:", state.user === newState.user);
// Output: true (they are the SAME object)

console.log("state.theme === newState.theme:", state.theme === newState.theme);
// Output: true (primitives are equal)

/*
SOLUTIONS:
*/

console.log("\n--- SOLUTION 1: Deep Clone with JSON ---");
const state1 = {
  user: { id: 101, details: { city: "Bangalore" } },
  theme: "dark",
};
const deepCopy1 = JSON.parse(JSON.stringify(state1));
deepCopy1.user.details.city = "Chennai";

console.log("Original (JSON method):", state1.user.details.city); // Bangalore
console.log("Copy (JSON method):", deepCopy1.user.details.city); // Chennai
// ✓ Works but has limitations (functions, undefined, Symbol are lost)

console.log("\n--- SOLUTION 2: Recursive Deep Clone ---");
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (obj instanceof Date) return new Date(obj.getTime());

  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

const state2 = {
  user: { id: 101, details: { city: "Bangalore" } },
  theme: "dark",
};
const deepCopy2 = deepClone(state2);
deepCopy2.user.details.city = "Chennai";

console.log("Original (recursive):", state2.user.details.city); // Bangalore
console.log("Copy (recursive):", deepCopy2.user.details.city); // Chennai
// ✓ Works perfectly, preserves all data types

console.log("\n--- SOLUTION 3: Using structuredClone (Modern) ---");
const state3 = {
  user: { id: 101, details: { city: "Bangalore" } },
  theme: "dark",
};
const deepCopy3 = structuredClone(state3);
deepCopy3.user.details.city = "Chennai";

console.log("Original (structuredClone):", state3.user.details.city); // Bangalore
console.log("Copy (structuredClone):", deepCopy3.user.details.city); // Chennai
// ✓ Best option in modern browsers/Node.js

console.log("\n--- SOLUTION 4: Nested Spread Operator ---");
const state4 = {
  user: { id: 101, details: { city: "Bangalore" } },
  theme: "dark",
};
const deepCopy4 = {
  ...state4,
  user: {
    ...state4.user,
    details: {
      ...state4.user.details,
    },
  },
};
deepCopy4.user.details.city = "Chennai";

console.log("Original (nested spread):", state4.user.details.city); // Bangalore
console.log("Copy (nested spread):", deepCopy4.user.details.city); // Chennai
// ✓ Works but becomes verbose with deeply nested objects

/*
SUMMARY TABLE:

Method               | Deep Copy | Preserves All Types | Easy to Use
─────────────────────┼───────────┼─────────────────────┼────────────
Spread {...}         | ✗ NO      | ✓ YES               | ✓ YES
JSON.parse/stringify | ✓ YES     | ✗ NO (loses functions) | ✓ YES
Recursive clone      | ✓ YES     | ✓ YES               | ✗ CODE
structuredClone()    | ✓ YES     | ✓ YES (mostly)      | ✓ YES
Nested spread        | ✓ YES     | ✓ YES               | ✗ VERBOSE

BEST PRACTICE:
- Use structuredClone() for modern JavaScript
- Fall back to JSON method for simple objects
- Use recursive clone for complex objects with functions
- Avoid nested spread operators (hard to maintain)
*/
