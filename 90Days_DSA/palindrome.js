/*
https://leetcode.com/problems/valid-palindrome/description/

Example 1:

Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.
Example 2:

Input: s = "race a car"
Output: false
Explanation: "raceacar" is not a palindrome.
Example 3:

Input: s = " "
Output: true
Explanation: s is an empty string "" after removing non-alphanumeric characters.
Since an empty string reads the same forward and backward, it is a palindrome.

Constraints:

1 <= s.length <= 2 * 10^5
s consists only of printable ASCII characters.
*/

/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function (s) {
  const regEx = /[a-z]/;
  const str = s.toLowerCase().split(" ").join("");
  let properStr = "";
  for (const char of str) {
    if (regEx.test(char)) {
      properStr += char;
    }
  }
  return properStr.reverse();
};

console.log(isPalindrome("A man, a plan, a canal: Panama"));

// this approacg performs multiple consequtive passes over the string and creates massive multiple memory overhead
/*

• Time Complexity: O(N)
	• .toLowerCase() scans the string once.
	• The for...of loop with regEx.test() scans it a second time.
	• .split("") loops to create an array.
	• .reverse() loops to flip the array.
	• .join("") loops to glue it back together.
	• Result: While technically linear (O(N)), it takes roughly 5N operations.
*/

/**
 * @param {string} s
 * @return {boolean}
 */

// two pointer - single pass where we check on a-z/A-Z/0-9 characters using charCodeAt
// we compare only alphanumeric characters and char from left and righ should be same and return true
var isPalindromeOptimized = function (s) {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (!isAplhaNumeric(s[left])) {
      left++;
      continue;
    }
    if (!isAplhaNumeric(s[right])) {
      right--;
      continue;
    }
    if (s[left] !== s[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
};

console.log(isPalindrome("A man, a plan, a canal: Panama"));

/*
Step-by-step dry run for the intended two-pointer approach:
Input: "A man, a plan, a canal: Panama"

Start: left = 0 ("A"), right = 29 ("a")
Compare only letters/digits, ignoring spaces and punctuation.
For this example, compare characters without case sensitivity.

1. "A" and "a" -> same letter; move both pointers inward.
   left = 1, right = 28
2. left is a space -> skip it.
   left = 2, right = 28
3. "m" and "m" -> match; move both.
   left = 3, right = 27
4. "a" and "a" -> match; move both.
   left = 4, right = 26
5. "n" and "n" -> match; move both.
   left = 5, right = 25
6. left is a comma -> skip it, then skip the following space.
   left = 7, right = 25
7. "a" and "a" -> match; move both.
   left = 8, right = 24
8. left is a space -> skip it.
   left = 9, right = 24
9. "p" and "P" -> same letter ignoring case; move both.
   left = 10, right = 23
10. right is a space, then a colon -> skip both.
    left = 10, right = 21
11. "l" and "l" -> match; move both.
    left = 11, right = 20
12. "a" and "a" -> match; move both.
    left = 12, right = 19
13. "n" and "n" -> match; move both.
    left = 13, right = 18
14. left is a comma and then a space -> skip both.
    left = 15, right = 18
15. "a" and "a" -> match; move both.
    left = 16, right = 17
16. "c" and "c" -> match; move both.
    left = 17, right = 16

Now left >= right, so all relevant character pairs matched and the intended
result is true.

Note: the current function needs an isAplhaNumeric helper, and its comparison
must ignore letter case for this example (for example, compare lowercase
characters). Otherwise the current code will not produce this walkthrough.
*/
