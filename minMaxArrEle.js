function minMaxArrayElement(arr) {
  let n = arr.length;
  if (n === 0) return null;
  let minEle = Infinity;
  let maxEle = -Infinity;
  for (let i = 0; i < n; i++) {
    if (arr[i] < minEle) {
      minEle = arr[i];
    }
    if (arr[i] > maxEle) {
      maxEle = arr[i];
    }
  }
  return {
    min: minEle,
    max: maxEle,
    sum: minEle + maxEle,
    product: minEle * maxEle,
  };
}

console.log(minMaxArrayElement([1, 423, 6, 46, 34, 23, 13, 53, 4]));
console.log(minMaxArrayElement([2, 4, 6, 7, 9, 8, 3, 11]));

// Time complexity would be O(n), bcoz we need to at least loop through to each element
