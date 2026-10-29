# Recursive Rendering Principles

## Table of Contents

- [Why Recursive Rendering Matters](#why-recursive-rendering-matters)
- [1. Always Define a Base Condition](#1-always-define-a-base-condition)
- [2. Design Tree Data Properly](#2-design-tree-data-properly)
- [3. Use Stable Keys](#3-use-stable-keys)
- [4. Keep the Recursive Component Focused](#4-keep-the-recursive-component-focused)
- [5. Support Expand and Collapse](#5-support-expand-and-collapse)
- [6. Store Expansion State Separately](#6-store-expansion-state-separately)
- [7. Normalize Large Trees](#7-normalize-large-trees)
- [8. Lazy Load Child Nodes](#8-lazy-load-child-nodes)
- [9. Memoize Recursive Nodes](#9-memoize-recursive-nodes)
- [10. Avoid Deep Prop Drilling](#10-avoid-deep-prop-drilling)
- [11. Handle Circular References](#11-handle-circular-references)
- [12. Separate Logic from Rendering](#12-separate-logic-from-rendering)
- [13. Virtualize Large Trees](#13-virtualize-large-trees)
- [14. Support Search in Trees](#14-support-search-in-trees)
- [15. Support Node Actions](#15-support-node-actions)
- [Core Recursive Rendering Pattern](#core-recursive-rendering-pattern)

---

## Why Recursive Rendering Matters

Recursive rendering is useful when UI data has a tree shape, such as folders, menus, or nested nodes. A good implementation needs a clear stopping condition, stable keys, and a focused recursive component.

| Principle                          | Why it matters                                    |
| ---------------------------------- | ------------------------------------------------- |
| Define a base condition            | Prevents infinite recursion.                      |
| Keep the recursive component small | Improves maintainability.                         |
| Use stable keys                    | Supports correct rendering when the tree changes. |
| Normalize tree data                | Makes updates easier.                             |
| Support expand and collapse        | Improves the user experience.                     |
| Memoize large trees                | Can improve performance.                          |
| Lazy load children                 | Supports scalability.                             |
| Avoid deep prop drilling           | Keeps component structure cleaner.                |
| Handle circular references         | Prevents crashes from repeated traversal.         |
| Separate tree logic from UI        | Makes logic reusable.                             |
| Virtualize large trees             | Improves performance for large node counts.       |

## 1. Always Define a Base Condition

Every recursive component needs a stopping condition. Without one, it keeps rendering itself forever.

**Incorrect: no stopping condition**

```jsx
function TreeNode({ node }) {
  return <TreeNode node={node} />;
}
```

**Correct: stop when there are no children**

```jsx
function TreeNode({ node }) {
  if (!node.children?.length) {
    return <div>{node.name}</div>;
  }

  return (
    <>
      <div>{node.name}</div>
      {node.children.map((child) => (
        <TreeNode key={child.id} node={child} />
      ))}
    </>
  );
}
```

**Rule:** Every recursive component must have a stopping condition.

## 2. Design Tree Data Properly

Use a clear structure where each node has an identifier, a name, and a list of children.

```javascript
const node = {
  id: 1,
  name: "src",
  children: [
    {
      id: 2,
      name: "components",
      children: [],
    },
  ],
};
```

A clear tree structure makes recursion, traversal, and updates easier.

## 3. Use Stable Keys

Tree structures often change. Use a stable node ID as the React key.

**Avoid:**

```jsx
<TreeNode key={index} node={node} />
```

**Prefer:**

```jsx
<TreeNode key={node.id} node={node} />
```

Stable keys help React keep the right rendered item associated with the right node when items change.

## 4. Keep the Recursive Component Focused

A recursive component should have a small responsibility: render one node and render its children.

**Avoid putting all of these inside `TreeNode`:**

- API calls
- Validation
- State management
- Rendering logic

Keep responsibilities minimal so the component is easier to maintain.

## 5. Support Expand and Collapse

Most real-world trees need expand and collapse behavior. A node can use state to track whether its children are visible.

```jsx
const [expanded, setExpanded] = useState(false);

<button onClick={() => setExpanded((previous) => !previous)}>
  {expanded ? "Collapse" : "Expand"}
</button>;
```

The lesson identifies these use cases:

- File explorers
- Tree views
- Menus

## 6. Store Expansion State Separately

Avoid changing the tree node directly to store whether it is expanded.

**Avoid mutating the node:**

```javascript
node.expanded = true;
```

**Keep expansion state separately:**

```javascript
const expandedNodes = new Set(["folder-1", "folder-2"]);
```

Keeping this state separate makes updates easier and avoids mutating the tree data.

## 7. Normalize Large Trees

A deeply nested tree can be difficult to update. For a large tree, keep the nodes in one map and their child relationships in another.

```javascript
const nodesById = {
  1: { id: 1, name: "src" },
  2: { id: 2, name: "components" },
  3: { id: 3, name: "TreeNode" },
};

const childrenMap = {
  1: [2, 3],
};
```

This approach can be useful for large file systems and enterprise applications.

## 8. Lazy Load Child Nodes

Do not load thousands of folders at once if children can be loaded when needed. Load a folder's children when the user expands it.

```text
User expands folder
        ↓
Fetch that folder's children
```

The lesson names Google Drive, GitHub, and VS Code as examples of applications that use this pattern.

## 9. Memoize Recursive Nodes

Large trees can rerender thousands of nodes. `React.memo` can help avoid rerendering a node when its props have not changed.

```javascript
const MemoizedTreeNode = React.memo(TreeNode);
```

The benefit is faster rendering with fewer rerenders.

## 10. Avoid Deep Prop Drilling

Passing the same values through every level of a tree can make the component structure harder to manage.

**Avoid passing many props through every recursive level:**

```jsx
<TreeNode
  theme={theme}
  user={user}
  permissions={permissions}
  settings={settings}
/>
```

The lesson suggests Context API or Zustand as alternatives.

## 11. Handle Circular References

A circular reference can send traversal back to a node it has already visited:

```text
A → B → C → A
```

Without a check, traversal can continue forever. Keep a `visited` set and stop when a node has already been seen.

```javascript
const visited = new Set();

function shouldRenderNode(node) {
  if (visited.has(node.id)) {
    return false;
  }

  visited.add(node.id);
  return true;
}
```

Check a node before rendering or traversing it. This is also a useful interview follow-up question.

## 12. Separate Logic from Rendering

Keep tree operations such as traversal and filtering separate from the component that renders the node.

**Avoid:** Putting tree traversal, filtering, and rendering together in `TreeNode`.

**Prefer:**

```jsx
const tree = useTree();

return <TreeNode node={tree} />;
```

Separating the logic makes it reusable and easier to test.

## 13. Virtualize Large Trees

Rendering 100,000 nodes can become slow. Virtualization renders only visible nodes.

The lesson names these libraries:

- `react-window`
- `react-virtualized`

## 14. Support Search in Trees

Tree search can use traversal and recursive filtering. For example, searching for `React` may need to show the matching node and expand its parent path:

```text
Search: React

src
└── components
    └── ReactCard
```

The lesson highlights two parts of this behavior:

- Tree traversal
- Recursive filtering

## 15. Support Node Actions

Common node actions include:

- Rename
- Delete
- Move
- Add a child

Pass actions such as `onRename(nodeId)` and `onDelete(nodeId)` instead of mutating the node directly.

```jsx
<TreeNode node={node} onRename={onRename} onDelete={onDelete} />
```

## Core Recursive Rendering Pattern

Render the current node, then render each child using the same recursive component. Use each child's stable ID as its key.

```jsx
function TreeNode({ node }) {
  return (
    <div>
      {node.name}
      {node.children?.map((child) => (
        <TreeNode key={child.id} node={child} />
      ))}
    </div>
  );
}
```

This is the core recursive rendering pattern. Include a base condition so nodes without children stop recursing.
