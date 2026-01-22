// Reverse words in a string separated by a delimiter (e.g., ".")
// Input: s = "i.like.this.program.very.much"
// Output: "much.very.program.this.like.i"

/*
TWO POINTER APPROACH:

ALGORITHM:
1. Split the string by delimiter to get words array
2. Use two pointers (left and right) at the beginning and end of the words array
3. Swap words from both ends moving towards the center
4. Join the reversed words back with the delimiter

EXAMPLE: s = "i.like.this.program.very.much", delimiter = "."

Step 1: Split by "."
  words = ["i", "like", "this", "program", "very", "much"]
  left = 0, right = 5

Step 2: Swap words[0] and words[5]
  words = ["much", "like", "this", "program", "very", "i"]
  left = 1, right = 4

Step 3: Swap words[1] and words[4]
  words = ["much", "very", "this", "program", "like", "i"]
  left = 2, right = 3

Step 4: Swap words[2] and words[3]
  words = ["much", "very", "program", "this", "like", "i"]
  left = 3, right = 2

Step 5: left > right, stop

Step 6: Join with "."
  OUTPUT: "much.very.program.this.like.i"
*/

function reverseWordsUsingTwoPointer(s, delimiter = ".") {
  // Split string into words
  let words = s.split(delimiter);

  // Two pointer approach
  let left = 0;
  let right = words.length - 1;

  // Swap words from both ends
  while (left < right) {
    [words[left], words[right]] = [words[right], words[left]];
    left++;
    right--;
  }

  // Join the reversed words back
  return words.join(delimiter);
}

// Test cases
const s1 = "i.like.this.program.very.much";
console.log("Input:", s1);
console.log("Output:", reverseWordsUsingTwoPointer(s1)); // Output: much.very.program.this.like.i

const s2 = "hello-world-from-javascript";
console.log("\nInput:", s2);
console.log("Output:", reverseWordsUsingTwoPointer(s2, "-")); // Output: javascript-from-world-hello

const s3 = "a b c d e";
console.log("\nInput:", s3);
console.log("Output:", reverseWordsUsingTwoPointer(s3, " ")); // Output: e d c b a

/*
TIME COMPLEXITY: O(n) - Single pass to split, then O(n/2) swaps = O(n)
SPACE COMPLEXITY: O(n) - For storing the words array

ADVANTAGES OF TWO POINTER APPROACH:
- In-place swapping (minimal extra space for swaps)
- Single logical pass through the data
- Efficient for large strings
- No need for reversing built-in functions
*/
