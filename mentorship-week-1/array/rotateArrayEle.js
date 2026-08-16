function rotateArrayByOne(arr) {
  const lastElement = arr[arr.length - 1];
  for (let i = arr.length - 1; i > 0; i--) {
    arr[i] = arr[i - 1];
  }
  arr[0] = lastElement;
}

console.log(rotateArrayByOne([1, 2, 3, 4, 5])); // [5,1,2,3,4]

function rotateArrayTwoPointers(arr) {
  let i = 0;
  let j = arr.length - 1;
  while (i !== j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    i++;
  }
}
