// https://leetcode.com/problems/find-words-containing-character/
/*
Example 1:

Input: words = ["leet","code"], x = "e"
Output: [0,1]
Explanation: "e" occurs in both words: "leet", and "code". Hence, we return indices 0 and 1.
Example 2:

Input: words = ["abc","bcd","aaaa","cbc"], x = "a"
Output: [0,2]
Explanation: "a" occurs in "abc", and "aaaa". Hence, we return indices 0 and 2.
Example 3:

Input: words = ["abc","bcd","aaaa","cbc"], x = "z"
Output: []
Explanation: "z" does not occur in any of the words. Hence, we return an empty array.
*/

/**
 * @param {string[]} words
 * @param {character} x
 * @return {number[]}
 */
var findWordsContaining = function (words, x) {
  let res = [];
  for (let i = 0; i < words.length; i++) {
    /* if(words[i].includes(x)){
            res.push(i)
        } */
    for (let j = 0; j < words[i].length; j++) {
      if (words[i][j] === x) {
        // l,e,e,t
        // c,o,d,e
        res.push(i);
        break; // as soon as we found x in str, no need to run the loop again
      }
    }
  }
  return res;
};

/* 
time complexity : O(m*n) // m no. of words and n max length of each word, loop inside loop and we're finding char inside word
space complexity: O(1) // why - you need to return new array and we are not using res array, its just to return
*/
