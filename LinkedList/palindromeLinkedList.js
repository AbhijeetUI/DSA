// https://leetcode.com/problems/palindrome-linked-list/description/
/*
Approach 1: Using array
Traverse the linked list and store values in an array.
Check whether the array is a palindrome by comparing elements from start and end moving towards the center.

Time and Space Complexity:
Time Complexity: O(n), where n is the number of nodes.
Space Complexity: O(n), for the array storage.
*/
// 1 -> 2 -> 3 -> 3 -> 2 -> 1 -> null

// Approach 1:
/* var isPalindrome = function (head) {
  let arr = [];
  let curr = head;
  while (curr !== null) {
    arr.push(curr.val);
    curr = curr.next;
  }
  let left = 0,
    right = arr.length - 1;
  while (left < right) {
    if (arr[left++] !== arr[right--]) return false;
  }
  return true;
}; */

// Approach 2:
/*
DRY RUN
🧠 Step-by-Step Execution
Initial Setup
- head: points to 1 → 2 → 3 → 2 → 1
- slow, fast: both start at 1
🐢🐇 Finding the Middle
Loop condition: while (fast && fast.next)
- Iteration 1:
- slow → 2
- fast → 3
- Iteration 2:
- slow → 3
- fast → 1 (fast.next becomes null, loop ends)
📍 Middle node found: slow is now at node with value 3

🔁 Reversing Second Half
Start from slow (i.e., node 3)
- Iteration 1:
- curr: 3
- prev: null
- curr.next → 2, reverse link
- prev → 3, curr → 2
- Iteration 2:
- curr: 2
- Reverse link, prev → 2, curr → 1
- Iteration 3:
- curr: 1
- Reverse link, prev → 1, curr → null
✅ Second half reversed: 1 → 2 → 3

🔍 Comparing First and Second Half
- firstList starts at 1
- secondList starts at 1 (reversed half)
Compare nodes:
- 1 === 1 ✔️
- 2 === 2 ✔️
- 3 === 3 ✔️
✅ All nodes match — palindrome confirmed!

🏁 Return Value
true

*/
var isPalindrome = function (head) {
  // find middle element
  let slow = (fast = head);
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  //reversing the linked list
  let prev = null;
  let curr = slow;
  while (curr) {
    let temp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = temp;
  }
  // prev is the 2nd list

  // checking for palindrome and check each element in the list
  let firstList = head;
  let secondList = prev;
  while (secondList) {
    if (firstList.val !== secondList.val) {
      return false;
    }
    firstList = firstList.next;
    secondList = secondList.next;
  }
  return true;
};

/*
Find middle of the list
Reverse the second half of the list
Move start and end pointer and compare each value
*/
