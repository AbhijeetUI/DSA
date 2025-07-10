/*
Given an array of integers nums which is sorted in ASC order and integer target.
Write a function to search target in nums. If target exists then return index otherwise return -1.
Complexity should be O(log n)

Example 1:
Input: [-1,0,3,5,9,12] target = 9
Output: 4
*/

function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  // for-loop can be used only when we need traverse array in sequence, we can write using.

  // so we will use while-loop beacause we need to move left, right pointer
  while (right >= left) {
    // in base condition we need to check >= bcoz if nums has only 1 element, then left and right is 0
    let middleEle = Math.floor((left + right) / 2); // to ignore decimals
    if (nums[middleEle] === target) {
      return middleEle;
    } else if (target > nums[middleEle]) {
      left = middleEle + 1;
    } else {
      right = middleEle - 1;
    }
  }
  return -1;
}

console.log("############# BINARY SEARCH ###########");
console.log(binarySearch([-1, 0, 3, 5, 9, 12], 9));

/*
when you divide an array into small, in such cases the time complexity will be O(log n)
we used 3 vairables so O(3) => O(1)
*/
