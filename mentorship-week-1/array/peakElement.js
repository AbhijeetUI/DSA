class Solution {
  peakElement(arr) {
    let low = 0;
    let high = arr.length - 1;

    while (low < high) {
      let mid = Math.floor((low + high) / 2);

      if (arr[mid] < arr[mid + 1]) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }
}

// 1. Instantiate the class
const obj = new Solution();

// 2. Define test input
const arr = [1, 2, 4, 5, 7, 8, 3];

// 3. Call the method and store the returned index
const peakIndex = obj.peakElement(arr);

// 4. Print the results
console.log("Peak Index:", peakIndex); // Output: 5
console.log("Peak Value:", arr[peakIndex]); // Output: 8

/*
================================================================================
DRY RUN: Find Peak Element (Binary Search)
================================================================================

Input Array: arr = [1, 2, 4, 5, 7, 8, 3]
Indices:            0  1  2  3  4  5  6

Initial State:
- low  = 0
- high = arr.length - 1 = 6

--------------------------------------------------------------------------------
ITERATION 1:
- Check condition: low < high (0 < 6) -> TRUE
- Compute mid: Math.floor((0 + 6) / 2) = 3
- Compare elements:
    arr[mid]     = arr[3] = 5
    arr[mid + 1] = arr[4] = 7
- Condition check: arr[mid] < arr[mid + 1] (5 < 7) -> TRUE
- Logic: Increasing slope (5 -> 7). Peak must lie to the right.
- Update: low = mid + 1 = 3 + 1 = 4

--------------------------------------------------------------------------------
ITERATION 2:
- Check condition: low < high (4 < 6) -> TRUE
- Compute mid: Math.floor((4 + 6) / 2) = 5
- Compare elements:
    arr[mid]     = arr[5] = 8
    arr[mid + 1] = arr[6] = 3
- Condition check: arr[mid] < arr[mid + 1] (8 < 3) -> FALSE
- Logic: Decreasing slope (8 -> 3). Peak is at mid or to its left.
- Update: high = mid = 5

--------------------------------------------------------------------------------
ITERATION 3:
- Check condition: low < high (4 < 5) -> TRUE
- Compute mid: Math.floor((4 + 5) / 2) = 4
- Compare elements:
    arr[mid]     = arr[4] = 7
    arr[mid + 1] = arr[5] = 8
- Condition check: arr[mid] < arr[mid + 1] (7 < 8) -> TRUE
- Logic: Increasing slope (7 -> 8). Peak lies to the right.
- Update: low = mid + 1 = 4 + 1 = 5

--------------------------------------------------------------------------------
LOOP TERMINATION:
- Check condition: low < high (5 < 5) -> FALSE
- Loop ends.

--------------------------------------------------------------------------------
FINAL RESULT:
- Returns index: low = 5
- Peak Value: arr[5] = 8
================================================================================
*/

function peakElement(arr) {
  if (arr.length === 0) return -1;

  for (let i = 0; i < arr.length; i++) {
    const left = i === 0 ? -Infinity : arr[i - 1];
    const right = i === arr.length - 1 ? -Infinity : arr[i + 1];

    if (arr[i] > left && arr[i] > right) {
      return i;
    }
  }

  return -1;
}

console.log(peakElement([1, 2, 4, 5, 7, 8, 3]));
