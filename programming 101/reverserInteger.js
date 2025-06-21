/*

Reverse Integer

Example 1
Input x = 123
Output: 321

Example 2
Input x = -123
Output: -321

Example 3
Input x = 120
Output: 21

CORNER CASE
we need to check -2 power 31 and 2 power 31
value of 2 power 31 is 2147483648
if our reverse < -2147483648 or reverse > 2147483648-1, then we need to return 0

Solution is same as palindrome, but here we need to handle negative number
1) Make a copy of original num
2) Convert original num to Math.abs(num)
3) Apply palindrome logic
4) Return if copyOfNum < 0, -reverse or reverse

*/

function reverseInteger(num) {
  let copyNum = num;
  let reverse = 0;
  num = Math.abs(num);
  while (num > 0) {
    let reminder = num % 10;
    reverse = reverse * 10 + reminder;
    num = Math.floor(num / 10);
  }
  let limit = 2 ** 31;
  if (reverse < -limit || reverse > limit) return 0;
  return copyNum < 0 ? -reverse : reverse;
}

console.log("############ Reverse Integer ###########");
console.log(reverseInteger(123));
console.log(reverseInteger(-123));
console.log(reverseInteger(120));
