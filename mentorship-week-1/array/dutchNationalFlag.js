function sort012Counting(arr) {
  let count0 = 0,
    count1 = 0,
    count2 = 0;

  // Pass 1: Count frequencies of 0, 1, and 2
  for (let num of arr) {
    if (num === 0) count0++;
    else if (num === 1) count1++;
    else if (num === 2) count2++;
  }

  // Pass 2: Overwrite original array
  let idx = 0;
  while (count0-- > 0) arr[idx++] = 0;
  while (count1-- > 0) arr[idx++] = 1;
  while (count2-- > 0) arr[idx++] = 2;

  return arr;
}

// Example usage:
const arr = [2, 0, 2, 1, 1, 0];
sort012Counting(arr);
console.log(arr); // [0, 0, 1, 1, 2, 2]

/*
Time Complexity: O(N) => total time (2 * N)
Space Complexity: O(1)
*/

// one pass solution
function sort012Optimized(arr) {
  let low = 0;
  let mid = 0;
  let high = arr.length - 1;

  while (mid <= high) {
    if (arr[mid] === 0) {
      // Swap current 0 to the low boundary
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      low++;
      mid++;
    } else if (arr[mid] === 1) {
      // 1 is in position, move mid forward
      mid++;
    } else {
      // Swap current 2 to the high boundary
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      high--;
      // Keep mid at current position to re-evaluate swapped element
    }
  }
  return arr;
}

// Example usage:
const arr = [2, 0, 1, 2, 0, 1, 0];
sort012Optimized(arr);
console.log(arr); // [0, 0, 0, 1, 1, 2, 2]

/*
Metric,Counting Approach (Brute Force),Dutch National Flag (Optimized)
Passes,2 passes over array,1 pass over array
Time Complexity,O(N),O(N)
Space Complexity,O(1),O(1)
Array Mutations,Overwrites all values,Swaps elements in-place
Object Key Stability,Fails if array contains objects,Preserves element identity
*/

/*

Step,Condition (mid <= high),arr[mid],Action Taken,Array State,low,mid,high
Start,—,—,Initial state,"[2, 0, 2, 1, 1, 0]",0,0,5
1,0≤5,2,"Value is 2: Swap arr[0] & arr[5], high--","[0, 0, 2, 1, 1, 2]",0,0,4
2,0≤4,0,"Value is 0: Swap arr[0] & arr[0], low++, mid++","[0, 0, 2, 1, 1, 2]",1,1,4
3,1≤4,0,"Value is 0: Swap arr[1] & arr[1], low++, mid++","[0, 0, 2, 1, 1, 2]",2,2,4
4,2≤4,2,"Value is 2: Swap arr[2] & arr[4], high--","[0, 0, 1, 1, 2, 2]",2,2,3
5,2≤3,1,Value is 1: Move mid++,"[0, 0, 1, 1, 2, 2]",2,3,3
6,3≤3,1,Value is 1: Move mid++,"[0, 0, 1, 1, 2, 2]",2,4,3
End,4≤3 (False),—,Loop terminates (mid > high),"[0, 0, 1, 1, 2, 2]",2,4,3
*/
