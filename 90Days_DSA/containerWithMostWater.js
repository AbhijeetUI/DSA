/*
https://leetcode.com/problems/container-with-most-water/description/

Constraints:

n == height.length
2 <= n <= 10^5
0 <= height[i] <= 10^4


1. n == height.length

• n represents the total number of elements of the input array called height.

2. 2 <= n <= 10^5

• The Boundaries: The array will have at least 2 items and at most 100,000 (10⁵) items.
• Why it matters: You do not need to worry about handling an empty array ([]) or an array with only 1 item. There will always be at least 2 lines to form a container.
• The Algorithm Implication: Because n can be as large as 100,000, a brute-force solution checking every single pair of lines using nested loops (O(n²) time complexity) will result in a Time Limit Exceeded (TLE) error. 
  100,000² equals 10 billion operations, which takes too long to run. we need to design a faster solution, an O(n) linear time complexity approach (like the Two-Pointer technique).

3. 0 <= height[i] <= 10^4

• What it means: Each individual value inside the array (height[i]) represents the height of a vertical line.
• The Boundaries: The height of any given line will be between 0 and 10,000 (10⁴).
• Why it matters:
	• Heights will never be negative.
	• A height of 0 is possible, meaning a line can have no height.
	• The max height is relatively small (10,000), meaning the calculated water area (width × min height) easily fits within standard standard 32-bit integer limits in programming languages like Java, C++, or Python.

*/
