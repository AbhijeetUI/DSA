// https://leetcode.com/problems/linked-list-cycle/description/

/*
    Linked List: 1 → 2 → 3 → 4 → 1 (cycle exists: 4 points back to 1)

Step-by-step execution:

1. Initialize empty Set: visited = {}

2. Start iteration:
   - curr = head (node with value 1)

3. Step 1:
   - visited.has(1)? ➞ No
   - Add node 1 to visited ➞ visited = {1}
   - Move curr to next ➞ curr = 2

4. Step 2:
   - visited.has(2)? ➞ No
   - Add node 2 ➞ visited = {1, 2}
   - Move curr ➞ curr = 3

5. Step 3:
   - visited.has(3)? ➞ No
   - Add node 3 ➞ visited = {1, 2, 3}
   - Move curr ➞ curr = 4

6. Step 4:
   - visited.has(4)? ➞ No
   - Add node 4 ➞ visited = {1, 2, 3, 4}
   - Move curr ➞ curr = 1 (back to node 1)

7. Step 5:
   - visited.has(1)? ➞ **Yes!**
   - Cycle detected ✅
   - Return true

📊 Complexity Recap:
| Metric | Value | 
| Time Complexity | O(n) | 
| Space Complexity | O(n) | because we use Set/hashmap over here
| Extra Space Used | None | 
*/

/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function (head) {
  let visited = new Set();
  let curr = head;
  while (curr) {
    if (visited.has(curr)) {
      return true;
    }
    visited.add(curr);
    curr = curr.next;
  }
  return false;
};
