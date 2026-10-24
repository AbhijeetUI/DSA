/**
 * Problem: https://leetcode.com/problems/longest-consecutive-sequence/
 * 
 * Example 1:

Input: nums = [100,4,200,1,3,2]
Output: 4
Explanation: The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.
Example 2:

Input: nums = [0,3,7,2,5,8,4,6,0,1]
Output: 9
Example 3:

Input: nums = [1,0,1,2]
Output: 3

/**
 * @param {number[]} nums
 * @return {number}
 */
var longestConsecutive = function (nums) {
  // R - Review Edge Cases: Handle empty array immediately
  if (nums.length === 0) {
    return 0;
  }

  let longetStreak = 0;
  // M - Module 1: Quick Lookup Setup
  // Convert array to a Set to remove duplicates and allow O(1) lookups

  const numsSet = new Set(nums);

  // Loop through the unique numbers in the set
  for (const num of numsSet) {
    // M - Module 2: Identify the Start of a Sequence
    // A number is the start of a sequence ONLY IF (number - 1) is not in the set
    if (!numsSet.has(num - 1)) {
      let currentNum = num;
      currentStreak = 1;

      // M - Module 3: Count and Update
      // Keep checking for the next consecutive numbers in the chain
      while (numsSet.has(currentNum + 1)) {
        currentStreak += 1;
        currentNum += 1;
      }

      // Update our maximum record
      longetStreak = Math.max(currentStreak, longetStreak);
    }
  }
  return longetStreak;
};

/*

Why this JavaScript code is highly efficient:

• Time Complexity: O(N). Even though there is a while loop inside a for loop, the while loop only triggers for the first number of any sequence. Each number in the array is visited at most 2 or 3 times total, making it linear time.
• Space Complexity: O(N) because we create a new Set to store the unique values of the array.
*/

console.log(longestConsecutive([100, 4, 200, 1, 3, 2]));
