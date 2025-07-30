// https://leetcode.com/problems/add-two-numbers/

/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
/*
*
Initialize dummy node, head reference, and carry.
Loop while there are nodes or carry.
Add values from nodes and carry.
Update carry and extract digit.
Create and attach new node.
Advance input lists.
Return the result list (skipping dummy node).
*/
var addTwoNumbers = function (l1, l2) {
  let ans = new ListNode(); // to keep track of starting point we need reference and to attach our list
  let ansHead = ans;
  let carry = 0;
  while (l1 || l2 || carry) {
    // if l1 and l2 are not present consider 0 and add
    let sum = (l1?.val || 0) + (l2?.val || 0) + carry;
    carry = Math.floor(sum / 10); // 12/10 = 1.2 = 1
    let digit = sum % 10; // 12/10 = 2
    let newNode = new ListNode(digit); // to create result node
    ans.next = newNode;
    ans = ans.next;
    l1 = l1?.next; // move forward only if exists
    l2 = l2?.next;
  }
  return ansHead.next;
};
