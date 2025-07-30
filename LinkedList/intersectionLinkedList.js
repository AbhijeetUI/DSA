//

/*
🪓 Brute Force Approach: Compare Every Pair
Idea:
Traverse each node in headA, and for each node, traverse every node in headB. If there's a node that's the same (i.e., the actual memory address is equal), that's your intersection.

🔁 Steps
- Start with currentA at the head of headA.
- For each node in headA, loop through all nodes in headB.
- If currentA == currentB, return the node.
- If no match is found after all iterations, return null.

time complexity: O(m * n) -> O(n2)

find an node in this approach take O(n)
*/
function getIntersectionNode(headA, headB) {
  let currentA = headA;

  while (currentA !== null) {
    let currentB = headB;

    while (currentB !== null) {
      if (currentA === currentB) {
        return currentA;
      }
      currentB = currentB.next;
    }

    currentA = currentA.next;
  }

  return null;
}

/*
Approach 2: hash map/set
finding an node/element take O(1)

1) Put all elements of headB in Set
2) Set(b1,b2,b3,c1,c2,c3)
3) loop headA in Set, if set.has(a1) -> no
if set.has(a2) -> no
if set.has(c1) -> yes -> return intersection 
*/

var getIntersectionNode = function (headA, headB) {
  // put all nodes of headB inside a set
  let store = new Set();
  while (headB) {
    store.add(headB);
    headB = headB.next;
  }

  // check for each element of headA if thet are present in set
  while (headA) {
    if (store.has(headA)) {
      return headA;
    }
    headA = headA.next;
  }
  return null;
};
