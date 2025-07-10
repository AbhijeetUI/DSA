/* 
Given an integer n return true if it is a power of two. Otherwise, return false 

Example 1:
Input: n = 1
Output: true
Explanation: 2 to the power 0 = 1

Example 2:
Input: n = 16
Output: true
Explanation: 2 to the power 4 = 1

Example 1:
Input: n = 3
Output: false

*/
function isPowerOfTwo(n) {
  // base condition if(n) is power of 2 till it reaches to 1 by diving 2 and odd numbers can not be power of 2
  if (n === 1) return true; // return true if n as 1
  else if (n < 1 || n % 2 !== 0) return false; // to find odd number
  return isPowerOfTwo(n / 2);
}

console.log(isPowerOfTwo(8)); // true
console.log(isPowerOfTwo(18)); // false
/*
Time Complexity: O(log n)
Space Complexity: O(log n) (due to recursion stack)
*/
