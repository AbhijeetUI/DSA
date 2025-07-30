// https://leetcode.com/problems/length-of-last-word/
/*

Example 1:

Input: s = "Hello World"
Output: 5
Explanation: The last word is "World" with length 5.
Example 2:

Input: s = "   fly me   to   the moon  "
Output: 4
Explanation: The last word is "moon" with length 4.
Example 3:

Input: s = "luffy is still joyboy"
Output: 6
Explanation: The last word is "joyboy" with length 6.
*/

/**
 * @param {string} s
 * @return {number}
 */
/*
Approach 1: 
1) removing trailing spaces and reaches to last word
2) count the last word length
*/
var lengthOfLastWord = function (s) {
  // trim all the spaces at the end
  let n = s.length - 1; // start from last char
  while (n >= 0) {
    // means we reached at end of the string
    if (s[n] !== " ")
      // as soon as i find the space, break the loop otherwise decrement the n
      break;
    --n;
  }
  let cnt = 0;
  // count the characters till you reach the space
  while (n >= 0) {
    if (s[n] === " ") break; // break the loop if ofund space, otheriwse decrement n and increment count
    --n;
    ++cnt; // count the chars
  }
  return cnt;

  // time complexity is O(n)
  // space complexity is O(1) -> as we're not creating array, strings out of it, we're counting in-place
};

var lengthOfLastWordOneLoop = function (s) {
  // trim all the spaces at the end
  let n = s.length - 1; // start from last char
  let cnt = 0;
  while (n >= 0) {
    if (s[n] !== " ") {
      // if any word found
      ++cnt;
    } else if (cnt > 0) {
      // means we already have found the word and count was increased, but when that word encounters with space
      break;
    }
    --n;
  }
  return cnt;

  // time complexity is O(n)
  // space complexity is O(1) -> as we're not creating array, strings out of it, we're counting in-place
};
