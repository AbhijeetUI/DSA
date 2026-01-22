const arr = [1, 0, 1, 3, 13, 12, 26, 33, 49];

function findMinMax(arr) {
  if (!arr || arr.length === 0) return null; // edge case to check array length
  let minElement = Infinity; // Starts with the highest possible number (Infinity) as the initial minimum
  let maxElement = -Infinity; // Starts with the lowest possible number (-Infinity) as the initial maximum

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < minElement) {
      minElement = arr[i];
    }
    if (arr[i] > maxElement) {
      maxElement = arr[i];
    }
  }

  return {
    min: minElement,
    max: maxElement,
    sum: minElement + maxElement,
    product: minElement * maxElement,
  };
}

console.log(findMinMax(arr));
// Time Complexity: O(n) - Linear, as it scans the array once.
