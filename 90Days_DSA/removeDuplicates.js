/**
   https://leetcode.com/problems/contains-duplicate/description/
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function (nums) {
  let seen = new Set();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
};

console.log(containsDuplicate([1, 2, 3, 1])); // true
console.log(containsDuplicate([1, 2, 3, 4])); // false

/*

Constraints: 

1 <= nums.length <= 10(5) = 
. at least 1 element should present in the array, so no need to handle [] case and at most 100,000
. you should aim to solve with O(n)/O(nlogn) - time complexity, bcoz brute force will give you O(n2) using nested loops(TLE)

-10(9) <= nums[i] <= 10(9)
• Each individual number (nums[i]) inside the array can range from negative 1 billion to positive 1 billion.
*/
