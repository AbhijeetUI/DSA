/*
Given a none-empty array of integers nums, every element appears twice except for one. Find that single one.
You must implement a solution with a linear reuntime complexity and use only constant extra space.

Example 1:
Input: nums = [2,2,1]
Output: 1
*/

/* 

Approach 1: we can use HashMap of Javascript and maintain count of each element
then loop through count and return the element of which count is 1

time complexity is O(n)
space complexity is O(n) => to store hashmap only

Approach 2: without space complexity, using xor operator which removes all duplicates from array.
*/

function singleNumber(nums) {
  let hash = {};
  /* for (let i = 0; i < nums.length; i++) {
    if (!hash[nums[i]]) {
      hash[nums[i]] = 1;
    } else {
      hash[nums[i]]++;
    }
  }
  for (let i = 0; i < nums.length; i++) {
    if (hash[nums[i]] === 1) return nums[i];
  } */

  for (const n of nums) {
    console.log(n);
    return hash[nums[n]] + 1 || 0;
  }
  console.log(hash);
}

console.log("############# SINGLE NUMBER ############");
console.log(singleNumber([2, 2, 1]));
