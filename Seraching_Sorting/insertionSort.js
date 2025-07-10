/**
 * Sorts an array of numbers in ascending order using the insertion sort algorithm.
 *
 * Insertion sort builds the final sorted array one element at a time.
 * For each element in the array (starting from the second element), it compares the current element
 * with the elements before it and shifts larger elements one position ahead to make space for the current element.
 * This process continues until all elements are sorted.
 *
 * Dry Run Example:
 * Input: [4, 5, 1, 3, 9]
 *
 * Pass 1 (i = 1):
 *   curr = 5, prev = 0 (nums[prev] = 4)
 *   4 is not greater than 5, so no shifting is needed.
 *   Array after pass: [4, 5, 1, 3, 9]
 *
 * Pass 2 (i = 2):
 *   curr = 1, prev = 1 (nums[prev] = 5)
 *   5 > 1, so shift 5 to index 2: [4, 5, 5, 3, 9]
 *   prev = 0 (nums[prev] = 4)
 *   4 > 1, so shift 4 to index 1: [4, 4, 5, 3, 9]
 *   prev = -1 (end of array)
 *   Insert 1 at index 0: [1, 4, 5, 3, 9]
 *
 * Pass 3 (i = 3):
 *   curr = 3, prev = 2 (nums[prev] = 5)
 *   5 > 3, so shift 5 to index 3: [1, 4, 5, 5, 9]
 *   prev = 1 (nums[prev] = 4)
 *   4 > 3, so shift 4 to index 2: [1, 4, 4, 5, 9]
 *   prev = 0 (nums[prev] = 1)
 *   1 is not greater than 3, so insert 3 at index 1: [1, 3, 4, 5, 9]
 *
 * Pass 4 (i = 4):
 *   curr = 9, prev = 3 (nums[prev] = 5)
 *   5 is not greater than 9, so no shifting is needed.
 *   Array after pass: [1, 3, 4, 5, 9]
 *
 * Final sorted array: [1, 3, 4, 5, 9]
 *
 * Time Complexity: O(n^2) in the average and worst case.
 *
 * @param {number[]} nums - The array of numbers to be sorted in-place.
 * @returns {void} The input array is sorted in-place.
 */

function insertionSort(nums) {
  let n = nums.length;
  for (let i = 1; i < n; i++) {
    let curr = nums[i];
    let prev = i - 1;
    // keep moving array
    while (nums[prev] > curr && prev >= 0) {
      nums[prev + 1] = nums[prev];
      prev--;
    }
    nums[prev + 1] = curr;
  }
}

/*
time complexity is O(n2)
*/
