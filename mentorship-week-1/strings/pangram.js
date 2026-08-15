/*
Pangram
Given a string s, check if it is a Pangram or not.
A Pangram is a sentence containing every letter in the English Alphabet either in lowercase or uppercase.

Input: s = "The quick brown fox jumps over the lazy dog"
Output: true
Explanation: The input string contains all characters from 'a' to 'z'.

Input: s = "The quick brown fox jumps over the dog"
Output: false
Explanation: The input string does not contain all characters from 'a' to 'z', as 'l', 'z', 'y' are missing.
*/

function isPangram(s) {
  if (typeof s !== "string") return false;

  const foundLetters = new Set();
  const lowerStr = s.toLowerCase();

  for (let char of lowerStr) {
    if (char >= "a" && char <= "z") {
      foundLetters.add(char);
    }
  }

  return foundLetters.size === 26;
}

/*
Dry run
Input: "The quick brown fox jumps over the lazy dog"
lowerStr = "the quick brown fox jumps over the lazy dog"
Scan every character:
  - take only a-z letters
  - insert each letter in the Set
  - when Set size becomes 26, return true
Return: true

Input: "The quick brown fox jumps over the dog"
The scan finds letters like t, h, e, q, u, i, c, k, b, r, o, w, n, f, x, j, m, p, s, v, r, d, o, g
The Set never reaches 26 because letters like l, z, y are missing.
Return: false
*/

// Examples:
console.log(isPangram("The quick brown fox jumps over the lazy dog")); // true
console.log(isPangram("The quick brown fox jumps over the dog")); // false
