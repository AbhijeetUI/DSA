---
# 📈 Time Complexity

Time complexity measures the **efficiency of an algorithm** in terms of how fast it runs as the size of input data increases.

- It **does not** represent the actual time taken by the algorithm to run.
- The same algorithm may take different times depending on hardware, system load, etc.
- Hence, we use time complexity to understand how the algorithm scales.
---

# 🔍 Linear Search vs Binary Search

## Linear Search

- To search for an element in an array, iterate through each item one by one.
- If there are `n` elements, we may need up to `n` iterations to find the element.

## Binary Search

- To search an element in a **sorted array**:
  1. Find the middle element.
  2. Compare it with the target:
     - If the middle > target, search the **left** half.
     - If the middle < target, search the **right** half.
  3. Repeat this process until the target is found or the array is empty.
- The number of steps follows this pattern: `n`, `n/2`, `n/4`, `n/8`, ..., until done.

---

## ⚖️ When to Use Which?

| Scenario               | Suggested Search |
| ---------------------- | ---------------- |
| `n = 10`, `x = 10`     | Linear Search    |
| `n = 100`, `x = 100`   | Linear Search    |
| `n = 1000`, `x = 1000` | Linear Search    |
| `n = 10`, `x = 3`      | Binary Search    |
| `n = 100`, `x = 7`     | Binary Search    |
| `n = 1000`, `x = 10`   | Binary Search    |

✔️ **Binary search is more efficient** for large, sorted arrays.

---

# 🧮 Representing Time Complexity

We use **Big O Notation** to describe the worst-case scenario.

## Linear Search Example

- Input: `[5, 6, 1, 0, 7]`
  - Best Case: Searching for `5` → `O(1)`
  - Worst Case: Searching for `100` → `O(n)` (loop runs `n` times)

## Binary Search Example

- Input (sorted): `[5, 8, 10, 15, 20]`
  - Best Case: Searching for `10` → `O(1)`
  - Worst Case: Searching for `100` → `O(log n)`
    - Each step divides the array in half until the search space is empty.

---

# 🧾 Big O Notation Summary

| Algorithm     | Time Complexity |
| ------------- | --------------- |
| Linear Search | `O(n)`          |
| Binary Search | `O(log n)`      |

> ✅ `O(log n)` is much more efficient than `O(n)` as `n` grows.

---

## 📌 Common Time Complexities

### 🟢 **O(1) – Constant Time**

> The algorithm runs in the same time regardless of input size.

```js
function getFirstElement(arr) {
  return arr[0];
}
```

---

### 🔵 **O(n) – Linear Time**

> Time grows directly with input size.

```js
for (let i = 0; i < n; i++) {
  console.log(i);
}
```

---

### 🟡 **O(n²) – Quadratic Time**

> Nested loops over the input. Time grows proportionally to the square of the input.

```js
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    console.log(j);
  }
  console.log(i);
}
// Outer loop runs n times, inner loop runs n times = n * n = O(n²)
```

---

### 🔷 **O(n log n) – Linearithmic Time**

> Divide-and-conquer algorithms like Merge Sort or Quick Sort.

```js
// Conceptual Example: Merge Sort
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}
// Recursion (log n levels) + merging (n work at each level) = O(n log n)
```

---

### 🔶 **O(2ⁿ) – Exponential Time**

> Algorithm runtime doubles with each additional input. Common in brute-force recursion.

```js
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
// Very inefficient for large n due to repeated subproblems
```

---

## 📈 Summary Table

| Time Complexity | Description  | Example Use Case                  |
| --------------- | ------------ | --------------------------------- |
| `O(1)`          | Constant     | Array access by index             |
| `O(n)`          | Linear       | Linear search                     |
| `O(n²)`         | Quadratic    | Bubble sort, nested loops         |
| `O(n log n)`    | Linearithmic | Merge sort, efficient sorting     |
| `O(2ⁿ)`         | Exponential  | Recursive Fibonacci, backtracking |

## Efficiency

- O(1) > O(log n) > O(n) > O(n log n) > O(n²) > O(2ⁿ) > O(n1)

# Real time execution

- at the time of solution we can explain the time complexity of our solution and can improve to the btter complexity.

## Space complexity

- how much extra space you're using

```js

let's identify the space comlexity from below program

findMaximumNumber(arr){
  let max = arr[0]; // using 1 variable having time complexity is O(1)
  for(let i = 0;i<n;i++){ // here loop is running n time, so O(n)
    if(arr[i] > max){
      max = arr[i];
    }
  }
  return max;
}

// here wr're using 2 extra spaces for variable max and i
```

- if there is an input array of size(n)
- if we're using extra variable let say 1,2,3,....=> O(1) => time complexity and space complexity will be O(n2)

```js
for(1...n){
  for(1...n){
    //this inner loop runs n times
  }
  //this outer loop runs n times
}
for(1...n){
  //this loop runs n times
}

// so time complexity => O(n² + n) => O(n²) => but here we can ignore lower value n, bcoz it does not matter
// O(n3 + n + n2) => O(n3)
// O(n2 + 2n) => O(n2)
```
