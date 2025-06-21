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

