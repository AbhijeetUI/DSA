// https://leetcode.com/problems/valid-palindrome/
/*
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
*/
// In this approach we are using extra space
/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function (s) {
  // filtered value
  let filteredValue = "";
  s = s.toLowerCase();
  let rev = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i].match(/[a-z0-9]/i)) {
      // filter alhanumeric characters only
      filteredValue += s[i];
      rev = s[i] + rev; //appending characters from left
    }
  }
  /*
    filterValue = rac // from right
    rev = car // from left
    T = O(n)
    S = O(2n) => O(n) -> can we solve using -> O(1)
    */
  return filteredValue === rev;
};
