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

/*
The Easy-to-Remember Analogy: "The Blueprint Room"
Step 1: Check if it's too simple to clone (Primitives)
Step 2: Check if it's a special item (Dates & RegEx)
Step 3: Check if we've already cloned it (Circular references / WeakMap)
Step 5: Unbox and clone everything inside (Recursion loop)
*/
// 1. The Deep Clone Implementation
function deepClone(value, map = new WeakMap()) {
  // Base case: Handle primitives and null
  // "First, I handle my base case. If the value is a primitive (like a string, number, or boolean) or if it's null, it's already copied by value in JavaScript. I can just return it immediately."
  if (value === null || typeof value !== 'object') {
    return value;
  }
  // Dates and RegExp are objects and we can not loop through them normally, so we create new copies using their original values.
  // Handle Dates
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  
  // Handle Regular Expressions
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }

  // Handle Circular References
  /* Every RegExp object is made up of 2 distinct parts: 
      * pattern and modifiers *
     - value.source(pattern) = the source property retunrs string contains the text of RegEx pattern without the forwarward slashes
       Ex.: /heelo/gi => value.source evaluates to string = "hello"
     - value.flags(modifiers) = the flags property returns string which contains allactive modifiers attached to that regular expression
       Ex.: hello/gi evaluates to "gi" where g for Global)finds all matches) and i for case-insensitive(match "HELLO", "Hello","hello", etc.).
      
   */
  if (map.has(value)) {
    return map.get(value);
  }

  // Initialize clone structure and track it
  const clone = Array.isArray(value) ? [] : {};
  map.set(value, clone);

  // Recursively clone keys
  for (const key in value) {
    if (value.hasOwnProperty(key)) {
      clone[key] = deepClone(value[key], map);
    }
  }

  return clone;
}

// 2. Input Setup (Complex Original Object)
const original = {
  name: "Atlassian",
  skills: ["JavaScript", ["React", "Node"]], 
  meta: { id: 101, status: "active" },      
  createdAt: new Date('2026-05-31'),         
  pattern: /[a-z]+/gi,                       
};

// Inject the circular reference
original.circularReference = original;

// 3. Perform the Deep Clone
const copy = deepClone(original);

// 4. Aggressively mutate the copied object
copy.name = "Google";
copy.skills[0] = "Python";
copy.skills[1][0] = "Vue";          // Modify deeply nested array element
copy.meta.status = "inactive";      // Modify nested object property
copy.createdAt.setFullYear(2030);   // Modify Date object time

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
