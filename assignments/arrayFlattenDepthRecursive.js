const nestedData = [2, [7, 8, [5, 6, 9, [10]]]];

function customFlat(arr, depth = 1) {
  // Base case: empty array or depth exhausted
  if (arr.length === 0 || depth === 0) return arr;

  let res = [];

  for (let i = 0; i < arr.length; i++) {
    // Check if element is an array AND depth > 0
    if (Array.isArray(arr[i]) && depth > 0) {
      // Recursively flatten with decreased depth
      res = res.concat(customFlat(arr[i], depth - 1));
    } else {
      res.push(arr[i]);
    }
  }
  return res;
}

console.log(customFlat(nestedData, 1)); // [ 2, 7, 8, [ 5, 6, 9, [ 10 ] ] ]
console.log(customFlat(nestedData, 2)); // [2,7,8,5,6,9,[ 10 ]]
console.log(customFlat(nestedData, Infinity)); // [2, 7,  8, 5,6, 9, 10]
