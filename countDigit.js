// Write a function that retunrs the count of digits in a number

function countDigits(num) {
  if (num === 0) return 1; //corner case 1, if num is 0, then 0 is itself a number, so need to return count as 1.

  // corner case 2, if num < 0, then also we need to return count in it, so we can convert it to positive integer using Math.abs(num)

  num = Math.abs(num);
  let count = 0;
  while (num > 0) {
    //if Math.floor is not used then we will not anything divisible to number will give result in decimal, but we want an absolute number
    num = Math.floor(num / 10);
    count++;
  }
  return count;
}

console.log("####### Count Digits############");
console.log(countDigits(1013)); // 4
console.log(countDigits(-25)); // 2
console.log(countDigits(0)); // 1
console.log(countDigits(8765431)); // 7
