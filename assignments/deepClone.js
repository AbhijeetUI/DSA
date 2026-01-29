/*
DEEP CLONE WITH CIRCULAR REFERENCE HANDLING

Requirements:
- Handle primitives (numbers, strings, booleans, null, undefined, symbols)
- Handle complex types (Date, RegExp, Map, Set, Arrays, Objects)
- Handle circular references WITHOUT using JSON.stringify
- Memory efficient using WeakMap
- Preserve prototype chain (optional but good)

ALGORITHM:
1. Base case: Return primitives directly (they're immutable)
2. Check if object already cloned using WeakMap (circular ref handling)
3. If already cloned, return the cached clone
4. Create new instance based on type
5. Store in WeakMap BEFORE recursing (prevents infinite loops)
6. Recursively clone properties
7. Return cloned object
*/

function deepClone(value, map = new WeakMap()) {
  // STEP 1: Handle primitives (immutable, can return directly)
  if (value === null || typeof value !== "object") {
    return value;
  }

  // Handle primitives that are objects (Symbol is not)
  if (typeof value === "symbol") {
    return Symbol(value.description);
  }

  // STEP 2: Check if we've already cloned this object (circular reference)
  if (map.has(value)) {
    return map.get(value); // Return cached clone
  }

  // STEP 3: Handle different object types

  // Date object
  if (value instanceof Date) {
    // typeof new Date() is "object" (not specific), instanceOf is more specific
    return new Date(value.getTime()); // create new copy and reference, with same date
  }

  // RegExp object
  if (value instanceof RegExp) {
    const flags = value.flags;
    const cloned = new RegExp(value.source, flags);
    cloned.lastIndex = value.lastIndex;
    return cloned;
  }

  // Map object
  if (value instanceof Map) {
    const clonedMap = new Map();
    map.set(value, clonedMap); // Store before processing entries
    for (let [key, val] of value) {
      clonedMap.set(deepClone(key, map), deepClone(val, map));
    }
    return clonedMap;
  }

  // Set object
  if (value instanceof Set) {
    const clonedSet = new Set();
    map.set(value, clonedSet); // Store before processing values
    for (let val of value) {
      clonedSet.add(deepClone(val, map));
    }
    return clonedSet;
  }

  // Array
  if (Array.isArray(value)) {
    const clonedArray = [];
    map.set(value, clonedArray); // Store BEFORE recursion to handle circular refs
    for (let i = 0; i < value.length; i++) {
      clonedArray[i] = deepClone(value[i], map);
    }
    return clonedArray;
  }

  // STEP 4: Handle plain objects
  // Create new object with same prototype
  const clonedObj = Object.create(Object.getPrototypeOf(value));

  // STEP 5: Store in map BEFORE recursing (critical for circular refs)
  // This prevents infinite loops when object references itself
  map.set(value, clonedObj);

  // STEP 6: Clone all properties (including symbols and non-enumerable)
  // Using getOwnPropertyNames to get all properties including non-enumerable
  const keys = Object.getOwnPropertyNames(value);
  const symbols = Object.getOwnPropertySymbols(value);
  const allKeys = [...keys, ...symbols];

  for (let key of allKeys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (descriptor.value !== undefined) {
      // For data properties, recursively clone
      Object.defineProperty(clonedObj, key, {
        value: deepClone(descriptor.value, map),
        writable: descriptor.writable,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
      });
    } else {
      // For accessor properties, copy as-is
      Object.defineProperty(clonedObj, key, descriptor);
    }
  }

  return clonedObj;
}

/*
TEST CASE 1: Basic nested object
*/
console.log("--- TEST 1: Basic Nested Object ---");
const original1 = {
  a: 1,
  b: { c: 2 },
  d: [11, 7],
};

const copy1 = deepClone(original1);
console.log("Original:", original1);
console.log("Clone:", copy1);
console.log("copy1 !== original1:", copy1 !== original1); // true
console.log("copy1.b !== original1.b:", copy1.b !== original1.b); // true
console.log("copy1.d !== original1.d:", copy1.d !== original1.d); // true

/*
TEST CASE 2: Circular reference (KEY TEST)
*/
console.log("\n--- TEST 2: Circular Reference ---");
const original2 = {
  a: 1,
  b: { c: 2 },
  d: [11, 7],
};
original2.self = original2; // Circular reference!

