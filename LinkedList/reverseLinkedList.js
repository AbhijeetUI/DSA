// https://leetcode.com/problems/reverse-linked-list/description/
/**
 * 
 * Iteration 1:
- curr = 1
- temp = curr.next = 2        // Save next node
- curr.next = prev = NULL     // Reverse pointer
- prev = curr = 1             // Move prev forward
- curr = temp = 2             // Move curr forward

List now: 1 → NULL

---

Iteration 2:
- curr = 2
- temp = 3
- curr.next = prev = 1        // 2 now points to 1
- prev = 2
- curr = 3

List now: 2 → 1 → NULL

---

Iteration 3:
- curr = 3
- temp = 4
- curr.next = prev = 2
- prev = 3
- curr = 4

List now: 3 → 2 → 1 → NULL

---

Iteration 4:
- curr = 4
- temp = NULL
- curr.next = prev = 3
- prev = 4
- curr = NULL

List now: 4 → 3 → 2 → 1 → NULL

Final Step:
- Loop ends when curr = NULL
- Return prev as the new head ➞ ✅ reversed list

 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
  let prev = null;
  let curr = head;
  while (curr) {
    let temp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = temp;
  }
  head = prev; // prev is starting point here
  return prev;
};
