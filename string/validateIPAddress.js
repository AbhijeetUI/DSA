/*
IPv4 Addresses Validation
IPv4 addresses use dot-decimal notation, consisting of four numbers (0-255) separated by dots, e.g., 172.16.254.1.

Example

Input: s = "128.0.0.1";
Output: true
Explantaion: Each section split by '.' contains only digits, has no leading zeros, and lies within the range 0-255.

 Input: s = "125.16.100.1";
Output: true
Explanation: Each section split by '.' contains only digits, has no leading zeros, and lies within the range 0-255.

Input: s = "125.512.100.1";
Output: false
Explanation: Each section must be within the range 0-255, but 512 exceeds this limit, making the IP invalid.

Input: s = "125.512.100.abc"
Output: false
Explanation: Each section must contain only numeric values, but "abc" is not a valid integer, making the IP invalid.
*/
function isValidIPv4(s) {
  // Split the string into components by the dot separator
  const parts = s.split(".");

  // An IPv4 address must have exactly 4 parts
  if (parts.length !== 4) {
    return false;
  }

  for (const part of parts) {
    // Check if the part is empty or contains non-digit characters
    if (part.length === 0 || !/^\d+$/.test(part)) {
      return false;
    }

    // Check for leading zeros (allowed only if the part is exactly "0")
    if (part.length > 1 && part[0] === "0") {
      return false;
    }

    // Convert to integer and check if it falls within the 0-255 range
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) {
      return false;
    }
  }

  return true;
}

// --- Test Cases ---
console.log(isValidIPv4("128.0.0.1")); // true
console.log(isValidIPv4("125.16.100.1")); // true
console.log(isValidIPv4("125.512.100.1")); // false (512 is out of bounds)
console.log(isValidIPv4("125.512.100.abc")); // false ("abc" contains non-digits)
console.log(isValidIPv4("125.16.01.1")); // false ("01" has a leading zero)
