/*
Selection sort algorithm put all minimum elements on it place
Basically, it loop through array elements adn check for minimum element and swap it

[7,1,5,4,3,2]  n = 6;
so here, minimum from 7,1 is 1, so array will be [1,7,5,4,3,2]
now loop will start from element 7 and find minimum element which is 2 -> [1,2,5,4,3,7]

*/

function selectionSort(nums) {
  let n = nums.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i; // initial value of min
    for (let j = i + 1; j < n; j++) {
      if (nums[j] < nums[min]) {
        min = j; // update min
      }
      if (min != i) {
        // if min and i are same no need to swap lets say nums[4] when i = 4 and so nums[min] -> 4 is same.
        let swap = nums[i];
        nums[i] = nums[min];
        nums[min] = swap;
      }
    }
  }
  return nums;
}

console.log("############ SELECTION SORT ###############");
console.log(selectionSort([7, 1, 5, 4, 3, 2]));
/*
Time complexity : O(n2)
Space complexity : O(4) -> as used variables are constants so -> O(1)

Dry Run (Example: [4, 5, 1, 3, 9])
Start from index 0 → Find the smallest element → it’s 1. Swap with 4 → [1, 5, 4, 3, 9]
Index 1 → Smallest from index 1 → 3. Swap with 5 → [1, 3, 4, 5, 9]
Index 2 → Smallest is 4 → already in place → [1, 3, 4, 5, 9]
Index 3 → Smallest is 5 → already in place → [1, 3, 4, 5, 9]
*/
