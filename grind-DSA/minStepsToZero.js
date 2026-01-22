function minSteps(arr, n) {
  let maxVal = 0;
  for (let num of arr) {
    if (num > maxVal) {
      maxVal = num;
    }
  }
  return maxVal;
}

// Test cases
console.log(minSteps([1, 2, 3], 3)); // Output: 3
console.log(minSteps([0, 0, 0], 3)); // Output: 0
console.log(minSteps([5], 1)); // Output: 5
