function isDeepEqual(obj1, obj2) {
  // 1. Check if same reference or identical primitive values
  if (obj1 === obj2) {
    return true;
  }

  // 2. Check types and handle null values (typeof null is 'object')
  if (typeof obj1 !== typeof obj2 || obj1 === null || obj2 === null) {
    return false;
  }

  // If they are primitives and reached here, they are not equal
  if (typeof obj1 !== "object") {
    return false;
  }

  // 3. Recursive key-by-key comparison
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if they have the same number of properties
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Deeply compare every key and value
  for (const key of keys1) {
    if (!isDeepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

// --- Test Cases ---
const profileA = {
  name: "Abhijeet",
  roles: ["admin", "mentor"],
  meta: { id: 1 },
};
const profileB = {
  name: "Abhijeet",
  roles: ["admin", "mentor"],
  meta: { id: 1 },
};
const profileC = { name: "Abhijeet", roles: ["admin"], meta: { id: 1 } };

console.log("Test 1 (Identical):", isDeepEqual(profileA, profileB)); // Expected: true
console.log("Test 2 (Different Roles):", isDeepEqual(profileA, profileC)); // Expected: false
console.log(
  "Test 3 (Nested Change):",
  isDeepEqual(profileA, { ...profileB, meta: { id: 2 } }),
); // Expected: false
console.log("Test 4 (Primitive):", isDeepEqual(10, 10)); // Expected: true
