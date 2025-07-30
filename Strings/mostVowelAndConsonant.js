// https://leetcode.com/problems/find-most-frequent-vowel-and-consonant/
/**
 * @param {string} s
 * @return {number}
 */
var maxFreqSum = function (s) {
  const vowels = new Set(["a", "e", "i", "o", "u"]);
  let vowelFreq = 0,
    consonantFreq = 0;
  const freq = {};

  for (const ch of s) {
    freq[ch] = (freq[ch] || 0) + 1;
  }

  for (const [ch, count] of Object.entries(freq)) {
    if (vowels.has(ch)) {
      vowelFreq = Math.max(vowelFreq, count);
    } else {
      consonantFreq = Math.max(consonantFreq, count);
    }
  }

  return vowelFreq + consonantFreq;
};
