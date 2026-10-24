// https://leetcode.com/problems/top-k-frequent-elements/description/

/*
Example:
  nums = [1, 1, 1, 2, 2, 3], k = 2

The frequency map becomes { 1: 3, 2: 2, 3: 1 }.
Buckets use the frequency as their index:
  frequency 1 -> [3]
  frequency 2 -> [2]
  frequency 3 -> [1]

Read the buckets from highest frequency to lowest. We find 1 first, then 2,
so the answer is [1, 2].

Constraints:
  1 <= nums.length <= 10^5
  -10^4 <= nums[i] <= 10^4
  1 <= k <= the number of unique values in nums
*/

/**
 * Returns the k most frequent numbers.
 *
 * Pass visualize = true to print the count, bucket-building, and selection
 * steps. The default keeps the function quiet for normal/LeetCode use.
 *
 * @param {number[]} nums
 * @param {number} k
 * @param {boolean} visualize
 * @return {number[]}
 */
var topKFrequent = function (nums, k, visualize = false) {
  const count = new Map();
  const buckets = [];
  const result = [];

  // Step 1: Count each number. The map answers: "How often did we see it?"
  for (let index = 0; index < nums.length; index++) {
    const num = nums[index];
    const frequency = (count.get(num) || 0) + 1;
    count.set(num, frequency);

    if (visualize) {
      console.log(
        `Count ${index + 1}/${nums.length}: saw ${num}; ` +
          `frequency of ${num} is now ${frequency}.`
      );
      console.log(
        `  Count map: { ${[...count.entries()]
          .map(([value, valueFrequency]) => `${value}: ${valueFrequency}`)
          .join(", ")} }`
      );
    }
  }

  // Step 2: Put each distinct number into the bucket for its frequency.
  // For example, buckets[3] contains every number that appeared 3 times.
  for (const [num, frequency] of count) {
    if (!buckets[frequency]) {
      buckets[frequency] = [];
    }
    buckets[frequency].push(num);

    if (visualize) {
      console.log(
        `Place ${num} (frequency ${frequency}) into bucket ${frequency}.`
      );
      console.log(
        `  Buckets: ${buckets
          .map(
            (values, bucketFrequency) =>
              `${bucketFrequency}: ${values ? `[${values.join(", ")}]` : "[]"}`
          )
          .filter((_, bucketFrequency) => bucketFrequency > 0)
          .join(" | ")}`
      );
    }
  }

  // Step 3: Scan from the highest frequency down. Stop once we have k values.
  for (let frequency = buckets.length - 1; frequency >= 0; frequency--) {
    const values = buckets[frequency];
    if (!values) {
      continue;
    }

    if (visualize) {
      console.log(
        `Check bucket ${frequency}: [${values.join(", ")}]. ` +
          `Add these value(s) to the answer.`
      );
    }

    for (const value of values) {
      result.push(value);
      if (result.length === k) {
        break;
      }
    }

    if (visualize) {
      console.log(`  Current answer: [${result.join(", ")}]`);
    }
    if (result.length === k) {
      break;
    }
  }

  if (visualize) {
    console.log(`Done: the ${k} most frequent value(s) are [${result.join(", ")}].`);
  }
  return result;
};

// Run this file to see every step for the example above.
console.log("Walkthrough: topKFrequent([1, 1, 1, 2, 2, 3], 2)");
console.log("The input has six numbers; we want the two most frequent values.");
topKFrequent([1, 1, 1, 2, 2, 3], 2, true);
