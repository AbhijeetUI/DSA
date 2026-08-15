function mergedStrings(word1, word2) {
  const maxLen = Math.max(word1.length, word2.length);
  let mergedString = "";

  for (let i = 0; i < maxLen; i++) {
    mergedString += (word1[i] ?? "") + (word2[i] ?? "");
  }

  return mergedString;
}

console.log(mergedStrings("abc", "pqr")); // apbqcr
console.log(mergedStrings("ab", "pqrs")); // apbqrs

/*
Complexity Analysis1. 
Time Complexity: $O(n + m)$Where $n$ is word1.length and $m$ is word2.length.Math.max(n, m) runs in $O(1)$ time.
The for loop executes $\max(n, m)$ times.In each iteration, accessing characters and appending them takes constant time on average. 
Overall, building the output string requires visiting and appending all $n + m$ characters.Therefore, total time complexity is $O(n + m)$ (or $O(\max(n, m))$).2. Space Complexity: $O(n + m)$Auxiliary Memory: $O(1)$ extra space, as only basic scalar variables (maxLen, i) are maintained.Total Memory: $O(n + m)$ to construct and return the resulting output string of combined length $n + m$.
*/
