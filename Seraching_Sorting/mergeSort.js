/*
Divide and conquer algorithm
Given an array, we keep dividing our array into 2 halfs..... and merge them in sorted order
Given an array of integers nums, sort the array in ASC order and return it.
Solve without using any build-in functions and in O(nlog(n)) time complexity
*/

function merge(left, right) {
  let result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      // for ASC order
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  //write logic for remaining elements when we run out of i, j
  return [...result, ...left.slice(i), ...right.slice(j)];
}

function mergeSort(arr) {
  console.log(arr, typeof arr);
  if (arr.length <= 1) return arr;
  let mid = Math.floor(arr.length / 2); // truncate decimals value
  let left = mergeSort(arr.slice(0, mid));
  let right = mergeSort(arr.slice(mid)); // goes till end
  return merge(left, right); // helper function
}

console.log("############# MERGE SORT ##################");
console.log(mergeSort([8, 4, 5, 6, 9, 1, 3, 6]));