const copy2 = deepClone(original2);
console.log("copy2 !== original2:", copy2 !== original2); // true
console.log("copy2.b !== original2.b:", copy2.b !== original2.b); // true
console.log("copy2.self === copy2:", copy2.self === copy2); // true (circularity preserved!)
console.log("copy2.self.self === copy2:", copy2.self.self === copy2); // true

/*
TEST CASE 3: Complex circular structure
*/
console.log("\n--- TEST 3: Complex Circular Structure ---");
const nodeA = { name: "A", value: 1 };
const nodeB = { name: "B", value: 2 };
const nodeC = { name: "C", value: 3 };

nodeA.next = nodeB;
nodeB.next = nodeC;
nodeC.next = nodeA; // Circular!

const clonedA = deepClone(nodeA);
console.log("Original chain: A -> B -> C -> A");
console.log(
  "Cloned chain: ",
  clonedA.name,
  "->",
  clonedA.next.name,
  "->",
  clonedA.next.next.name,
  "->",
  clonedA.next.next.next.name,
);
console.log(
  "All are independent copies:",
  clonedA !== nodeA && clonedA.next !== nodeB && clonedA.next.next !== nodeC,
); // true

/*
TEST CASE 4: Special types (Date, RegExp, Map, Set)
*/
console.log("\n--- TEST 4: Special Types ---");
const original4 = {
  date: new Date("2024-01-15"),
  regex: /test/gi,
  map: new Map([
    ["key1", "value1"],
    ["key2", "value2"],
  ]),
  set: new Set([1, 2, 3]),
};

const copy4 = deepClone(original4);
console.log(
  "Date cloned:",
  copy4.date instanceof Date &&
    copy4.date.getTime() === original4.date.getTime(),
); // true
console.log(
  "RegExp cloned:",
  copy4.regex instanceof RegExp &&
    copy4.regex.source === original4.regex.source,
); // true
console.log(
  "Map cloned:",
  copy4.map instanceof Map && copy4.map.get("key1") === "value1",
); // true
console.log("Set cloned:", copy4.set instanceof Set && copy4.set.has(2)); // true
console.log(
  "All independent:",
  copy4.date !== original4.date &&
    copy4.regex !== original4.regex &&
    copy4.map !== original4.map &&
    copy4.set !== original4.set,
); // true

/*
TEST CASE 5: Array with circular references
*/
console.log("\n--- TEST 5: Array with Circular References ---");
const original5 = [1, 2, { nested: true }];
original5.push(original5); // Circular array!

const copy5 = deepClone(original5);
console.log("Array length:", copy5.length); // 4
console.log("Last element is array itself:", copy5[3] === copy5); // true
console.log("copy5 !== original5:", copy5 !== original5); // true

/*
TEST CASE 6: Memory efficiency - verify no deep cloning issues
*/
console.log("\n--- TEST 6: Memory Efficiency ---");
const largeArray = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  data: "test",
}));
const original6 = { data: largeArray };
original6.self = original6;

const copy6 = deepClone(original6);
console.log("Large object cloned successfully:", copy6.data.length === 1000); // true
console.log("Circular ref preserved:", copy6.self === copy6); // true
console.log(
  "Independent copies:",
  copy6 !== original6 && copy6.data !== original6.data,
); // true

/*
TIME COMPLEXITY: O(n) where n is total number of properties/elements
SPACE COMPLEXITY: O(n) for the cloned structure + O(m) for WeakMap where m is number of objects

ADVANTAGES:
✓ Handles circular references without infinite loops
✓ Preserves special object types (Date, RegExp, Map, Set, etc.)
✓ Doesn't use JSON.stringify (preserves functions, symbols, etc.)
✓ Memory efficient with WeakMap (allows garbage collection)
✓ Preserves property descriptors (writable, enumerable, configurable)
✓ Handles non-enumerable properties and symbol keys

WHY WeakMap?
- WeakMap keys are objects and only hold weak references
- Allows garbage collection of circular referenced objects
- Key must be an object (perfect for tracking cloned objects)
- Alternative: Map would also work but prevents garbage collection
*/
