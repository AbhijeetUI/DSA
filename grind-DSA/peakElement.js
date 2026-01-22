function findPeakElement(arr) {
  const n = arr.length;

  // Edge cases
  if (n === 0) return -1;
  if (n === 1) return 0;

  // Check first element
  if (arr[0] > arr[1]) return 0;

  // Check last element
  if (arr[n - 1] > arr[n - 2]) return n - 1;

  // Check middle elements
  for (let i = 1; i < n - 1; i++) {
    if (arr[i] > arr[i - 1] && arr[i] > arr[i + 1]) {
      return i;
    }
  }

  // This should not happen given the constraints
  return -1;
}

// Test cases
console.log(findPeakElement([1, 3, 2])); // Output: 1
console.log(findPeakElement([3, 1, 2])); // Output: 0 or 2 (either is fine)
console.log(findPeakElement([1])); // Output: 0
console.log(findPeakElement([1, 2])); // Output: 1
console.log(findPeakElement([2, 1])); // Output: 0
