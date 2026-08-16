// The very basic approach is to generate all the possible pairs and check if any pair exists whose sum is equals to given target value,
// then increment the count variable.
function countPairsWithSum(arr, target) {
  let cnt = 0;
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (arr[i] + arr[j] === target) {
        cnt++;
      }
    }
  }
  return cnt;
}

/*
Dry run for arr = [1, 5, 7, -1, 5], target = 6:
- i=0 (1): (1,5)=6 -> count=1; (1,7)=8; (1,-1)=0; (1,5)=6 -> count=2
- i=1 (5): (5,7)=12; (5,-1)=4; (5,5)=10
- i=2 (7): (7,-1)=6 -> count=3; (7,5)=12
- i=3 (-1): (-1,5)=4
Final count = 3

time: O(n2) = 2 loops
space: O(1) = constant space
*/

console.log(countPairsWithSum([1, 5, 7, -1, 5], 6)); // Pairs with sum 6 are (1, 5), (7, -1) & (1, 5).

function countPairsWithSum(arr, target) {
  const freqMap = new Map();
  let cnt = 0;

  for (const num of arr) {
    const complement = target - num;

    // Add occurrences of the complement seen so far
    if (freqMap.has(complement)) {
      cnt += freqMap.get(complement);
    }

    // Increment frequency of the current number
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  return cnt;
}

/*
Step,Current num,complement (6 - num),In freqMap?,cnt Action,Total cnt,freqMap State After Step
1,1,5,No,None,0,{ 1: 1 }
2,5,1,Yes (count = 1),cnt += 1,1,"{ 1: 1, 5: 1 }"
3,7,-1,No,None,1,"{ 1: 1, 5: 1, 7: 1 }"
4,-1,7,Yes (count = 1),cnt += 1,2,"{ 1: 1, 5: 1, 7: 1, -1: 1 }"
5,5,1,Yes (count = 1),cnt += 1,3,"{ 1: 1, 5: 2, 7: 1, -1: 1 }"

time: O(n)
space: O(n) => it creates new external DS freqMap to store frequencies of array element
*/
