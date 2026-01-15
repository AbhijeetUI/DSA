/*
Sort an array of 0s, 1s and 2s - Dutch National Flag Problem.
Given an array arr[] consisting of only 0s, 1s, and 2s. The objective is to sort the array, i.e., put all 0s first, then all 1s and all 2s in last.

Input: arr[] = [0, 1, 2, 0, 1, 2]
Output: [0, 0, 1, 1, 2, 2]
Explanation: [0, 0, 1, 1, 2, 2] has all 0s first, then all 1s and all 2s in last.

We can solve it using below approaches

Native approach -> using sort() method which place all 0s first, then all 1s and 2s at last.

arr.sort((a,b) => a - b);

Better approach counting 0s, 1s and 2s - Two pass

-> traverse the array once and count number of 0s, 1s and 2s say c0, c1, c2.
-> now traverse the array again to put c0, c1 and c2 in array for 0s,1s and 2s, this has O(n) time and requires 2 traversals of the array.
*/

function countingApproach(arr) {
  let c0 = 0,
    c1 = 0,
    c2 = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === 0) c0 += 1;
    else if (arr[i] === 1) c1 += 1;
    else c2 += 2;
  }
  let idX = 0;
  for (let i = 0; i < c0; i++) {
    arr[idX++];
  }
  for (let i = 0; i < c1; i++) {
    arr[idX++];
  }
  for (let i = 0; i < c2; i++) {
    arr[idX++];
  }
}

let arr = [0, 1, 2, 0, 1, 2];
countingApproach(arr);
console.log(arr.join(" "));

/*
time complexity = O(2*n) = n is the number of elements in the array
space complexity = O(1)
*/

/*
Dutch national flag algorithm - One pass with O(n) and O(1) space
Idea: Use three pointers - low, mid, high to partition the array

How it works:

low pointer marks the boundary of 0s (everything before it is 0)
mid pointer is the current element being checked
high pointer marks the boundary of 2s (everything after it is 2)

Logic:

If arr[mid] == 0: swap with arr[low], move both low and mid forward
If arr[mid] == 1: just move mid forward
If arr[mid] == 2: swap with arr[high], move high backward (don't move mid since we need to check the swapped element)
*/

function dutchNationalFlag(arr) {
  let low = 0,
    mid = 0,
    high = arr.length - 1;

  while (mid <= high) {
    if (arr[mid] === 0) {
      // Swap arr[mid] with arr[low]
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      low++;
      mid++;
    } else if (arr[mid] === 1) {
      // Keep it in place and move to next
      mid++;
    } else {
      // arr[mid] === 2, swap with arr[high]
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      high--;
      // Don't move mid, check the swapped element
    }
  }
  return arr;
}

// Test case
let arr2 = [0, 1, 2, 0, 1, 2];
dutchNationalFlag(arr2);
console.log("Dutch National Flag Result:", arr2.join(" ")); // Output: 0 0 1 1 2 2

/*
Time Complexity: O(n) - Single pass through the array
Space Complexity: O(1) - No extra space, in-place sorting
*/
