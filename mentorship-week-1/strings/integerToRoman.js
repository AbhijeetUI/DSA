/*
Integer to Roman Numerals
Convert a number into its roman numeral representation.

Input: 5
Output: V

Input: 9
Output: IX

Input: 40
Output: XL
*/

// -------------------------------
// Brute Force Approach
// -------------------------------
// Idea: Convert the number place by place using a direct lookup table.
// Thousands, hundreds, tens, and ones are handled separately.
function integerToRomanBrute(num) {
  if (num <= 0) return "";

  const thousands = ["", "M", "MM", "MMM"];
  const hundreds = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"];
  const tens = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"];
  const ones = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

  const thousandDigit = Math.floor(num / 1000);
  const hundredDigit = Math.floor((num % 1000) / 100);
  const tenDigit = Math.floor((num % 100) / 10);
  const oneDigit = num % 10;

  return (
    thousands[thousandDigit] +
    hundreds[hundredDigit] +
    tens[tenDigit] +
    ones[oneDigit]
  );
}

// -------------------------------
// Optimized Approach
// -------------------------------
// Idea: Use a descending value-symbol table and greedily subtract values.
// This works in one pass and avoids the table lookup by digit position.
function integerToRomanOptimized(num) {
  if (num <= 0) return "";

  const romanPairs = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let result = "";

  for (const [value, symbol] of romanPairs) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }

  return result;
}

/*
Dry run - Brute Force
Input: 1994

thousands = Math.floor(1994 / 1000) = 1 -> "M"
hundreds = Math.floor((1994 % 1000) / 100) = 9 -> "CM"
tens = Math.floor((1994 % 100) / 10) = 9 -> "XC"
ones = 1994 % 10 = 4 -> "IV"

Return M + CM + XC + IV = "MCMXCIV"
*/

/*
Dry run - Optimized
Input: 1994

romanPairs = [1000 M, 900 CM, 500 D, 400 CD, 100 C, 90 XC, 50 L, 40 XL, 10 X, 9 IX, 5 V, 4 IV, 1 I]

num = 1994
- 1000 fits 1 time -> result = "M", num = 994
- 900 fits 1 time -> result = "MCM", num = 94
- 90 fits 1 time -> result = "MCMXC", num = 4
- 4 fits 1 time -> result = "MCMXCIV", num = 0

Return: "MCMXCIV"
*/

console.log("Brute:", integerToRomanBrute(5));
console.log("Brute:", integerToRomanBrute(9));
console.log("Brute:", integerToRomanBrute(40));
console.log("Optimized:", integerToRomanOptimized(5));
console.log("Optimized:", integerToRomanOptimized(9));
console.log("Optimized:", integerToRomanOptimized(40));
