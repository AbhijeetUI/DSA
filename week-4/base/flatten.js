const nestedData = [2, [7, 8]];

/**
 * @param {Array} arr
 * @param {number} depth
 */
function customFlat(arr, depth = 1) {
  if (depth === 0 || arr.length === 0) {
    return arr;
  }

  const result = [];

  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      // The spread operator converts array elements into function arguments (e.g., push(1, 2, 3...))
      // JS some cap of numbers which leads to maximum callstack exceeded RangeError
      result.push(...customFlat(item, depth - 1));
      // creates a brand-new array on every loop step and shallow-copies every item from result and arr.
      // result = result.concat(customFlat(arr[i], depth - 1));
    } else {
      result.push(item);
    }
  }

  return result;
}

/*

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
*/
console.log(customFlat(nestedData, 1));
console.log(customFlat(nestedData, 2));
console.log(customFlat(nestedData, Infinity));
