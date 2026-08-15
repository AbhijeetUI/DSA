const ROMAN_TO_INT = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

/*
this function has T = O(n) + O(n) = inner loop + numbers loop = O(2N)
S = O(n) => bcoz numbers array created to store roman to integer
*/
function romanToInteger(str) {
  if (str.length === 0) return null;

  const numbers = [];

  for (let i = 0; i < str.length; i++) {
    numbers.push(ROMAN_TO_INT[str[i]]);
  }

  let convertedNumber = 0;

  for (let j = 0; j < numbers.length; j++) {
    if (numbers[j] < numbers[j + 1]) {
      convertedNumber += numbers[j + 1] - numbers[j];
      j++; // Skip the next element since we already paired and processed it
    } else {
      convertedNumber += numbers[j];
    }
  }

  return convertedNumber;
}

// convert roman to integer in 1 loop, so S = O(1)
function romanToIntegerOptimized(str) {
  let convertedNumber = 0;

  for (let j = 0; j < str.length; j++) {
    const current = ROMAN_TO_INT[str[j]];
    const next = ROMAN_TO_INT[str[j + 1]];

    if (next !== undefined && current < next) {
      convertedNumber += next - current;
      j++;
    } else {
      convertedNumber += current;
    }
  }

  return convertedNumber;
}

console.log(romanToInteger("IX")); // 9
console.log(romanToInteger("XL")); // 40
console.log(romanToInteger("MCMIV")); // 1904
