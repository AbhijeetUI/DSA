// Minimum steps to make sum and the product of all elements of array non-zero
/*
Input: N = 4, arr[] = {0, 1, 2, 3} 
Output: 1 
Explanation: 
As product of all elements of the array is zero 
Increment the array element 0 by 1, such that array sum and product is not equal to zero.
Input: N = 4, arr[] = {-1, -1, 0, 0} 
Output: 3 
Explanation: 
As product of all elements of the array is zero 
Increment the array element 2 and 3 by 1, such that array sum and product is not equal to zero 
*/

/*

Approach: The idea is to break problem into two parts that is - 
 
Minimum steps required to make the array sum and product not equal to zero.

Input: N = 4, arr[] = {0, 1, 2, 3} 
Iterate over the array to find, if there is an element that is 0,
if yes, then increment it by 1 and also increment the number of steps by 1.

Again, Iterate over the updated array,
To check if the array sum is 0.
if the array sum of the updated array is 0, then increment any element by 1.
*/

/*

    let n = 4;
    let a = [-1, -1, 0, 0];
    let count = steps(n, a); // 3

*/

function minimumSteps(arr) {
  let steps = 0;
  let sum = 0;
  let hasNonMinusOne = false;

  for (let num of arr) {
    if (num === 0) {
      steps++; // increment 0 to 1
      sum += 1;
    } else {
      sum += num;
    }
    if (num !== -1) {
      hasNonMinusOne = true;
    }
  }

  // If sum is 0 after fixing zeros, increment one more element (avoiding -1 to prevent creating zero)
  if (sum === 0) {
    if (hasNonMinusOne) {
      steps++;
    }
    // If no non -1 elements, sum couldn't be 0 anyway
  }

  return steps;
}

// Test cases
console.log(minimumSteps([0, 1, 2, 3])); // Output: 1
console.log(minimumSteps([-1, -1, 0, 0])); // Output: 3
console.log(minimumSteps([1, -1])); // Output: 1
console.log(minimumSteps([-1, -1])); // Output: 0
