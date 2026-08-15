function isSubsequence(word, s) {
  let wordIndex = 0;

  for (const char of s) {
    if (wordIndex < word.length && char === word[wordIndex]) {
      wordIndex += 1;
    }

    if (wordIndex === word.length) {
      return true;
    }
  }

  return false;
}

function longestMatchingWord(d, s) {
  if (
    !Array.isArray(d) ||
    d.length === 0 ||
    typeof s !== "string" ||
    s.length === 0
  ) {
    return "";
  }

  let result = "";

  for (const word of d) {
    if (typeof word !== "string" || word.length === 0) {
      continue;
    }

    if (isSubsequence(word, s)) {
      if (word.length > result.length) {
        result = word;
      } else if (word.length === result.length && word < result) {
        result = word;
      }
    }
  }

  return result;
}

console.log(
  longestMatchingWord(["ale", "apple", "monkey", "plea"], "abpcplea"),
);
console.log(longestMatchingWord(["a", "b", "c"], "abpcplea"));

// Explanation: After deleting "b", "c", "a" s became "apple" which is present in d.
// Explanation: After deleting "b", "p", "c", "p", "l", "e", "a" s became "a" which is present in d.
