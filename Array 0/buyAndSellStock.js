// Best time to Buy and Sell Stock

/*
 We have prices array where prices[i] is the price of a given stock on the ith day

 To maximize the your profit by chosing a sing day to buy one stock and choosing a different day in the future to sell that stock

 Return the maximum profit you can achieve from this transaction, if you cannot achieve any profit, return 0;

 Example 1: 
 Input: prices = [7,1,5,3,6,4]
 Output: 5 //buy on day 1 at price 2 and sell on day 5 at price 6, so profit = 6 - 1 = 5

 Example 2: 
 Input: prices = [7,6,4,3,1]
 Output: 0 // no transactions are done, so max profit = 0
*/

/*

we can maintain minimum value and maximum profit
Input: prices = [7,1,5,3,6,4]

for i = 0
min = 7
maxProfit = 0 = 

for i = 1
min = 1
maxProfit = 5 - 1 = 4

for i = 2
min = 1
max = 1 - 5 = 4 not grater than 4, so skip

for i = 3
min = 1
max = 1 - 3 = 2, is not greater than 4, so skip

for i = 4
min = 1
maxPRofit = 6 - 1 = 5, so new max profit is 5

for i = 5
min = 1
maxPRofit = 4 - 1 = 3, is not greater than 5, so skip
*/

/* 

Initialize min as the first price.
Initialize maxProfit as 0.
Loop through the prices from index 1 to the end:
If the current price minus min is greater than maxProfit, update maxProfit.
If the current price is less than min, update min to this new lower value.
Return maxProfit at the end.

*/

function maxProfit(prices) {
  let min = prices[0];
  let maxProfit = 0;
  for (let i = 1; i < prices.length; i++) {
    // start loop at 1, bcoz no pointing to buy and sell on same day
    if (prices[i] - min > maxProfit) {
      maxProfit = prices[i] - min;
    }
    if (prices[i] < min) {
      min = prices[i];
    }
  }
  return maxProfit;
}

/*
Time and Space Complexity
Time Complexity: O(n)
One loop through the prices array.
Space Complexity: O(1)
Only a few variables used (min, maxProfit).
*/

console.log("############# BUY AND SELL STOCK ###############");
console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5
console.log(maxProfit([7, 6, 4, 3, 1])); // no transactions are done, so max profit is 0
