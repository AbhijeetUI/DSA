# Dynamic Programming Patterns Sheet

## 1) Climbing Stairs dry run

File reference: [blind75/climbStairs.js](blind75/climbStairs.js)

```js
var climbStairs = function (n) {
  let dp = [0, 1, 2];
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
};
```

### What it means

This is a Dynamic Programming problem.

- `dp[i]` = number of ways to reach stair `i`
- You can reach stair `i` from:
  - stair `i - 1` by taking 1 step
  - stair `i - 2` by taking 2 steps

So:

- `dp[i] = dp[i - 1] + dp[i - 2]`

### Dry run for `n = 5`

Start:

```js
dp = [0, 1, 2];
```

Meaning:

- `dp[0] = 0`
- `dp[1] = 1` way
- `dp[2] = 2` ways: `[1+1]`, `[2]`

Now compute from `i = 3` to `5`:

1. `i = 3`
   - `dp[3] = dp[2] + dp[1] = 2 + 1 = 3`

2. `i = 4`
   - `dp[4] = dp[3] + dp[2] = 3 + 2 = 5`

3. `i = 5`
   - `dp[5] = dp[4] + dp[3] = 5 + 3 = 8`

Final output:

```js
return (dp[5] = 8);
```

So there are 8 ways to climb 5 stairs.

---

## 2) Recursive version

```js
var climbStairsRecursive = function (n) {
  if (n === 1) return 1;
  if (n === 2) return 2;

  return climbStairsRecursive(n - 1) + climbStairsRecursive(n - 2);
};
```

### Why it works

To reach stair `n`, you can come from:

- `n - 1` with 1 step
- `n - 2` with 2 steps

So:

- `f(n) = f(n - 1) + f(n - 2)`

### Problem with this version

It recomputes the same values many times, so it is inefficient.

Example: `f(5)` calls `f(3)` multiple times.

Time complexity is exponential.

---

## 3) Memoized version

```js
var climbStairsMemo = function (n, memo = {}) {
  if (n === 1) return 1;
  if (n === 2) return 2;
  if (memo[n] !== undefined) return memo[n];

  memo[n] = climbStairsMemo(n - 1, memo) + climbStairsMemo(n - 2, memo);
  return memo[n];
};
```

### Why memo helps

It stores already computed answers so repeated subproblems are not recalculated.

### Complexity

- Time: `O(n)`
- Space: `O(n)`

---

## 4) Bottom-up DP version

This is the cleanest and most interview-friendly approach:

```js
var climbStairs = function (n) {
  let dp = [0, 1, 2];
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
};
```

### Why it is preferred

- no recursion
- no stack overflow risk
- easier to explain
- directly builds the answer from smaller valid states

---

## 5) How to think in DP when the mind goes blank

Use this checklist:

### Step 1: Define the state

Ask:

- What does one DP value represent?

For this problem:

- `dp[i] = number of ways to reach stair i`

---

### Step 2: Find the recurrence

Ask:

- How can I compute the current state from smaller states?

For this problem:

- `dp[i] = dp[i - 1] + dp[i - 2]`

---

### Step 3: Set base cases

Always start with the smallest valid values.

For this problem:

- `dp[1] = 1`
- `dp[2] = 2`

---

### Step 4: Decide direction

Ask:

- Should I compute from small to large or large to small?

For this problem:

- small to large

This is bottom-up DP.

---

### Step 5: Check for overlap

Ask:

- Am I solving the same subproblem many times?

If yes, DP is likely the right solution.

This problem repeats states like `f(3)` and `f(4)`.

---

## 6) One-page DP patterns sheet

### Pattern A: Count ways

Use when the problem asks for number of ways or counts.

Form:

```js
dp[i] = dp[i - 1] + dp[i - 2];
```

Examples:

- climbing stairs
- unique paths
- Fibonacci-like counting problems

---

### Pattern B: Take or skip

Use when you choose whether to include the current element.

Form:

```js
dp[i] = max(dp[i - 1], dp[i - 2] + current);
```

Example:

- house robber

---

### Pattern C: Knapsack / subset choice

Use when you have items and a capacity.

Form:

```js
dp[i][j] = max(dp[i - 1][j], dp[i - 1][j - weight] + value);
```

Example:

- 0/1 knapsack

---

### Pattern D: Longest increasing sequence

Use when you need longest valid end-to-end sequence.

Form:

```js
dp[i] = 1 + max(dp[j]);
```

Example:

- LIS
- longest subsequence problems

---

### Pattern E: Grid DP

Use when movement is in a matrix.

Form:

```js
dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
```

Example:

- unique paths
- minimum path sum

---

## 7) A second classic DP example: House Robber

```js
var rob = function (nums) {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  let dp = new Array(nums.length);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);

  for (let i = 2; i < nums.length; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
  }

  return dp[nums.length - 1];
};
```

### State

- `dp[i] = max money robbed from first i houses`

### Recurrence

- `dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])`

### Why this works

At each house, you either:

- skip it and keep previous best
- rob it and add current value, but then you cannot rob the previous house

This is the classic “take or skip” DP pattern.

---

## 8) Interview habit when you freeze

Say these steps out loud:

1. “I’ll define the state.”
2. “I’ll write the recurrence.”
3. “I’ll create base cases.”
4. “I’ll fill from small to large.”
5. “I’ll verify with a small example.”

This makes your thinking structured and calm.

---

## 9) The core DP formula to memorize

For DP, always think:

- State = what am I storing?
- Recurrence = how does it build from smaller states?
- Base case = where does it start?
- Order = small to large or large to small?
- Result = what is the final answer?

If you can answer those, you can usually solve the problem.

---

## 10) Final takeaway

This problem is a classic DP pattern:

- recursive: solve smaller versions
- memoized: cache repeated results
- bottom-up: build answers from small to large

The pattern is:

- state + recurrence + base case

That is the heart of dynamic programming.
