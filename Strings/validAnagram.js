/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function (s, t) {
  // approach 1 using in-built functions n(log n)
  //return s.split("".sort().join("")) === t.split("".sort().join(""))

  /* approach 2 in-which we can check count of each characters of one string with count of characters of other str, if it equals, then we can say both strings are anagram
    using HashMap can be use for this counting, but instead of maintaining 2 maps, we can use single map:
    which we reduce occerance of each chars, if found
    T: O(n)
    S: O(1) // no separate array/object/no copy of string we store only a-z english letters in map
    */
  if (s.length !== t.length) return false;
  let map = {}; // hasmap to store count of each character
  for (let char of s) {
    map[char] = (map[char] || 0) + 1;
  }
  console.log(map);
  for (let char of t) {
    if (!map[char] || map[char] <= 0) {
      return false;
    } else {
      map[char] = map[char] - 1;
    }
    return true;
  }
};
