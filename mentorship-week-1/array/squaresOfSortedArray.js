function squaresOfSortedArray(arr) {
  let squares = [];
  for (let i = 0; i < arr.length; i++) {
    squares.push(arr[i] * arr[i]);
  }
  return squares.sort();
}

// Time complexity would be n log n, because sorting is used
console.log(squaresOfSortedArray([-4, -1, 0, 3, 10])); // [0,1,9,16,100]

function squaresOfSortedArrayOptimized(arr) {
  const result = new Array(arr.length);
  let left = 0;
  let right = arr.length - 1;

  for (let i = arr.length - 1; i >= 0; i--) {
    const leftSquare = arr[left] ** 2;
    const rightSquare = arr[right] ** 2;

    if (leftSquare > rightSquare) {
      result[i] = leftSquare;
      left++;
    } else {
      result[i] = rightSquare;
      right--;
    }
  }

  return result;
}

console.log(squaresOfSortedArrayOptimized([-4, -1, 0, 3, 10]));
console.log(squaresOfSortedArrayOptimized([-7, -3, 2, 3, 11]));

/*
Because the input is already sorted, 
we can improve the time complexity to O(n) using two pointers
*/
