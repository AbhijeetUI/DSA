# The Complete DSA "Approach Finder" & Problem-Solving Framework

## Part 1: The Enhanced 10-Step Solving Checklist

1. **Read & Parse Constraints First:**
   - Extract $n$'s range, value ranges, and structural hints.
   - Calculate maximum permitted operations to target your optimal time complexity ($O(n)$, $O(n \log n)$, etc.) and filter out impossible algorithm families before writing any code.
2. **Paraphrase the Problem:** Summarize the core objective in a single concise sentence.
3. **Manually Solve a Tiny Example:** Trace a small sample input by hand and observe your natural human logic.
4. **Match to a Pattern:** Evaluate structural triggers (sorted array, contiguous range, top $K$) to identify candidate patterns.
5. **State the Brute Force & Complexity:** Define the baseline approach and its time/space complexity, even if you won't code it.
6. **Ask Optimization Questions (BUD):** Identify Bottlenecks, Unnecessary work, or Duplicated work. Can we use a one-pass approach with extra state (Hash Map, Monotonic Stack, Prefix Sum)?
7. **Pick the Matching Skeleton:** Select the foundational structure (Two Pointers, Sliding Window, Monotonic Stack, BFS, Prefix Sum, DP).
8. **Code the Solution:** Implement the structure, writing only the problem-specific conditions.
9. **Dry Run:** Trace your code line-by-line using your tiny example and edge cases (negatives, duplicates, single element, sorted/reverse-sorted).
10. **State Final Complexity:** Explicitly confirm Time and Space complexity ($O(\text{Time})$, $O(\text{Space})$) before submitting.

---

## Part 2: Constraint & Clue Matrix (Pre-Filtering Framework)

### 1. Input Size ($n$) Matrix

| Input Size ($n$)       | Max Allowed Operations | Target Time Complexity      | Candidate Algorithms & Structures                                                         |
| :--------------------- | :--------------------- | :-------------------------- | :---------------------------------------------------------------------------------------- |
| **$n \le 10 \sim 12$** | $\sim 10^7$            | $O(n!)$ or $O(2^n \cdot n)$ | Brute Force Permutations, Bitmask DP, Backtracking                                        |
| **$n \le 20$**         | $\sim 10^6$            | $O(2^n)$                    | Subsets, Meet-in-the-Middle ($O(2^{n/2})$), Backtracking                                  |
| **$n \le 100$**        | $\sim 10^6$            | $O(n^4)$ or $O(n^3)$        | Floyd-Warshall, 3D Dynamic Programming, Matrix Exponentiation                             |
| **$n \le 1,000$**      | $\sim 10^6$            | $O(n^2)$                    | 2D Dynamic Programming, Nested Loops, All-Pairs Shortest Path                             |
| **$n \le 10^5$**       | $\sim 10^6$            | $O(n \log n)$               | Sorting, Binary Search + Greedy, Divide & Conquer, Heaps, Segment Trees                   |
| **$n \le 10^6$**       | $\sim 10^6$            | $O(n)$                      | Hash Maps, Two Pointers, Sliding Window, Prefix Sum, Monotonic Stack, BFS/DFS, Union-Find |
| **$n \ge 10^8$**       | $< 100$                | $O(\log n)$ or $O(1)$       | Binary Search on Answer, Fast Power, Math Formulas                                        |

### 2. Value Range ($\text{nums}[i]$) Clues

- **Non-negative values only ($\text{nums}[i] \ge 0$):** Enables **Sliding Window** and **Two Pointers** for range/sum problems because expansion/contraction yields monotonic sums.
- **Negative values present:** Invalidates standard Sliding Window for target sums. Signals **Prefix Sum + Hash Map** or **Kadane’s Algorithm**.
- **Small bounded values ($1 \le \text{nums}[i] \le 100$ or $1 \le \text{nums}[i] \le n$):**
  - Signals **Counting Sort** or **Bucket Sort** ($O(n)$ time).
  - Signals **Cyclic Sort / In-Place Indexing** ($O(1)$ extra space) using element values as target indices.
- **Large values ($\text{nums}[i] \ge 10^9$):** Requires 64-bit integers (`BigInt`/`Long`) or **Coordinate Compression** before tree-based queries.

### 3. Structural & Statement Triggers

- **"Sorted array" / "Partially sorted":** Try **Binary Search** ($O(\log n)$) or **Two Pointers** ($O(n)$ time, $O(1)$ space).
- **"Contiguous subarray / substring":** Points to **Sliding Window**, **Prefix Sum**, or **Monotonic Queue**.
- **"Subsequence" (non-contiguous):** Points to **Dynamic Programming**, **Greedy**, or **Monotonic Stack**.
- **"In-place / $O(1)$ extra space":** Forces **Two Pointers**, **Bitwise Operations**, or **Index/Sign Manipulation**.
- **"Graph / Tree" ($V$ vertices, $E$ edges):** Target $O(V + E)$ using **BFS**, **DFS**, **Topological Sort**, or **Union-Find**.

---

## Part 3: The Approach Finder Framework

### 1. Common Problem Triggers & Patterns

- **Trigger:** "Find the longest/shortest contiguous subarray..." $\rightarrow$ **Pattern:** Sliding Window
- **Trigger:** "Find pairs/triplets in a sorted array..." $\rightarrow$ **Pattern:** Two Pointers
- **Trigger:** "Find top $K$, maximum, or minimum $K$ elements..." $\rightarrow$ **Pattern:** Priority Queue / Heaps
- **Trigger:** "Find the next greater/smaller element..." $\rightarrow$ **Pattern:** Monotonic Stack
- **Trigger:** "Find subarray sum equal to $K$ (with negatives)..." $\rightarrow$ **Pattern:** Prefix Sum + Hash Map
- **Trigger:** "Count combinations/permutations or evaluate optimal choice..." $\rightarrow$ **Pattern:** Dynamic Programming / Backtracking

### 2. The BUD Optimization Framework

When optimizing a brute-force approach, identify **BUD**:

- **Bottleneck:** Which step dominates runtime? (e.g., repeatedly scanning an array to search for elements).
- **Unnecessary Work:** Are you checking conditions that cannot possibly contribute to the answer?
- **Duplicated Work:** Are you recalculating values you have already computed?

_Data structures fix specific bottlenecks:_

- **Slow lookup/search:** Replace linear scan with **Hash Map** / **Set** ($O(1)$).
- **Slow min/max retrieval:** Replace linear scan with **Heap** ($O(1)$ top, $O(\log n)$ push/pop).
- **Repeated range sum queries:** Replace looping with **Prefix Sum** array ($O(1)$ query time).

### 3. Solution Consumption Escalation Rules

When stuck during practice, follow this order to protect problem-solving skill development:

1. **Struggle for 20–30 minutes:** Draw diagrams, test edge cases on paper.
2. **Check High-Level Tags:** Reveal only topic tags (e.g., Hash Table, Two Pointers). Try again.
3. **Read Written Editorial Strategy:** Read the algorithm description only. Stop before looking at any code and attempt implementation independently.
4. **Inspect Code:** View code solutions only if your implementation fails after understanding the strategy.

### 4. Post-Solution "What If?" Protocol

After solving any problem, analyze variations:

- _What if the array was already sorted?_ (Can space complexity be optimized to $O(1)$ using Two Pointers?)
- _What if input streams arrive one by one in real-time?_ (Can a Heap or Sliding Window maintain online results?)
- _What if duplicate elements are present?_
