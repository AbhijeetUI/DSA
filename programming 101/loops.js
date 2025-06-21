// Write a function to find the index of the element in the array.
function findIndexofNumber(arr, num) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === num) {
      return i;
    }
  }
  return -1;
}
let arr = [4, 2, 0, 10, 8, 30];
console.log("#findIndex", findIndexofNumber(arr, 49));
console.log("#findIndex", findIndexofNumber(arr, 4));
console.log("#findIndex", findIndexofNumber(arr, 0));

// Write a function to count the negatives in the array.
function countNegatives(arr) {
  let cnt = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 0) {
      cnt += 1;
    }
  }
  return cnt;
}

let arr1 = [2, -9, 17, 0, 1, -10, -9, 8];
console.log("#TOTAL NEGATIVE NUMBERS", countNegatives(arr1));

// Write a function that returns the largest number in the array.

let arr2 = [5, 0, 10, 8, 17, 1];

function findLargest(arr) {
  let largest = -Infinity; //anything compare with -Infinity that will be grater
  //use Infinity to find minimum element
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > largest) {
      largest = arr[i];
    }
  }
  return largest;
}
console.log("#LARGEST NUMBER", findLargest(arr2));

// Write a function to find smallest number in the array

let arr3 = [5, 9, 10, 8, 17, 2];

function findSmallest(arr) {
  let smallest = Infinity; //anything compare with Infinity that will be smallest
  //use Infinity to find minimum element
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < smallest) {
      smallest = arr[i];
    }
  }
  return smallest;
}
console.log("#SMALLEST NUMBER", findSmallest(arr3));
