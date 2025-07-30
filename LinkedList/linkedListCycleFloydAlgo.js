/*
*
Floyd's Cycle finding algorithm
Approach: 2 pointer can use
Slow pointer -> Moves 1-step
Fast pointer -> Moves 2-step

If cycle exists slow === fast meet at some point

Problem:
Detect if a singly linked list contains a cycle.

Approach: Two Pointers (Slow & Fast)
- Slow pointer: moves one step at a time.
- Fast pointer: moves two steps at a time.
- If there’s a cycle, the fast pointer will eventually "lap" the slow pointer and they’ll meet.
- If no cycle, fast will reach the end (NULL).

Example:
Let’s dry run this on a cyclic list:

List: 1 → 2 → 3 → 4 → 5
                  ↑     ↓
                 ← ← ← ←
Cycle starts again at node 3

Step-by-Step Dry Run:
Initialize:
- slow = head (node 1)
- fast = head (node 1)

--- Iteration 1 ---
- slow → 2
- fast → 3

--- Iteration 2 ---
- slow → 3
- fast → 5

--- Iteration 3 ---
- slow → 4
- fast → 4   ✅ Match!

🎯 Result: slow == fast ➞ Cycle Detected

🧩 Notes:
- The fast pointer moves twice as fast. If a cycle exists, it must catch the slow pointer within O(n) time.
- If fast or fast.next is NULL, we hit the end — hence, no cycle.

📊 Complexity Recap:
| Metric | Value | 
| Time Complexity | O(n) | 
| Space Complexity | O(1) | 
| Extra Space Used | None | 

*/

var hasCycle = function (head) {
  if (head === null) return false;
  let slow = head;
  let fast = head?.next; // can start next, bcoz do not want slow and fast pointers at the initial time
  while (slow !== fast) {
    if (fast === null || fast?.next === null) {
      return false;
    }
    slow = slow.next;
    fast = fast.next.next;
  }
  return true;
};
