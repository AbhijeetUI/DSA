// write a function which checks whether a number is palindrome or not
// Palindrome means the number read from right to left and left to right is same.
/*
Example 1:
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and right to left

Example 2:
Input: x = 10
Output: false
Explanation: Reads 01 from right to left, so its not a palindrome
*/

/* Strategy 
1) reverse number
=> 1234 to reverse a number we have to find last digit and keep adding it rev = 4 and remove 4 and find last digit from number and add to reverse and so on.
=> 4321
2) how to find last digit of a number
=> n%10 = reminder gives last number 
   1234 % 10 = 4
   1234 / 10 = removing last digit
*/

function isPalindrome(num) {
  let reverse = 0;
  let copyNum = num;
  if (num < 0) return false; // corner case is number is negative
  while (num > 0) {
    /*
    DRY RUN 
    1) 1234 % 10 = 4 is remainder
    rev = 10 * 0 + 4 = 4;
    num = num / 10; removes last digit, so num = 123

    2) 123 % 10 = 3 
    rev = (10 * 4) + 3 = 43
    123 / 10 = 12

    3) 12 % 10 = 2
    rev = (10 * 43) + 2 = 432
    12/10 = 1

    4) 1 % 10 = 1
    rev = (10 * 432) + 1 = 4321;
    1/10 = 0

    */
    let remainder = num % 10;
    reverse = reverse * 10 + remainder;
    num = Math.floor(num / 10); // removes last digit // to get absolute number to remove decimals
  }
  return reverse === copyNum;
}

console.log("############ Palindrome ###########");
console.log(isPalindrome(1234)); // false
console.log(isPalindrome(121)); // true
console.log(isPalindrome(-121)); // false
