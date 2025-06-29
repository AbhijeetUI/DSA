/*
Given an array nums containing n distinct numbers in the range [0,n], return the only number in the range that is missing from the array.

Example 1
Input: nums = [3,0,1]
Output: 2

Explanation: n = 3 since there are 3 numbers, so range is [0,3]

Example 2
Input: nums = [0,1]
Output: 2

Explanation: n = 2 since there are 3 numbers, so range is [0,2]

n could be anything 1 to 10000
*/

/* 
Approach 1: we can use brute force approach:
Sort the array.
check nums[i] != nums[i-1] + 1, return nums[i-1] + 1 as the missing number
if no such mismatch is found:
if nums[0] != 0, return 0
else return n

but time complexity would be O(n log n) due to sorting array
*/

function missingNumber(nums) {
  let n = nums.length;
  let totalSum = (n * (n + 1)) / 2;
  let partialSum = 0;
  for (let i = 0; i < n; i++) {
    partialSum += nums[i];
  }
  return totalSum - partialSum;
}

console.log("############ FIND MISSING NUMBER ###############");
console.log(missingNumber([3, 0, 1])); // 2
