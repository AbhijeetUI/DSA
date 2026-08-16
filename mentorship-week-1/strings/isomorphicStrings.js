/*
Isomorphic Strings
Two strings s and t are isomorphic if each character in s can be replaced
with a corresponding character in t such that the mapping is one-to-one.

Example:
Input: s = "egg", t = "add"
Output: true
Explanation: 'e' -> 'a', 'g' -> 'd'

Input: s = "paper", t = "title"
Output: true
Explanation: 'p' -> 't', 'a' -> 'i', 'e' -> 'l', 'r' -> 'e'

Input: s = "foo", t = "bar"
Output: false
Explanation: 'o' in s maps to both 'a' and 'r' in t, which violates one-to-one mapping.
*/

// -------------------------------
// Brute Force Approach
// -------------------------------
// Idea: For every pair of positions i and j
// compare the relation of characters in s and the relation of characters in t.
// If two characters in s are equal, the corresponding t characters must also be equal.
// If two characters in s are different, the corresponding t characters must also be different.
function isomorphicStringsBrute(s, t) {
  if (s.length !== t.length) return false;

  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j < s.length; j++) {
      const sSame = s[i] === s[j];
      const tSame = t[i] === t[j];

      if (sSame !== tSame) {
        return false;
      }
    }
  }

  return true;
}

// -------------------------------
// Optimized Approach
// -------------------------------
// Idea: Keep two maps,
// one for s -> t and one for t -> s.
// This is O(n) time and O(1) extra space for the alphabet case.
function isomorphicStringsOptimized(s, t) {
  if (s.length !== t.length) return false;
  let mapStoT = {};
  let mapTtoS = {};
  for (let i = 0; i < s.length; i++) {
    // push values inside the map
    /*
    egg => add
    if(each char not present in mapStoT), then add it in map
    if(each char not present in mapTtoS), then add it in map
    */
    if (!mapStoT[s[i]] && !mapTtoS[t[i]]) {
      mapStoT[s[i]] = t[i]; // it stores e:a
      mapTtoS[t[i]] = s[i]; // it stores a:e
    } else if (mapTtoS[t[i]] !== s[i] || mapStoT[s[i]] !== t[i]) return false;
  }
  return true;
}

/*
Dry run - Brute Force
Input: s = "egg", t = "add"

Compare pair (0, 1):
  s[0] = 'e', s[1] = 'g' -> different
  t[0] = 'a', t[1] = 'd' -> different

Compare pair (1, 2):
  s[1] = 'g', s[2] = 'g' -> same
  t[1] = 'd', t[2] = 'd' -> same

No mismatch found, so return true.
*/

/*
Dry run - Optimized
Input: s = "paper", t = "title"

i = 0, s[0] = 'p', t[0] = 't'
  mapST: p -> t
  mapTS: t -> p

i = 1, s[1] = 'a', t[1] = 'i'
  mapST: a -> i
  mapTS: i -> a

i = 2, s[2] = 'p', t[2] = 't'
  mapST already contains p -> t, so it matches

i = 3, s[3] = 'e', t[3] = 'l'
  mapST: e -> l
  mapTS: l -> e

i = 4, s[4] = 'r', t[4] = 'e'
  mapST: r -> e
  mapTS: e -> r

return true
*/

/* console.log("Brute:", isomorphicStringsBrute("egg", "add"));
console.log("Brute:", isomorphicStringsBrute("paper", "title"));
console.log("Brute:", isomorphicStringsBrute("foo", "bar")); */

console.log("#Optimized:", isomorphicStringsOptimized("egg", "add"));
console.log("#Optimized:", isomorphicStringsOptimized("paper", "title"));
console.log("#Optimized:", isomorphicStringsOptimized("foo", "bar"));
