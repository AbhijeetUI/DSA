function removeDuplicates(arr) {
  let x = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== arr[x]) {
      x++;
    }
    arr[x] = arr[i];
  }
  return x + 1;
}

console.log(removeDuplicates([1, 1, 2])); // [1,2,_] // k = 2
console.log(removeDuplicates([0, 0, 1, 1, 1, 2, 2, 3, 3, 4])); // k = 5

/*

How it works
 - i scans through every element.
 - x tracks the position of the last unique element.
 - When a new value is found, x is incremented and the value is copied there.
 - The function returns x + 1, which is the number of unique values.

Time complexity:
- The loop scans the array once, where n is the array length. 
  Each comparison and assignment takes constant time.

Space Complexity:
- The function modifies the input array in-place and uses only the variables x and i, 
  so it requires constant extra space.

*/
