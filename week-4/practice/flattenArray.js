const nestedData = [2, [7, 8]];

/**
 * @param {Array} arr
 * @param {number} depth
 */
function customFlat(arr, depth = 1) {
  const result = [];

  function flatten(items, remainingDepth) {
    for (const item of items) {
      if (Array.isArray(item) && remainingDepth > 0) {
        flatten(item, remainingDepth - 1);
      } else {
        result.push(item);
      }
    }
  }

  flatten(arr, Math.max(0, Math.floor(depth)));
  return result;
}

if (!Array.prototype.flat) {
  Array.prototype.flat = function (depth = 1) {
    return customFlat(this, depth);
  };
}

console.log(customFlat(nestedData, 1));
console.log(customFlat(nestedData, 2));
console.log(customFlat(nestedData, Infinity));

// Dry run for customFlat([2, [7, 8]], 1):
// 1. Visit 2 -> push 2 into result: [2]
// 2. Visit [7, 8] at depth 1 -> recurse with depth 0
// 3. Visit 7 -> push 7 into result: [2, 7]
// 4. Visit 8 -> push 8 into result: [2, 7, 8]
// 5. Return [2, 7, 8]

function flatWithConcat(arr, depth = 1) {
  let result = [];

  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result = result.concat(flatWithConcat(item, depth - 1));
    } else {
      result.push(item);
    }
  }

  return result;
}

function flatWithSpread(arr, depth = 1) {
  let result = [];

  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flatWithSpread(item, depth - 1));
    } else {
      result.push(item);
    }
  }

  return result;
}

console.log("concat:", flatWithConcat(nestedData, 1));
console.log("spread:", flatWithSpread(nestedData, 1));

/*
Complexity comparison for n output items and d nesting depth:

customFlat:
- Time: O(n), because each item is visited once and pushed once.
- Space: O(n + d), for the output array and recursion stack.

concat and spread above:
- Time: O(n^2) in the worst case, because each new result copies the
  previously accumulated result.
- Space: O(n + d) live space, with additional temporary arrays created
  during each concat or spread operation.

Note: concat and spread can be close to O(n) for small or balanced inputs,
but push into one accumulator avoids their repeated copying cost.
*/
