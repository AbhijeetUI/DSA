/*
https://leetcode.com/problems/two-sum/description/

Constraints:

1) 2 <= nums.length <= 10(4) (Array Size)

• What it means: The input array nums will never be empty and will never have just 1 element. 
  It will contain at least 2 elements and at most 10,000 elements (10⁴).

2) -10(9) <= nums[i] <= 10(9) (Value of Elements)
=> actual numbers in array can be negative 1 billion to positive 1 billion
Why it matters
  - you can not use array indices as direct frequency counter, 
    bcoz you can not create an array with negative index or array size of 2 billion
    You must use a Hash Map/Object.

3) -10(9) <= target <= 10(9) (Value of Target)
=> The target sum can also range from negative 1 billion to positive 1 billion.
• Why it matters:
	• When you add two numbers from the array together, the maximum possible sum could be 10⁹ + 10⁹ = 2 × 10⁹.      
*/
