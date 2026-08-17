# DSA Roadmap (JavaScript) — Array, String, Stack, Queue

A staff-engineer style roadmap. Goal is **pattern recognition + reasoning**, not memorizing solutions.
Reference: [LeetCode 75 Study Plan](https://leetcode.com/studyplan/leetcode-75/)

---

## How to use this doc

1. Don't jump into code. Follow the **Universal Problem-Solving Template** (below) for *every* problem, even easy ones — the habit is the point.
2. For each topic: read the "Algorithms/Patterns to know" section first, then solve problems in order (easy → medium).
3. Do 2-3 problems/day. After solving, spend 5 min writing (in your own words) *what pattern this was* and *what clue in the problem statement pointed to it*. This is how pattern recognition compounds.
4. Re-solve a problem cold (no notes) 3-4 days later if you had to look at the pattern/hint. Repetition without recall doesn't build intuition.

---

## Universal Problem-Solving Template (use this every single time)

This is the actual "senior engineer" workflow — before writing a single line of code.

### Step 1 — Read constraints FIRST (before thinking about approach)
Constraints silently tell you the expected time complexity. Train yourself to read `n ≤ ...` and immediately estimate:

| n (input size) | Expected complexity | What that rules in/out |
|---|---|---|
| n ≤ 10-12 | O(2ⁿ), O(n!) | brute force, backtracking, permutations |
| n ≤ 20-25 | O(2ⁿ · n) | bitmask DP |
| n ≤ 500-1000 | O(n²) or O(n² log n) | nested loops, DP on pairs |
| n ≤ 10⁴-10⁵ | O(n log n) | sorting, heap, binary search, divide & conquer |
| n ≤ 10⁶-10⁷ | O(n) or O(n log n) | single pass, two pointers, sliding window, hashing |
| n ≤ 10⁸+ | O(log n) or O(1) | binary search, math formula |

Also check:
- Value range of elements (can you use them as array indices → counting sort / bucket tricks?)
- Are values sorted already? (unlocks binary search / two pointers)
- Negative numbers? Duplicates? Empty input allowed?
- Is it asking for one answer, all answers, or count of answers? (changes whether you need backtracking/DP vs a single pass)

### Step 2 — Restate the problem in your own words
Write a one-line paraphrase. If you can't paraphrase it, you don't understand it yet — re-read.

### Step 3 — Work a small example by hand
Pick a tiny input (3-5 elements), solve it manually, and **notice what your brain naturally did** — that manual process is usually the algorithm.

### Step 4 — Identify the shape/pattern (ask these in order)
1. Is the input sorted or can I sort it? → **two pointers / binary search**
2. Am I looking for a subarray/substring satisfying a condition? → **sliding window**
3. Do I need to look "backwards" at recent unresolved elements (next greater/smaller, matching brackets)? → **stack**
4. Do I need to process in arrival order / level by level / with a "waiting line"? → **queue / BFS**
5. Am I repeatedly asking "have I seen this before / what's the count/frequency"? → **hash map/set**
6. Does the brute force have overlapping subproblems? → **DP**
7. Is it about prefix sums / cumulative ranges? → **prefix sum**
8. Am I choosing greedily at each step with a local-optimum-is-global-optimum property? → **greedy**

### Step 5 — State brute force + its complexity FIRST
Always know the brute force. It's your correctness baseline and shows the interviewer/reviewer (or future you) that you can reason about tradeoffs.

### Step 6 — Optimize by asking:
- "What am I recomputing that I could cache/track incrementally?"
- "Can I shrink the search space each step instead of restarting?"
- "Can one pass with extra state (hashmap/stack/pointers) replace nested loops?"

### Step 7 — Define the template shape BEFORE coding
Pick the matching skeleton (see pattern skeletons below), fill in the specific condition/logic — don't write ad hoc code from scratch.

### Step 8 — Dry run on the example from Step 3, then on edge cases
Edge cases checklist: empty input, single element, all same elements, already sorted/reverse sorted, negative numbers, duplicates, integer overflow (less relevant in JS but watch for `Number.MAX_SAFE_INTEGER`).

### Step 9 — State final time & space complexity out loud

---

# 1. Arrays

## Algorithms / Patterns to know
- **Two Pointers** (opposite ends, or fast-slow same direction)
- **Sliding Window** (fixed size & variable size)
- **Prefix Sum** (range sum queries, subarray sum = target)
- **Kadane's Algorithm** (max subarray sum)
- **Binary Search** (on sorted array, and "binary search on answer")
- **Sorting-based reasoning** (sort then greedy/two-pointer)
- **Cyclic Sort** (when values are in range `1..n`)
- **Dutch National Flag** (3-way partition)
- **Merge Intervals**
- **Hashing for frequency/lookups**

### Pattern skeletons

```js
// Two Pointers (opposite ends) — sorted array
function twoPointers(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}

// Sliding Window (variable size) — subarray satisfying condition
function slidingWindow(arr, condition) {
  let left = 0, state = /* running state, e.g. sum/count/map */ 0;
  let best = 0;
  for (let right = 0; right < arr.length; right++) {
    state += arr[right]; // expand window
    while (/* window invalid, e.g. */ !condition(state)) {
      state -= arr[left]; // shrink window
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

// Prefix Sum
function buildPrefix(arr) {
  const prefix = [0];
  for (const num of arr) prefix.push(prefix[prefix.length - 1] + num);
  return prefix; // sum(i..j) = prefix[j+1] - prefix[i]
}

// Kadane's Algorithm — max subarray sum
function maxSubArray(arr) {
  let maxEndingHere = arr[0], maxSoFar = arr[0];
  for (let i = 1; i < arr.length; i++) {
    maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }
  return maxSoFar;
}
```

## Problems (Easy → Medium, daily practice order)

**Easy**
1. Two Sum
2. Best Time to Buy and Sell Stock
3. Contains Duplicate
4. Product of Array Except Self (medium-ish but core pattern)
5. Maximum Subarray (Kadane's)
6. Move Zeroes
7. Merge Sorted Array
8. Majority Element (Boyer-Moore voting)
9. Plus One
10. Remove Duplicates from Sorted Array

**Medium**
11. 3Sum
12. Container With Most Water
13. Sort Colors (Dutch National Flag)
14. Next Permutation
15. Subarray Sum Equals K (prefix sum + hashmap)
16. Product of Array Except Self
17. Merge Intervals
18. Insert Interval
19. Rotate Array
20. Find First and Last Position of Element in Sorted Array (binary search variant)
21. Search in Rotated Sorted Array
22. Set Matrix Zeroes
23. Spiral Matrix
24. Gas Station (greedy)

---

# 2. Strings

## Algorithms / Patterns to know
- **Two Pointers** (palindrome check, reverse, compare)
- **Sliding Window** (longest substring without repeat, anagram window)
- **Hashing / Frequency Counting** (anagrams, char counts)
- **String Building** (StringBuilder-style with arrays in JS, since strings are immutable)
- **Pattern Matching**: KMP (good to know exists; rarely hand-rolled in interviews, but understand the idea of the failure function)
- **Palindrome checks / expand-around-center**
- **Trie** (prefix-based problems — bridges into later topics)

### Pattern skeletons

```js
// Sliding Window for strings (longest substring without repeating chars)
function longestUniqueSubstring(s) {
  const seen = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (seen.has(ch) && seen.get(ch) >= left) {
      left = seen.get(ch) + 1; // shrink window past last occurrence
    }
    seen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

// Frequency map comparison (anagram check)
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }
  return count.every(c => c === 0);
}

// Expand Around Center (palindromic substrings)
function expandAroundCenter(s, left, right) {
  while (left >= 0 && right < s.length && s[left] === s[right]) {
    left--; right++;
  }
  return s.slice(left + 1, right); // valid palindrome
}
```

## Problems (Easy → Medium)

**Easy**
1. Valid Anagram
2. Valid Palindrome
3. Reverse String
4. First Unique Character in a String
5. Longest Common Prefix
6. Implement strStr() / indexOf
7. Ransom Note
8. Isomorphic Strings
9. Roman to Integer

**Medium**
10. Longest Substring Without Repeating Characters
11. Longest Palindromic Substring
12. Group Anagrams
13. String to Integer (atoi)
14. Longest Common Subsequence (bridges into DP — good to attempt after arrays/DP basics)
15. Minimum Window Substring
16. Encode and Decode Strings
17. Palindromic Substrings (count all)
18. Zigzag Conversion
19. Compare Version Numbers

---

# 3. Stack

## Algorithms / Patterns to know
- **Monotonic Stack** (next greater/smaller element, span problems) — the single highest-leverage stack pattern
- **Matching/Balancing** (parentheses validity)
- **Stack for undo/backtrack simulation** (min stack, evaluate expressions)
- **Two stacks to simulate a queue** (bridges into Queue section)
- **Recursion ↔ Stack equivalence** (understand that call stack = explicit stack; useful for converting recursive to iterative)

### Pattern skeletons

```js
// Monotonic Stack — Next Greater Element
function nextGreaterElement(arr) {
  const result = new Array(arr.length).fill(-1);
  const stack = []; // stores indices, values in decreasing order

  for (let i = 0; i < arr.length; i++) {
    while (stack.length && arr[stack[stack.length - 1]] < arr[i]) {
      const idx = stack.pop();
      result[idx] = arr[i];
    }
    stack.push(i);
  }
  return result;
}

// Valid Parentheses (matching)
function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else {
      if (stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}

// Min Stack (O(1) getMin) — track (value, currentMin) pairs
class MinStack {
  constructor() { this.stack = []; }
  push(val) {
    const currMin = this.stack.length ? Math.min(val, this.stack[this.stack.length - 1][1]) : val;
    this.stack.push([val, currMin]);
  }
  pop() { this.stack.pop(); }
  top() { return this.stack[this.stack.length - 1][0]; }
  getMin() { return this.stack[this.stack.length - 1][1]; }
}
```

## Problems (Easy → Medium)

**Easy**
1. Valid Parentheses
2. Min Stack
3. Baseball Game
4. Implement Stack using Queues
5. Remove All Adjacent Duplicates in String

**Medium**
6. Evaluate Reverse Polish Notation
7. Daily Temperatures (monotonic stack)
8. Next Greater Element II (circular array)
9. Asteroid Collision
10. Decode String
11. Simplify Path (Unix path)
12. Online Stock Span
13. Remove K Digits (monotonic stack + greedy)
14. Largest Rectangle in Histogram (harder medium — do after the above are comfortable)

---

# 4. Queue

## Algorithms / Patterns to know
- **BFS (Breadth-First Search)** — the #1 reason queues matter; level-order traversal, shortest path in unweighted graphs/grids
- **Circular Queue** (fixed-size buffer, index wraparound with modulo)
- **Monotonic Deque** (sliding window maximum/minimum — the queue equivalent of monotonic stack)
- **Two Stacks → Queue** and **Queue → Stack** simulations (understand the tradeoffs)
- **Priority Queue / Heap** (conceptually related — "queue with priority" — worth knowing even if JS has no built-in heap)

### Pattern skeletons

```js
// BFS template (graph/grid)
function bfs(start, getNeighbors) {
  const visited = new Set([start]);
  const queue = [start];
  let head = 0; // avoid O(n) shift(), use index pointer instead
  const order = [];

  while (head < queue.length) {
    const node = queue[head++];
    order.push(node);
    for (const neighbor of getNeighbors(node)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}

// Monotonic Deque — Sliding Window Maximum
function maxSlidingWindow(nums, k) {
  const deque = []; // stores indices, values in decreasing order
  const result = [];

  for (let i = 0; i < nums.length; i++) {
    while (deque.length && deque[0] <= i - k) deque.shift(); // out of window
    while (deque.length && nums[deque[deque.length - 1]] < nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(nums[deque[0]]);
  }
  return result;
}

// Circular Queue (fixed size array)
class CircularQueue {
  constructor(k) {
    this.data = new Array(k);
    this.size = k;
    this.head = 0;
    this.count = 0;
  }
  enqueue(val) {
    if (this.count === this.size) return false;
    this.data[(this.head + this.count) % this.size] = val;
    this.count++;
    return true;
  }
  dequeue() {
    if (this.count === 0) return false;
    this.head = (this.head + 1) % this.size;
    this.count--;
    return true;
  }
}
```

> **JS-specific note:** `Array.prototype.shift()` is O(n). For real queue behavior, use an index pointer (as in the BFS example) or a proper Deque/linked-list implementation, especially in interviews where you should mention this tradeoff.

## Problems (Easy → Medium)

**Easy**
1. Implement Queue using Stacks
2. Design Circular Queue
3. Number of Recent Calls (RecentCounter)
4. Moving Average from Data Stream

**Medium**
5. Sliding Window Maximum (monotonic deque — classic, do this one carefully)
6. Binary Tree Level Order Traversal (BFS)
7. Rotting Oranges (multi-source BFS on grid)
8. Number of Islands (BFS/DFS on grid)
9. Open the Lock (BFS on state space)
10. Task Scheduler
11. Design Hit Counter
12. Walls and Gates (multi-source BFS)

---

# Suggested Daily Practice Order (4-6 weeks, ~2-3 problems/day)

| Week | Focus | Problems/day |
|---|---|---|
| 1 | Array easy (1-10) + template drilling | 2 |
| 2 | Array medium (11-24) | 2 |
| 3 | String easy + medium (1-19) | 2-3 |
| 4 | Stack easy + medium (1-14) | 2 |
| 5 | Queue easy + medium (1-12) | 2 |
| 6 | Mixed review: re-solve 2 problems/topic cold, no notes | 3-4 |

---

## When you get a NEW problem — the exact checklist to run through

1. **Read constraints first.** Write down `n`'s range and derive target complexity (see table at top).
2. **Paraphrase the problem** in one sentence.
3. **Manually solve a tiny example** — notice your own reasoning process.
4. **Match to a pattern** using the "ask these in order" list under Step 4 above.
5. **State the brute force + complexity** even if you won't code it.
6. **Ask the optimization questions** (recompute? shrink search space? one-pass with extra state?).
7. **Pick the skeleton** that matches (two pointers / sliding window / monotonic stack / BFS / prefix sum / etc.) from this doc.
8. **Code it**, filling in only the problem-specific condition.
9. **Dry run** on your example + edge cases (empty, single element, duplicates, sorted/reverse-sorted, negatives).
10. **State final complexity** out loud before considering it done.

The goal: after ~50-60 problems using this checklist every time, pattern recognition becomes automatic — you'll see "next greater element" language and your hand will reach for a monotonic stack without conscious effort. That's the actual skill; the specific solutions are disposable.
