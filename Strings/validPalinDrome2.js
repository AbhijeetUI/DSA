// in this approach we are using 2-pointer
/*
pointer i = 0
pointer j = last character
we need to increase i and decrease j, in case of we have alphanumeric characters with s[i], s[j] are same.
if any of the characters not match, that means string is not palindrome
*/
/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function (s) {
  s = s.toLowerCase();
  let i = 0;
  let j = s.length - 1;
  while (i < j) {
    if (!s[i].match(/[a-z0-9]/i)) {
      i++;
    } else if (!s[j].match(/[a-z0-9]/i)) {
      j--;
    } else if (s[i] === s[j]) {
      i++;
      j--;
    } else {
      return false; // any of the characters are not palindrome
    }
  }
  return true;
};
