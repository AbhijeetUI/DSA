/**
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagrams = function (strs) {
  /* Apprach 1:
    Sort each string for ex, eat becomes aet, then group sorted together
    T = O(n * (m log m))
    S = O(n * m)  n = no.of strings and m is max length of each string
    */
  let map = {};
  for (let i = 0; i < strs.length; i++) {
    // n times
    let sortedStr = strs[i].split("").sort().join(""); // sort each string in str array i.e; m log m
    if (!map[sortedStr]) {
      // check if sorted string present in map, if not add it in array to map
      map[sortedStr] = [strs[i]];
    } else {
      // if present then directly push it into map
      map[sortedStr].push(strs[i]);
    }
  }
  //console.log(map); { aet: [ 'eat', 'tea', 'ate' ], ant: [ 'tan', 'nat' ], abt: [ 'bat' ] }
  return Object.values(map); // return values of map object; [["eat","tea","ate"],["tan","nat"],["bat"]]
};
