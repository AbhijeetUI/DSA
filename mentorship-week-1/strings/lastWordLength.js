function lengthOfLastWord(s) {
  const wordLists = s.split(" ");
  let formattedWordList = [];
  for (const word of wordLists) {
    if (word.length > 0) formattedWordList.push(word);
  }
  const lastWord = formattedWordList[formattedWordList.length - 1].length;
  return lastWord;
}

console.log(lengthOfLastWord("Hello World"));
console.log(lengthOfLastWord("   fly me   to   the moon  "));
console.log(lengthOfLastWord("luffy is still joyboy"));

/*
Time Complexity: $O(N)$$N$ is the total length of the input string s.s.split(" ") scans the string from left to right in $O(N)$ time.
The for...of loop iterates over the resulting array tokens in $O(N)$ cumulative time.Array indexing formattedWordList[length - 1] 
and checking .length take $O(1)$ time.
Space Complexity: $O(N)$s.split(" ") creates a new array of substrings taking $O(N)$ auxiliary space.formattedWordList allocates a second array storing non-empty words, using up to $O(N)$ additional memory.
*/

function lengthOfLastWordOptimized(s) {
  let len = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] !== " ") {
      len++;
    } else if (len > 0) {
      break;
    }
  }
  return len;
}

console.log(lengthOfLastWordOptimized("Hello World"));
console.log(lengthOfLastWordOptimized("   fly me   to   the moon  "));
console.log(lengthOfLastWordOptimized("luffy is still joyboy"));
