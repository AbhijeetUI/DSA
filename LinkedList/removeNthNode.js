// https://leetcode.com/problems/remove-nth-node-from-end-of-list/

/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */

// Two pass approach means traversing the linked list
// O(n) and O(1)
/*
1) calculate the length
2) reach the prev position to delete the node
*/
var removeNthFromEnd = function (head, n) {
  let sentinel = new ListNode();
  sentinel.next = head;
  let length = 0;
  while (head) {
    head = head.next;
    length++;
  }
  let prevPos = length - n; // prev node to reach and delete next node
  prev = sentinel;
  for (let i = 0; i < prevPos; i++) {
    prev = prev.next;
  }
  prev.next = prev.next.next;
  return sentinel.next; // will be the head
};

// One pass

var removeNthFromEnd = function (head, n) {
  let sentinel = new ListNode();
  sentinel.next = head;
  let firstP = sentinel;
  // move my first pointer ahead by n
  for (let i = 0; i < n; i++) {
    firstP = firstP.next;
  }
  let secondP = sentinel;
  // move both pointer until first pointer reaches to last node
  while (firstP.next) {
    secondP = secondP.next;
    firstP = firstP.next;
  }
  // delete second.next
  secondP.next = secondP.next.next;
  return sentinel.next; // will be the head
};
