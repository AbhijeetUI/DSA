/*
You are given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:

Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
Example 2:

Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:

Input: nums = [3,3], target = 6
Output: [0,1]
 
Constraints:

2 <= nums.length <= 10(4) = means the array will always have at least 2 elements and at most 10,000 elements
-109 <= nums[i] <= 10(9) = means the numbers can be negative, zero, or very large positive integers.
-109 <= target <= 10(9)
Only one valid answer exists. = We do not need to worry about handling multiple pairs or returning a list of combinations. 
                                As soon as we find the match, we can immediately return it and terminate.
 

Follow-up: Can you come up with an algorithm that is less than O(n2) time complexity?
*/

function twoSum(arr, target) {
  const seen = {}; // stores { value: index }

  for (let i = 0; i < arr.length; i++) {
    const complement = target - arr[i];

    // If complement was already seen, we found the pair
    if (seen[complement] !== undefined) {
      return [seen[complement], i];
    }

    seen[arr[i]] = i;
  }

  return [];
}

/*

DRY RUN 1
Input: arr = [2, 7, 11, 15], target = 9

Step 1: i = 0, arr[0] = 2
- complement = 9 - 2 = 7
- 7 is not in seen yet
- store seen[2] = 0

seen = { 2: 0 }

Step 2: i = 1, arr[1] = 7
- complement = 9 - 7 = 2
- 2 is already in seen
- seen[2] = 0
- return [0, 1]

Answer: [0, 1]

DRY RUN 2
Input: arr = [3, 2, 4], target = 6

Step 1: i = 0, arr[0] = 3
- complement = 6 - 3 = 3
- 3 is not in seen yet
- store seen[3] = 0

seen = { 3: 0 }

Step 2: i = 1, arr[1] = 2
- complement = 6 - 2 = 4
- 4 is not in seen yet
- store seen[2] = 1

seen = { 3: 0, 2: 1 }

Step 3: i = 2, arr[2] = 4
- complement = 6 - 4 = 2
- 2 is already in seen
- seen[2] = 1
- return [1, 2]

Answer: [1, 2]
*/

function twoSumAllPairs(arr, target) {
  const seen = {}; // stores { value: [indices] }
  const result = [];

  for (let i = 0; i < arr.length; i++) {
    const num = arr[i];
    const complement = target - num;

    if (seen[complement]) {
      for (const prevIndex of seen[complement]) {
        result.push([prevIndex, i]);
      }
    }

    if (!seen[num]) {
      seen[num] = [];
    }
    seen[num].push(i);
  }

  return result;
}

/*
DRY RUN: twoSumAllPairs
Input: arr = [1, 2, 3, 2, 1], target = 3

Step 1: i = 0, num = 1
- complement = 3 - 1 = 2
- 2 is not seen yet
- seen[1] = [0]

seen = { 1: [0] }

Step 2: i = 1, num = 2
- complement = 3 - 2 = 1
- 1 is seen before: [0]
- pair current index 1 with previous index 0 -> [[0,1]]
- store seen[2] = [1]

seen = { 1: [0], 2: [1] }

Step 3: i = 2, num = 3
- complement = 3 - 3 = 0
- 0 is not seen yet
- store seen[3] = [2]

Step 4: i = 3, num = 2
- complement = 3 - 2 = 1
- 1 is seen before: [0]
- pair [0,3]
- store seen[2] = [1,3]

result = [[0,1],[0,3]]

Step 5: i = 4, num = 1
- complement = 3 - 1 = 2
- 2 is seen before: [1,3]
- pair [1,4], [3,4]

final result = [[0,1],[0,3],[1,4],[3,4]]

Output: [[0,1],[0,3],[1,4],[3,4]]

Follow-up check:
- Works for duplicates: [3,3], target = 6 -> [0,1]
- Works for negatives: [5,-1,2,3], target = 2 -> [1,3]
- Works for zero values: [0,0,2], target = 0 -> [0,1]
- Assumes exactly one valid answer exists.
- If you need all valid pairs instead of just one pair, use a different version
  that stores multiple indices per value.


*/
