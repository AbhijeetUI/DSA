/*
Problem: https://leetcode.com/problems/valid-anagram/description/
Constraints: 
1 <= s.length, t.length <= 5 * 10(4) 
=> both strings have at lease 1 character, so no need to handle empty string check
=> strings can grow upto 50,000 characters
=> as brute force approach using nested approach will take O(n2), which will trigger TLE error
=> so while choosing we need to solve in O(n log n) => divide and conquer/sorting or O(n) => hashing
s and t consist of lowercase English letters.
*/

var isValid = (s, t) => {
  // 1. Guard clause: Anagrams must be the exact same length
  if (s.length !== t.length) return false;

  let map = {};

  // 2. Count character frequencies in s
  for (const char of s) {
    map[char] = (map[char] || 0) + 1;
  }

  // 3. Decrement frequencies using t
  // We need to decrement the character frequencies in the second loop to verify that
  // the two strings have the exact same count for every character.
  for (const char of t) {
    // If the character doesn't exist or its count is already 0
    if (!map[char]) {
      return false;
    }
    map[char]--;
  }

  return true;
};

console.log(isValid("anagram", "nagaram")); // true

var isValidOneLoop = (s, t) => {
  // 1. Guard clause: Anagrams must be the exact same length
  if (s.length !== t.length) return false;

  let map = {};

  // 2. Count character frequencies in both strings simultaneously
  for (let i = 0; i < s.length; i++) {
    const charS = s[i];
    const charT = t[i];

    // Increment for s, decrement for t
    map[charS] = (map[charS] || 0) + 1;
    map[charT] = (map[charT] || 0) - 1;
  }
  // 3. If it's a perfect anagram, all counts must be exactly 0
  for (const key in map) {
    if (map[key] !== 0) return false;
  }

  return true;
};

console.log(isValidOneLoop("anagram", "nagaram")); // true
console.log(isValidOneLoop("rat", "car")); // false

/*

i	s[i] adds 1	t[i] subtracts 1	Map after iteration
0	a	       n	                        { a: 1, n: -1 }
1	n	a	                        { a: 0, n: 0 }
2	a	g	                        { a: 1, n: 0, g: -1 }
3	g	a	                        { a: 0, n: 0, g: 0 }
4	r	r	                        { a: 0, n: 0, g: 0, r: 0 }
5	a	m	                        { a: 1, n: 0, g: 0, r: 0, m: -1 }
6	m	a	                        { a: 0, n: 0, g: 0, r: 0, m: 0 }


*/
