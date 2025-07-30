// https://leetcode.com/problems/middle-of-the-linked-list/description/

/**
 * 
 * Two pointers:
- slow → moves 1 step at a time
- fast → moves 2 steps at a time

Linked List: 1 → 2 → 3 → 4 → 5 → NULL
Expected Middle: Node with value 3

Initialize:
- slow = head (node 1)
- fast = head (node 1)

--- Iteration 1 ---
- Move slow to 2
- Move fast to 3

Current:
- slow → 2
- fast → 3

--- Iteration 2 ---
- Move slow to 3
- Move fast to 5

Current:
- slow → 3
- fast → 5

--- Iteration 3 ---
- fast.next is NULL → loop stops

🎯 Result:
- slow is at node 3 → middle node found

 Notes:
- If the list has an odd length, slow lands exactly in the center.
- If it's even, it returns the second middle node, which is often preferred in interview problems unless stated otherwise.

*/

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var middleNode = function (head) {
  let slow = head;
  let fast = head;
  while (fast?.next) {
    slow = slow.next; // move slow by 1
    fast = fast.next.next; // move fast by 2
  }
  return slow;
};
