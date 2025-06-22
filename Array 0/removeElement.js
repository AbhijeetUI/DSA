/*
Input: nums = [3,2,2,3], val = 3
Output: 2, nums = [2,2,_,_]
Explanation: Your function should return k = 2, with the first two elements of nums being 2.
It does not matter what you leave beyond the returned k (hence they are underscores).

Input: nums = [0,1,2,2,3,0,4,2], val = 2
Output: 5, nums = [0,1,4,0,3,_,_,_]
Explanation: Your function should return k = 5, with the first five elements of nums containing 0, 0, 1, 3, and 4.
*/

/* 
SOLUTION:
here we need to check passed value and in-place them in proper position 
Approcach: We can use 2-pointer
1) pointer - check valu with array element
2) pointer - maintains where the position will place and then we will do a shifting of it.
*/

function removeElement(nums, val) {
  let x = 0;
  for (let i = 0; i < nums.length; i++) {
    // shift elements to left if it not equal to val
    if (nums[i] !== val) {
      nums[x] = nums[i];
      x += 1; // x maintains the position where we need to shift
    }
  }
  return x;

  /*
    DRY RUN 
    Input: nums = [3,2,2,3], val = 3
  
    i = 0 => nums[0] = 3 = 3 => skip
    i = 1 => nums[1] = 2 != 3 =>, x = 1
    i = 2 => nums[2] = 2 != 3 => x = 2
    i = 3 => nums[3] = 3 = 3 => skip

    return x // bcoz our x already move to next position
    */
}
/*
Complexity
Time: O(n)
Space: O(1)
*/

console.log("########### REMOVE ELEMENT***********");
console.log(removeElement([3, 2, 2, 3])); // 2
console.log(removeElement([0, 1, 2, 2, 3, 0, 4, 2])); // 5
