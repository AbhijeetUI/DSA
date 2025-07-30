// https://leetcode.com/problems/remove-linked-list-elements/

/* 
head = [1 → 2 → 6 → 3 → 4 → 5 → 6]
val = 6

Iteration 1(prev = sentinel, prev.next.val = 1): Not equal to 6, so move forward
prev = prev.next -> points to 1

Iteration 2(prev.val = 1, prev.next.val = 2): Not equal to 6, so move forward
prev = prev.next -> points to 2

Iteration 3(prev.val = 2, prev.next.val = 6): Match, remove node with 6
prev = prev.next.next -> skips 6 and links node with value 3
list now 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6
Iteration 4(prev.val = 3, prev.next.val = 4): Not equal to 6, move
Iteration 5(prev.val = 4, prev.next.val = 5): Not equal to 6, move
Iteration 5(prev.val = 5, prev.next.val = 6): Match, remove node
prev = prev.next.next -> sets to null

DRY run for 

7 → 2 → 1 → 2 → 2 → 3 → 4 → 2, with val = 2

🧠 Setup:
- sentinel → dummy node pointing to head.
- prev starts at sentinel.

🔁 Traversal and Deletion Steps:
| prev Position | prev.next.val | Action Taken | List After Action | 
| sentinel | 7 | No match, move prev forward | 7 → 2 → 1 → 2 → 2 → 3 → 4 → 2 | 
| 7 | 2 | Match, remove 2 | 7 → 1 → 2 → 2 → 3 → 4 → 2 | 
| 7 | 1 | No match, move prev forward | 7 → 1 → 2 → 2 → 3 → 4 → 2 | 
| 1 | 2 | Match, remove 2 | 7 → 1 → 2 → 3 → 4 → 2 | 
| 1 | 2 | Match, remove 2 | 7 → 1 → 3 → 4 → 2 | 
| 1 | 3 | No match, move prev forward | 7 → 1 → 3 → 4 → 2 | 
| 3 | 4 | No match, move prev forward | 7 → 1 → 3 → 4 → 2 | 
| 4 | 2 | Match, remove 2 | 7 → 1 → 3 → 4 | 



✅ Final Output:
7 → 1 → 3 → 4
Let me know if you’d like to visualize this with a diagram, or turn it into a recursive version for comparison!


*/
var removeElements = function (head, val) {
  let sentinel = new ListNode(); // it will take 0, if not pass any
  sentinel.next = head; // link to front and keep track of head, post delete
  let prev = sentinel; // to keep track of previous node
  while (prev && prev.next) {
    if (prev.next.val === val) {
      prev.next = prev.next.next; // remove if match found
    } else {
      prev = prev.next;
    }
  }
  return sentinel.next;
};
