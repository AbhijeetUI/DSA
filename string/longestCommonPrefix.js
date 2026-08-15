/*
Longest Common Prefix
Given an array of strings arr[], return the longest common prefix among each and every strings present in the array.
If there’s no prefix common in all the strings, return "".

Input: arr[] = ["geeksforgeeks", "geeks", "geek", "geezer"]
Output: "gee"
Explanation: "gee" is the longest common prefix in all the given strings: "geeksforgeeks", "geeks", "geeks" and "geezer".

Input: arr[] = ["apple", "ape", "april"]
Output: "ap"
Explanation: "ap" is the longest common prefix in all the given strings: "apple", "ape" and "april".

Input: arr[] = ["hello", "world"]
Output: ""
Explanation: There’s no common prefix in the given strings.
*/

// -------------------------------
// Brute Force Approach
// -------------------------------
// Idea: Take the first string as the reference and compare its characters
// with the same positions in every other string. If any mismatch is found,
// stop and return the prefix collected so far.
function longestCommonPrefixBrute(arr) {
  if (arr.length === 0) return "";

  const first = arr[0];
  let prefix = "";

  for (let i = 0; i < first.length; i++) {
    const currentChar = first[i];

    for (let j = 1; j < arr.length; j++) {
      if (arr[j][i] !== currentChar) {
        return prefix;
      }
    }

    prefix += currentChar;
  }

  return prefix;
}

// -------------------------------
// Optimized Approach
// -------------------------------
// Idea: Use the first string as the initial prefix and keep shrinking it
// until it becomes a prefix of every next string.
// This avoids repeatedly checking every possible character length.
function longestCommonPrefixOptimized(arr) {
  if (arr.length === 0) return "";

  let prefix = arr[0];

  for (let i = 1; i < arr.length; i++) {
    while (arr[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, prefix.length - 1);

      if (prefix === "") {
        return "";
      }
    }
  }

  return prefix;
}

function longestCommonPrefix_Sorting(arr) {
  if (arr.length === 0) return "";
  if (arr.length === 1) return arr[0];
  arr.sort(); //sort alphabetically

  const first = arr[0];
  const last = arr[arr.length - 1];

  let i = 0;
  while (i < first.length && first[i] === last[i]) {
    i++;
  }
  return first.substring(0, i);
}
/*
Dry run - Brute Force
Input: ["geeksforgeeks", "geeks", "geek", "geezer"]

first = "geeksforgeeks"
prefix = ""

i = 0, currentChar = 'g'
  Compare 'g' with arr[1][0] => 'g', arr[2][0] => 'g', arr[3][0] => 'g'
  prefix = "g"

i = 1, currentChar = 'e'
  Compare 'e' with arr[1][1] => 'e', arr[2][1] => 'e', arr[3][1] => 'e'
  prefix = "ge"

i = 2, currentChar = 'e'
  Compare 'e' with arr[1][2] => 'e', arr[2][2] => 'e', arr[3][2] => 'e'
  prefix = "gee"

i = 3, currentChar = 'k'
  Compare 'k' with arr[1][3] => 'k', arr[2][3] => 'k', arr[3][3] => 'e'
  mismatch at arr[3][3]
  return "gee"

Output: "gee"
*/

/*
Dry run - Optimized
Input: ["apple", "ape", "april"]

prefix = "apple"

i = 1, arr[1] = "ape"
  "ape".indexOf("apple") !== 0 => true
  shrink prefix -> "appl"
  "ape".indexOf("appl") !== 0 => true
  shrink -> "app"
  "ape".indexOf("app") !== 0 => true
  shrink -> "ap"
  "ape".indexOf("ap") === 0 => true

i = 2, arr[2] = "april"
  "april".indexOf("ap") === 0 => true

Return: "ap"
*/

console.log(
  "Brute:",
  longestCommonPrefixBrute(["geeksforgeeks", "geeks", "geek", "geezer"]),
);
console.log(
  "Optimized:",
  longestCommonPrefixOptimized(["apple", "ape", "april"]),
);
console.log(
  "No common prefix:",
  longestCommonPrefixOptimized(["hello", "world"]),
);
