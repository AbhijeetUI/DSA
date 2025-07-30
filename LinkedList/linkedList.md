# Linked List

## What is a Linked List?

A linked list is a data structure consisting of a sequence of elements, where each element (node) contains a value and a reference (or pointer) to the next node in the sequence. Unlike arrays, linked lists do not require contiguous memory allocation, allowing for dynamic memory usage and efficient insertions and deletions.

## Types of Linked Lists

1. **Singly Linked List**: Each node points to the next node, and the last node points to `null`.
2. **Doubly Linked List**: Each node contains a reference to both the next and the previous nodes, allowing traversal in both directions.
3. **Circular Linked List**: The last node points back to the first node, forming a circle. This can be singly or doubly linked.
4. **Circular Doubly Linked List**: Combines the features of circular and doubly linked lists, where each node points to both the next and previous nodes, and the last node points back to the first.

# HEAD is a reference to the first node in the list, and TAIL is a reference to the last node (if applicable).

# Differences between Linked Lists and Arrays

- **Memory Allocation**: Linked lists use dynamic memory allocation, while arrays use static memory allocation.
- **Size**: Linked lists can grow and shrink dynamically, while arrays have a fixed size.
- **Insertion/Deletion**: Linked lists allow for efficient insertions and deletions at any position, while arrays require shifting elements.
- **Access Time**: Linked lists have O(n) access time for elements, while arrays have O(1) access time due to direct indexing.

# Use Cases

- If you want to access elements by index, use an array.
- If you need frequent insertions and deletions, use a linked list.
- Memory-efficient storage for statically sized data can be achieved with arrays, while linked lists are better for dynamically sized data.
- Do lots of traversal/manipulation of data? Linked lists are more efficient.
