/*

Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. 
This process is repeated until the array is sorted. After each pass, the largest unsorted element “bubbles up” to its correct position at the end of the array. 
It’s called “Bubble Sort” because smaller elements slowly “bubble” to the top of the list.

Approach:

Iterate through array multiple times.
In each pass, compare adjacent elements: if the current element is greater than the next one, swap them.
After each pass, the largest unsorted element bubbles up to its correct position at the end.
if n = 4, then in this case we need to compare n - 1 iterations and each iteration we need to compare 3,2, and 0 respectively.
so for n = 4, there're 3 iterations with 5 comparison

Dry Run:

Initial state: [3,1,4]

Pass 1 (i = 0) (j = 0):
Compare arr[0] = 3 and arr[1] = 1 -> 3 > 1 -> swap -> arr = [1,3,4]
j = 1: Compare arr[1] = 3 and arr[2] = 4 -> 3 < 4 -> no swap
-> at least 1 swap was made, so continue

Pass 2 (i = 1) (j = 0)
Compare arr[0] = 1 and arr[1] = 3 -> 1 < 3 -> no swap
-> No  swaps made -> array is sorted -> exit early

Time Complexity:
Best Case: O(n) → when array is already sorted (optimized with isSwapped)
Worst Case: O(n²) → when array is in reverse order

Space Complexity:
O(1) → In-place sorting, no extra space used

*/
function bubbleSort(nums) {
  let n = nums.length;
  for (let i = 0; i < n - 1; i++) {
    let isSwapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (nums[j] > nums[j + 1]) {
        // gives ASC order
        let temp = nums[j];
        nums[j] = nums[j + 1];
        nums[j + 1] = temp;
        isSwapped = true; // set to true, bcoz swapping is happened
      }
    }
    if (!isSwapped) break; // if no swapping happened, then break the loop, bcoz array is sorted and after only few iteration it will return array
  }
  return nums;
}

console.log("########### BUBBLE SORT ###########");
console.log(bubbleSort([5, 2, 4, 1]));
/* 
Time complexity
outer loop runs n - 1 times
inner loop runs n - 1 - i times
so O(n2) this is not good, so bubble sort is not used much

*** Improvment we can do in bubble sort
if in any iteration -> no swapping happened -> stop bubble sort -> array is already sorted

for this we can keep track and check whether swapping is happening or not during the iteration
*/
