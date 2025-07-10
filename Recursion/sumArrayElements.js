const arr = [1, 2, 3, 4, 5];
function sumArrayElements(n) {
  if (n === 0) return arr[n];
  return arr[n] + sumArrayElements(n - 1);
}

console.log("######## SUM OF ARRAY ELEMENTS ##############");
console.log(sumArrayElements(arr.length - 1));

function sumArrayOddElements(n) {
  if (n < 0) return 0; // base case
  if (arr[n] % 2 !== 0) {
    return arr[n] + sumArrayOddElements(n - 1);
  } else {
    return sumArrayOddElements(n - 1); // the function skips it and continues the recursion without adding its value
  }
}
console.log(sumArrayOddElements(arr.length - 1));

function factorial(n) {
  if (n === 1) return 1; // base case
  return n * factorial(n - 1);
}

console.log("######## FACTORIAL OF NUMBER ##############");
console.log(factorial(5));
/* 
DRY RUN

High-Level Explanation
arr: An array of numbers [1, 2, 3, 4, 5].
sumArrayElements(n): A recursive function that returns the sum of the first n+1 elements of arr.
Base Case: If n === 0, return arr[0].
Recursive Case: Return arr[n] + sumArrayElements(n - 1).
Step-by-Step Dry Run
Let's call sumArrayElements(arr.length - 1), which is sumArrayElements(4):

sumArrayElements(4)

Not base case (n !== 0)
Returns arr[4] + sumArrayElements(3) → 5 + sumArrayElements(3)
sumArrayElements(3)

Returns arr[3] + sumArrayElements(2) → 4 + sumArrayElements(2)
sumArrayElements(2)

Returns arr[2] + sumArrayElements(1) → 3 + sumArrayElements(1)
sumArrayElements(1)

Returns arr[1] + sumArrayElements(0) → 2 + sumArrayElements(0)
sumArrayElements(0)

Base case: returns arr[0] → 1

Now, substitute back up the call stack:

sumArrayElements(1): 2 + 1 = 3
sumArrayElements(2): 3 + 3 = 6
sumArrayElements(3): 4 + 6 = 10
sumArrayElements(4): 5 + 10 = 15

*/
