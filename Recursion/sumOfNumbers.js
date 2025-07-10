function sumOfNumbers(n) {
  if (n === 0) return 0; // base case
  return n + sumOfNumbers(n - 1);
}

console.log(sumOfNumbers(5));

/* 
DRY RUN 
sum(5):
5 !== 0, so return 5 + sum(4)
sum(4):
4 !== 0, so return 4 + sum(3)
sum(3):
3 !== 0, so return 3 + sum(2)
sum(2):
2 !== 0, so return 2 + sum(1)
sum(1):
1 !== 0, so return 1 + sum(0)
sum(0):
0 === 0, so return 0

Now, the call stack unwinds:

sum(1) = 1 + 0 = 1
sum(2) = 2 + 1 = 3
sum(3) = 3 + 3 = 6
sum(4) = 4 + 6 = 10
sum(5) = 5 + 10 = 15

Key points:

Each call waits for the result of the next call (sum(n-1)) before it can finish.
The recursion stops when n === 0 (base case).
The sum is built up as the call stack unwinds.
*/
