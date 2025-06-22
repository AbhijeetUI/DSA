/*
Example 1:
Input: nums = [1,1,2];
Output: 2, nums = [1,2,...];
Explanation: Your function should return k = 2, with the first 2 elements of nums being 1 and 2 respectively.

Example 2:
Input: nums = [0,0,1,1,1,2,2,3,3,4]
Output 5, nums = [0,1,2,3,4,_,_,_,_,_]
*/

/* 
here we need to find the unique elements and in-place them in proper position 
Approcach: We can use 2-pointer
1) pointer - find all unique elements
2) pointer - maintains where the position will place and then we will do a shifting of it.

*/

function removeDuplicates(nums) {
  let x = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > nums[x]) {
      x = x + 1;
      nums[x] = nums[i];
    }
  }
  return x + 1;
  /* DRY run
  Input: nums = [0,0,1,1,1,2,2,3,3,4]   

    i = 0 => nums[i] = 0, nums[x] = 0 => not greater => skip
    i = 1 => nums[i] = 0, nums[x] = 0 => not greater => skip
    i = 2 => nums[i] = 1, nums[x] = 0 => GREATER => x = 1, nums[1] = 1
    i = 3 => nums[i] = 1, nums[x] = 1 => not greater => skip
    i = 4 => nums[i] = 1, nums[x] = 1
    i = 5 => nums[i] = 2, nums[x] = 1 GREATER => x = 2, nums[5] = 2
    i = 6 => nums[i] = 2, nums[x] = 2 not greater => skip
    i = 7 => nums[i] = 3, nums[x] = 2 GREATER => x = 3, nums[7] = 3
    i = 8 => nums[i] = 3, nums[x] = 3 not greater => skip
    i = 9 => nums[i] = 4, nums[x] = 3 GREATER => x = 4, nums[9] = 4
    x = 4, loop ends here, return x + 1 = 5 unique elements.

  */
}

/*
Complexity
Time: O(n)
Space: O(1)
*/

console.log("########### REMOVE DUPLICATES***********");
console.log(removeDuplicates([1, 1, 2])); // 2
console.log(removeDuplicates([0, 0, 1, 1, 1, 2, 2, 3, 3, 4])); // 5
