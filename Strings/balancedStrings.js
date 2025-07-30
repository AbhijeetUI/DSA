// https://leetcode.com/problems/split-a-string-in-balanced-strings/
/**
 * @param {string} s
 * @return {number}
 */

// using 2 variables to make Left and right count separate
/* var balancedStringSplit = function (s) {
  let lCnt = 0;
  let rCnt = 0;
  let pairCnt = 0;
  for (let i = 0; i < s.length; i++) {
    s[i] === "L" ? lCnt++ : rCnt++;
    if (lCnt === rCnt) {
      pairCnt++;
      lCnt = 0;
      rCnt = 0;
    }
  }
  return pairCnt;
}; */

// using only 1 variable to maintain count
var balancedStringSplit = function (s) {
  let tempCnt = 0;
  let pairCnt = 0;
  for (let i = 0; i < s.length; i++) {
    s[i] === "L" ? tempCnt++ : tempCnt--;
    if (tempCnt === 0) {
      // if temp 0, then we found a pair
      pairCnt++;
      tempCnt = 0;
    }
  }
  return pairCnt;
};
