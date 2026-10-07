//https://leetcode.com/problems/product-of-array-except-self/description/

var productExceptSelf = function (nums) {
  let answer = [];
  for (let i = 0; i < nums.length; i++) {
    const before = nums.slice(0, i);
    const after = nums.slice(i + 1);
    const chunk = [...before, ...after];
    let product = chunk.reduce((total, num) => total * num, 1);
    answer.push(product);
  }

  return answer;
};

console.log(productExceptSelf([1, 2, 3, 4])); // [24,12,8,6]

/*
 (O(n^2) Time Complexity
 Inside your for loop n times, .slice() and .reduce(). Both of these operations also visit elements one by one, adding another n operations inside the loop.
*/

var productExceptSelfOptimal = function (nums) {
  const n = nums.length;
  // Pre-allocate the array for speed
  const answer = new Array(n);

  // Step 1: Calculate products from left
  let leftProduct = 1;
  for (let i = 0; i < n; i++) {
    answer[i] = leftProduct;
    leftProduct *= nums[i];
  }

  // Step 2: Multiply by left products (products of all elements to the right)
  let rightProduct = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= rightProduct;
    rightProduct *= nums[i];
  }

  return answer;
};

console.log(productExceptSelfOptimal([1, 2, 3, 4])); // [24,12,8,6]

/*
DRY RUN for productExceptSelfOptimal([1, 2, 3, 4])

Initial values:
nums = [1, 2, 3, 4]
answer = [0, 0, 0, 0]
leftProduct = 1
rightProduct = 1

Phase 1: Fill answer with products of elements to the left
--------------------------------------------------------
Iteration i = 0:
  answer[0] = leftProduct = 1
  leftProduct = leftProduct * nums[0] = 1 * 1 = 1
  answer = [1, 0, 0, 0]

Iteration i = 1:
  answer[1] = leftProduct = 1
  leftProduct = 1 * nums[1] = 1 * 2 = 2
  answer = [1, 1, 0, 0]

Iteration i = 2:
  answer[2] = leftProduct = 2
  leftProduct = 2 * nums[2] = 2 * 3 = 6
  answer = [1, 1, 2, 0]

Iteration i = 3:
  answer[3] = leftProduct = 6
  leftProduct = 6 * nums[3] = 6 * 4 = 24
  answer = [1, 1, 2, 6]

Phase 2: Multiply with products of elements to the right
--------------------------------------------------------
Start: rightProduct = 1

Iteration i = 3:
  answer[3] = answer[3] * rightProduct = 6 * 1 = 6
  rightProduct = rightProduct * nums[3] = 1 * 4 = 4
  answer = [1, 1, 2, 6]

Iteration i = 2:
  answer[2] = answer[2] * rightProduct = 2 * 4 = 8
  rightProduct = 4 * nums[2] = 4 * 3 = 12
  answer = [1, 1, 8, 6]

Iteration i = 1:
  answer[1] = answer[1] * rightProduct = 1 * 12 = 12
  rightProduct = 12 * nums[1] = 12 * 2 = 24
  answer = [1, 12, 8, 6]

Iteration i = 0:
  answer[0] = answer[0] * rightProduct = 1 * 24 = 24
  rightProduct = 24 * nums[0] = 24 * 1 = 24
  answer = [24, 12, 8, 6]

Final result: [24, 12, 8, 6]
*/
/*
Time Complexity is O(n): The first loop runs n times, and the second loop runs n times. 
Total operations for 100,000 elements is only 200,000, which executes in just a few milliseconds.
*/
