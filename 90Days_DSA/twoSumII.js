/*
https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/description/

Constraints:

=> 2 <= numbers.length <= 3 * 10^4 = minimum 2 elements array has and maximum 60,000
=> -1000 <= numbers[i] <= 1000 = element in the array could be minimum -1000 and maximum 1000
=> numbers is sorted in non-decreasing order. = means ASC order
=> -1000 <= target <= 1000 = target could be minimum -1000 and maximum 1000
The tests are generated such that there is exactly one solution.
*/

/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (numbers, target) {
  let left = 0;
  let right = numbers.length - 1;
  while (left < right) {
    const current_sum = numbers[left] + numbers[right];
    if (current_sum === target) return [left + 1, right + 1];
    else if (current_sum < target) left++;
    else if (current_sum > target) right--;
  }
  return [];
};

console.log(twoSum([2, 7, 11, 15], 9)); // [1,2]
console.log(twoSum([2, 3, 4], 6)); // [1,3]
console.log(twoSum([-1, 0], -1)); // [1,2]

/*
Time: O(n) — in the worst case, the pointers traverse the array once.
Auxiliary space: O(1) — it uses only a fixed number of variables.
*/
