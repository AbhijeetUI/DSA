/*
Given a binary array nums, return the maximum number of consecutive 1's in the array.

Example 1: 
Input: nums = [1,1,0,1,1,1]
Outpyt: 3

Example 2: 
Input: nums = [1,0,1,1,0,1]
Output: 2
*/

function findMaxConsecutiveOnes(nums) {
  let currCnt = 0;
  let maxCnt = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === 1) {
      currCnt++;
    } else {
      maxCnt = Math.max(currCnt, maxCnt);
      currCnt = 0;
    }
  }
  return Math.max(maxCnt, currCnt); // loop ends and maxCnt is not updated, so we need to return using Math.max
  //return maxCnt; // not return proper cnt
}

console.log("############## MAX CONSECUTIVE ONE'S ##################");
console.log(findMaxConsecutiveOnes([1, 1, 0, 1, 1, 1]));
console.log(findMaxConsecutiveOnes([1, 0, 1, 1, 0, 1]));

/* 
DRY RUN

Input: nums = [1,1,0,1,1,1]

i = 0 -> nums[i] = 1 -> currentCount = 1
i = 1 -> nums[i] = 1 -> currentCount = 1
i = 2 -> nums[i] = 1 -> maxCount = 2, currentCount = 0
i = 3 -> nums[i] = 1 -> currentCount = 1
i = 4 -> nums[i] = 1 -> currentCount = 2
i = 5 -> nums[i] = 1 -> currentCount = 3

loop ends, so return : max(2,3) = 3
*/
