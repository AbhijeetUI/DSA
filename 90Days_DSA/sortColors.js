/*
https://leetcode.com/problems/sort-colors/description/

Constraints:

n == nums.length => 
1 <= n <= 300    => n could be minimum 1 and maximum 300 elements
nums[i] is either 0, 1, or 2.

*/

/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var sortColors = function (nums) {
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
};

const first = [2, 0, 2, 1, 1, 0];
sortColors(first);
console.log(first); // [0,0,1,1,2,2]

const second = [2, 0, 1];
sortColors(second);
console.log(second); // [0,1,2]
