function subArraySum(arr, target) {
  let res = [];
  let n = arr.length;
  for (let i = 0; i < n; i++) {
    let curr = 0;
    for (let j = i; j < n; j++) {
      // FIX: Start from i, not 0
      curr += arr[j];
      if (curr === target) {
        res.push(i + 1);
        res.push(j + 1);
        return res;
      }
    }
  }
  return [-1];
}

/*
CORRECTED TRACE: arr[] = [1, 10, 4, 0, 3, 5], target = 7

i = 0, curr = 0
  j = 0: curr = 0 + arr[0] = 0 + 1 = 1     (subarray [1], sum = 1, not 7)
  j = 1: curr = 1 + arr[1] = 1 + 10 = 11   (subarray [1,10], sum = 11, not 7)
  j = 2: curr = 11 + arr[2] = 11 + 4 = 15  (subarray [1,10,4], sum = 15, not 7)
  j = 3: curr = 15 + arr[3] = 15 + 0 = 15  (subarray [1,10,4,0], sum = 15, not 7)
  j = 4: curr = 15 + arr[4] = 15 + 3 = 18  (subarray [1,10,4,0,3], sum = 18, not 7)
  j = 5: curr = 18 + arr[5] = 18 + 5 = 23  (subarray [1,10,4,0,3,5], sum = 23, not 7)

i = 1, curr = 0
  j = 1: curr = 0 + arr[1] = 0 + 10 = 10   (subarray [10], sum = 10, not 7)
  j = 2: curr = 10 + arr[2] = 10 + 4 = 14  (subarray [10,4], sum = 14, not 7)
  j = 3: curr = 14 + arr[3] = 14 + 0 = 14  (subarray [10,4,0], sum = 14, not 7)
  j = 4: curr = 14 + arr[4] = 14 + 3 = 17  (subarray [10,4,0,3], sum = 17, not 7)
  j = 5: curr = 17 + arr[5] = 17 + 5 = 22  (subarray [10,4,0,3,5], sum = 22, not 7)

i = 2, curr = 0
  j = 2: curr = 0 + arr[2] = 0 + 4 = 4     (subarray [4], sum = 4, not 7)
  j = 3: curr = 4 + arr[3] = 4 + 0 = 4     (subarray [4,0], sum = 4, not 7)
  j = 4: curr = 4 + arr[4] = 4 + 3 = 7     (subarray [4,0,3], sum = 7, FOUND!)
         res.push(2 + 1) = 3, res.push(4 + 1) = 5
         return [3, 5]

OUTPUT: [3, 5] (1-indexed start and end positions)

TIME COMPLEXITY: O(n²) - Nested loops
SPACE COMPLEXITY: O(1) - Only using a couple of variables
*/
