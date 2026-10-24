/*
https://leetcode.com/problems/group-anagrams/

Constraints:

1 <= strs.length <= 10(4)
=> meanse array has at least 1 str present and at most it has 10,000 strins
0 <= strs[i].length <= 100
=> and the strings in the array could be "" or having at most 100 characters in it
strs[i] consists of lowercase English letters.
=> only lowercase characters are present
*/

/**
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagrams = function (strs) {
  const map = {};

  for (const str of strs) {
    // Sort the string to create a unique key for the anagram group
    const sortedStr = str.split("").sort().join("");

    // If the key doesn't exist in the map, initialize it with an empty array
    if (!map[sortedStr]) {
      map[sortedStr] = [];
    }

    // Push the original string into the corresponding anagram group
    map[sortedStr].push(str);
  }

  // Return all grouped arrays
  return Object.values(map);
};

console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
// [["bat"],["nat","tan"],["ate","eat","tea"]]

/*
 * Complexity Analysis
 *
 * | Complexity      | Scale             | Reason                                      |
 * |-----------------|-------------------|---------------------------------------------|
 * | Time complexity | O(N * K log K)    | Sort each of the N strings (up to K chars). |
 * | Space complexity| O(N * K)          | Store all N strings in the hash map.        |
 */

var groupAnagramsOptimal = function (strs) {
  const map = {};
  for (const str of strs) {
    const count = new Array(26).fill(0);
    for (let i = 0; i < str.length; i++) {
      const index = str.charCodeAt(i) - 97;
      count[index]++;
    }
    const key = count.join(",");
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(str);
  }
  return Object.values(map);
};

console.log(groupAnagramsOptimal(["eat", "tea", "tan", "ate", "nat", "bat"]));

/*
 * Complexity Analysis
 *
 * | Complexity      | Scale    | Reason                                                                                   |
 * |-----------------|----------|------------------------------------------------------------------------------------------|
 * | Time complexity | O(N * K) | Visit each character once across N strings. The 26-count array has a fixed-size encoding. |
 * | Space complexity| O(N * K) | Store the input strings in the hash map; space grows with their total character count.   |
 */
