/*
Given an array, the task is to cyclically right-rotate the array by one. 

Examples:  

Input: arr[] = [1, 2, 3, 4, 5] 
Output: [5, 1, 2, 3, 4]

Input: arr[] = [2, 3, 4, 5, 1]
Output: [1, 2, 3, 4, 5]
*/

// Approach 1 : Shifting each element - O(n) time and O(1) space
function rotateApproach1(arr) {
  const lastElement = arr[arr.length - 1];
  // assign each value by its previous element
  for (let i = arr.length - 1; i > 0; i--) {
    arr[i] = arr[i - 1];
  }

  arr[0] = lastElement;
}

const arr = [1, 2, 3, 4, 5];
rotateApproach1(arr);
console.log(arr);

// Approach 2 : Two pointers - O(n) time and O(1) space
function rotateApproach2(arr) {
  let i = 0,
    j = arr.length - 1;
  while (i !== j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    i++;
  }
}
