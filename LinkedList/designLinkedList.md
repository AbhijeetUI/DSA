## Design of Linked List

A linked list is a linear data structure where elements are stored in nodes, and each node points to the next node in the sequence. This design allows for efficient insertion and deletion of elements.

### Components of a Linked List

1. **Node**: The basic building block of a linked list, containing data and a reference (or pointer) to the next node.
2. **Head**: The first node in the linked list, used to access the entire list.
3. **Tail**: The last node in the linked list, which points to null (or None) to indicate the end of the list.

```js
function Node(data) {
  this.data = data; // The value stored in the node
  this.next = null; // Pointer to the next node
}
```

# Create new node

```js
function createNode(data) {
  return new Node(data);
}
```

# How to create a Linked List

```js
function LinkedList() {
  this.head = null; // Pointer to the first node
  this.tail = null; // Pointer to the last node
  this.size = 0; // Number of nodes in the list
}
```
