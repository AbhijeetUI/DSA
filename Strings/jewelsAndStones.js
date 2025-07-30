// https://leetcode.com/problems/jewels-and-stones/
/*


*/
/**
 * @param {string} jewels
 * @param {string} stones
 * @return {number}
 */
var numJewelsInStones = function (jewels, stones) {
  let cnt = 0;
  // brute force approach
  /* for (let i = 0; i < stones.length; i++) {
    for (let j = 0; j < jewels.length; j++) {
      if (stones[i] === jewels[j]) {
        cnt++;
      }
    }
  }
  return cnt;
  // time complexity is O(m *n) */

  // Hashmap or Set approach, bcoz finding element inside set is O(1) * n = O(n)
  let jSet = new Set(); // maximum elements in the Set would be 52(26+26), even if we have lot of elements, so space complexity is O(1)
  for (let i = 0; i < jewels.length; i++) {
    jSet.add(jewels[i]); // adding only unique element
  }
  for (let i = 0; i < stones.length; i++) {
    if (jSet.has(stones[i])) {
      // check if every char of stones is in jSet or not and increment count
      cnt++;
    }
  }
};
