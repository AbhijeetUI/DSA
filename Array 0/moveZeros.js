/*
Given an integer array nums, move all 0's to the end of it while maintainting the relative order of the non-zero elements.
Note: you must do this in-place without making a copy of the array.

Example 1:
Input: nums = [0,1,03,12]
Output: [1,3,12,0,0]
*/

function moveZeros(nums) {
  /*
    here we use 2 pointer approach 
    1 variable to shift non-zero number
    1 variable to traverse and increment
  */
  let x = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > 0) {
      nums[x] = nums[i];
      x += 1;
    }
  }
  // Fill the rest with zeros
  for (let i = x; i < nums.length; i++) {
    nums[i] = 0;
  }
  return nums;
}

console.log("############# MOVE ZEROS #############");
console.log(moveZeros([0, 1, 0, 3, 12]));
console.log(moveZeros([12, 3, 11, 0, 1, 2, 0, 0, 34]));
