// Given an array arr[] of n integers and a target value, find the number of pairs of integers in the array whose sum is equal to target.
/*

Examples:  

Input: arr[] = [1, 5, 7, -1, 5], target = 6
Output:  3
Explanation: Pairs with sum 6 are (1, 5), (7, -1) & (1, 5).         

Input: arr[] = [1, 1, 1, 1], target = 2
Output:  6
Explanation: Pairs with sum 2 are (1, 1), (1, 1), (1, 1), (1, 1), (1, 1) and (1, 1).

Input: arr[] = [10, 12, 10, 15, -1], target = 125
Output:  0
Explanation: There is no pair with sum = target

*/

function countPairs(arr, target) {
  let cnt = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === target) {
        cnt++;
      }
    }
  }
  return cnt;
}

// OPTIMIZED SOLUTION: Using HashMap/Object
/*
APPROACH: HashMap (Hash Table)

Idea: Use a hash map to store frequency of each element seen so far.
For each element, check if (target - element) exists in the map.
If yes, add its frequency to the count.

ALGORITHM:
1. Create a Map to store element frequencies
2. Iterate through the array
3. For each element, calculate complement = target - element
4. If complement exists in map, add its frequency to count
5. Add current element to map (increment its frequency)

Example: arr = [1, 5, 7, -1, 5], target = 6

Step 1: element = 1
  complement = 6 - 1 = 5
  Map has 5? NO
  Map: {1: 1}
  count = 0

Step 2: element = 5
  complement = 6 - 5 = 1
  Map has 1? YES, frequency = 1
  count = 0 + 1 = 1  (pair: [1, 5])
  Map: {1: 1, 5: 1}

Step 3: element = 7
  complement = 6 - 7 = -1
  Map has -1? NO
  Map: {1: 1, 5: 1, 7: 1}
  count = 1

Step 4: element = -1
  complement = 6 - (-1) = 7
  Map has 7? YES, frequency = 1
  count = 1 + 1 = 2  (pair: [7, -1])
  Map: {1: 1, 5: 1, 7: 1, -1: 1}

Step 5: element = 5
  complement = 6 - 5 = 1
  Map has 1? YES, frequency = 1
  count = 2 + 1 = 3  (pair: [1, 5])
  Map: {1: 1, 5: 2, 7: 1, -1: 1}

OUTPUT: 3
*/

function countPairsHashMap(arr, target) {
  let map = new Map();
  let count = 0;

  for (let num of arr) {
    let complement = target - num;

    if (map.has(complement)) {
      count += map.get(complement);
    }

    map.set(num, (map.get(num) || 0) + 1);
  }

  return count;
}

const arr = [1, 5, 7, -1, 5];
const target = 6;

console.log("Brute Force:", countPairs(arr, target)); // Output: 3
console.log("HashMap Solution:", countPairsHashMap(arr, target)); // Output: 3

/*
COMPARISON:

Brute Force Approach:
- Time Complexity: O(n²) - Two nested loops
- Space Complexity: O(1) - No extra space

HashMap Approach:
- Time Complexity: O(n) - Single pass with O(1) lookup
- Space Complexity: O(n) - HashMap stores elements

The HashMap approach is much more efficient for large arrays!
*/
