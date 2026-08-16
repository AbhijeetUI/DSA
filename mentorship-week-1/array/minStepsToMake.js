// Dry run for minSteps(arr)
// Example input: [0, 1, 2, 3]
// Step 1: Traverse the array
// - arr[0] is 0, so change it to 1 and increase steps to 1
// - arr[1], arr[2], arr[3] are not 0, so no change
// Step 2: Check the sum of the array
// - New array becomes [1, 1, 2, 3]
// - Sum = 7, which is not 0
// Result: total steps = 1

function minSteps(arr) {
  let steps = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === 0) {
      arr[i] += 1;
      steps += 1;
    }
  }

  let sum = arr.reduce((total, value) => total + value, 0);

  if (sum === 0) {
    arr[0] += 1;
    steps += 1;
  }

  return steps;
}

console.log(minSteps([0, 1, 2, 3])); // 1
console.log(minSteps([-1, -1, 0, 0]));

function minStepsToZero(arr) {
  if (arr.length === 0) return 0;
  return Math.max(...arr);
}

console.log(minStepsToZero([0, 3, 2, 1]));
console.log(minStepsToZero([1, 5, 6]));
