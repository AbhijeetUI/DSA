let arr4 = [4, 9, 0, 2, 8, 6, 1];
function findSecondLargest(arr) {
  if (arr.length < 2) return null;
  let firstLargest = -Infinity;
  let secondLargest = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > firstLargest) {
      secondLargest = firstLargest;
      firstLargest = arr[i];
    } else if (arr[i] > secondLargest && arr[i] !== firstLargest) {
      secondLargest = arr[i];
    }
  }
  return secondLargest;
}

console.log(findSecondLargest(arr4));
console.log(findSecondLargest([1])); // corner case
console.log(findSecondLargest([-2, -10, -5, -34]));
console.log(findSecondLargest([10, 20, 8, 9, 3, 5, 20])); //10 do not consider duplicates
console.log(findSecondLargest([10, 20, 20, 20, 20])); //20 do not consider duplicates
