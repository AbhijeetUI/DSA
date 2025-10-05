var groupAnagrams = function (words) {
  /* Apprach 2:
    fixed-size array that counts how many times each letter appears.
    */

  // The key will be a hashed representation of character frequencies.
  const map = new Map();

  // For each word, we’ll build a frequency array of 26 elements
  for (const word of words) {
    const freq = new Array(26).fill(0);
    for (const char of word) {
      freq[char.charCodeAt(0) - 97]++;
    }
    // Convert Frequency Array to a Key
    const key = freq.join("#");
    // This key uniquely identifies all anagrams of .
    // 1#0#0#
    // # delimeter means letter with its occurance
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(word);
  }

  return Array.from(map.values());
};
