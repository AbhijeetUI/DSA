function deepClone(value, map = new WeakMap()) {
  // Primitives, null, and functions can be returned directly.
  if (value === null || typeof value !== "object") {
    return value;
  }

  // Prevent infinite recursion for circular references.
  if (map.has(value)) {
    return map.get(value);
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }

  const clone = Array.isArray(value) ? [] : {};

  // Store before recursively cloning properties.
  map.set(value, clone);

  for (const key of Reflect.ownKeys(value)) {
    clone[key] = deepClone(value[key], map);
  }

  return clone;
}

const secretKey = Symbol("secret");

const original = {
  name: "JavaScript",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  pattern: /deep-clone/gi,
  [secretKey]: {
    value: 42,
  },
};

original.self = original;

const copy = deepClone(original);

console.log(copy !== original); // true

// Circular reference
console.log(copy.self === copy); // true

// Date
console.log(copy.createdAt !== original.createdAt); // true
console.log(copy.createdAt.getTime() === original.createdAt.getTime()); // true

// RegExp
console.log(copy.pattern !== original.pattern); // true
console.log(copy.pattern.source === original.pattern.source); // true
console.log(copy.pattern.flags === original.pattern.flags); // true

// Symbol property
console.log(copy[secretKey] !== original[secretKey]); // true
console.log(copy[secretKey].value === 42); // true
console.log(Object.getOwnPropertySymbols(copy).includes(secretKey)); // true
