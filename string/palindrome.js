function isPalindrome(s) {
  const ALPHANUMERIC_REGEX = /[a-zA-Z0-9]/;
  let cleaned = "";
  for (let i = 0; i < s.length; i++) {
    if (ALPHANUMERIC_REGEX.test(s[i])) {
      cleaned += s[i].toLowerCase();
    }
  }
  console.log(cleaned);
  let left = 0;
  let right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome(" A man, a plan, a canal: Panama ")); // true
console.log(isPalindrome("race a car")); // false
console.log(isPalindrome("12345")); // false
console.log(isPalindrome("12321")); // false

// Time complexity would be O(N) and space complexity would be O(N), because of cleaned variable used to store.

function isPalindromeOptimized(s) {
  const ALPHANUMERIC_REGEX = /[a-zA-Z0-9]/;

  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (!ALPHANUMERIC_REGEX.test(s[left])) {
      left++;
      continue; // Continues comparing characters until the pointers meet or cross.
    }
    if (!ALPHANUMERIC_REGEX.test(s[right])) {
      right--;
      continue;
    }
    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}

console.log(isPalindromeOptimized("A man, a plan, a canal: Panama")); // true
console.log(isPalindromeOptimized("race a car")); // false
console.log(isPalindromeOptimized("12345")); // false
console.log(isPalindromeOptimized("123")); // false
