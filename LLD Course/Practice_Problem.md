# Machine Coding: Kanban Board (Trello Clone)

## Table of Contents

- [Problem Statement](#problem-statement)
- [Required Features](#required-features)
- [High-Level UI](#high-level-ui)
- [Concepts Tested](#concepts-tested)
- [Step 1: Define the Data Model](#step-1-define-the-data-model)
- [Step 2: Design the Components](#step-2-design-the-components)
- [Step 3: Add Tasks with Immutable Updates](#step-3-add-tasks-with-immutable-updates)
- [Step 4: Move Tasks with Drag and Drop](#step-4-move-tasks-with-drag-and-drop)
- [Step 5: Reorder Tasks](#step-5-reorder-tasks)
- [Step 6: Persist the Board](#step-6-persist-the-board)
- [Step 7: Use Optimistic UI](#step-7-use-optimistic-ui)
- [Step 8: Optimize Performance](#step-8-optimize-performance)
- [Step 9: Support Accessibility](#step-9-support-accessibility)
- [Follow-Up 1: Search Tasks](#follow-up-1-search-tasks)
- [Follow-Up 2: Replace Local Storage with an API](#follow-up-2-replace-local-storage-with-an-api)
- [Follow-Up 3: Support Real-Time Collaboration](#follow-up-3-support-real-time-collaboration)
- [Reference Implementation Coverage](#reference-implementation-coverage)

---

## Problem Statement

Build a Kanban board similar to Trello. The board contains columns such as **Todo**, **In Progress**, and **Done**, with tasks that users can manage and move between columns.

## Required Features

- Create columns: Todo, In Progress, and Done
- Add tasks
- Edit tasks
- Delete tasks
- Drag tasks between columns
- Reorder tasks within a column
- Persist board data in `localStorage`

## High-Level UI

```text
------------------------------------------
| Todo       | In Progress | Done        |
------------------------------------------
| Task 1     | Task 3      | Task 5      |
| Task 2     |             |             |
------------------------------------------
```

## Concepts Tested

| Concept                  | Why it is used                                             |
| ------------------------ | ---------------------------------------------------------- |
| State management         | Store columns and tasks.                                   |
| Component design         | Build reusable board, column, and task-card components.    |
| Event handling           | Handle clicks and drag events.                             |
| Drag and drop            | Move cards between columns.                                |
| Local storage            | Persist board data.                                        |
| Optimistic UI            | Show updates immediately.                                  |
| Performance optimization | Avoid unnecessary renders.                                 |
| Component communication  | Pass data and actions between parent and child components. |

## Step 1: Define the Data Model

The board state is the single source of truth. Store columns and their tasks together:

```javascript
const initialData = [
  {
    id: "todo",
    title: "Todo",
    tasks: [{ id: "1", title: "Learn React" }],
  },
];

const [columns, setColumns] = useState(initialData);
```

When a task moves, update the board state. React then renders the board from that state, keeping the UI and data synchronized.

## Step 2: Design the Components

Use a small component tree:

```text
Board
├── Column
│   ├── TaskCard
│   └── TaskCard
└── Column
    └── TaskCard
```

**Board** is responsible for:

- Global board state
- Drag logic
- Persistence

**Column** is responsible for:

- Rendering its tasks
- Adding a task

**TaskCard** is responsible for:

- Displaying a task
- Editing a task
- Deleting a task

Instead of one large board component, compose the UI from smaller components. This supports reuse, testing, and maintainability.

## Step 3: Add Tasks with Immutable Updates

When adding a task, create updated state instead of mutating the existing columns array.

**Avoid mutation:**

```javascript
columns.push(task);
```

**Use an immutable update:**

```javascript
setColumns((previousColumns) =>
  previousColumns.map((column) =>
    column.id === targetColumnId
      ? { ...column, tasks: [...column.tasks, task] }
      : column,
  ),
);
```

React detects changes through references. Return new objects and arrays for the parts of the state that change.

## Step 4: Move Tasks with Drag and Drop

The basic interaction is:

```text
Source column → Target column
```

The lesson uses these events:

- `dragstart`
- `dragover`
- `drop`

For example, begin tracking the dragged task, allow a column to receive a drop, then update the board state when the task is dropped:

```jsx
onDragStart={() => onDragStart(task.id, column.id)}
onDragOver={(event) => event.preventDefault()}
onDrop={() => handleDrop(column.id)}
```

Moving a task is a state transition: the task is removed from its source column and added to the target column.

## Step 5: Reorder Tasks

Reordering changes the task order within one column.

```text
Task A    →    Task C
Task B         Task A
Task C         Task B
```

The lesson identifies `splice()` or a `reorder(sourceIndex, targetIndex)` operation as ways to express this array change. Interviewers often check whether this logic is written cleanly.

## Step 6: Persist the Board

Save the board when its columns change, and load saved data when the application starts.

```javascript
localStorage.setItem("kanban-board", JSON.stringify(columns));

const saved = localStorage.getItem("kanban-board");
```

In React, the lesson saves after a state change with an effect:

```javascript
useEffect(() => {
  localStorage.setItem("kanban-board", JSON.stringify(columns));
}, [columns]);
```

## Step 7: Use Optimistic UI

When a task moves, update the UI immediately and then save the change. Do not make the user wait for the save before seeing the move.

```text
Move task immediately → Save the change
```

This makes the interaction feel instant. The lesson names Trello, Jira, and Linear as products that use optimistic UI.

## Step 8: Optimize Performance

Consider a board with **500 tasks and 10 columns**. Dragging one card should not require every card to rerender.

The lesson names these tools for reducing renders:

- `React.memo(TaskCard)`
- `useMemo()`
- `useCallback()`

The provided example memoizes the task card:

```javascript
const TaskCard = React.memo(function TaskCard({ task }) {
  return <div>{task.title}</div>;
});
```

## Step 9: Support Accessibility

Support keyboard interaction with:

- Tab
- Arrow keys
- Enter

The transcript also calls out these attributes for an interactive task card:

- `aria-label`
- `role`
- `tabIndex`

Accessibility is an interview bonus point for this exercise.

## Follow-Up 1: Search Tasks

Add a search field that can find tasks such as “Learn React” or “React Hooks.”

The transcript highlights:

| Concept       | Usage                               |
| ------------- | ----------------------------------- |
| Derived state | Filter the tasks shown.             |
| Debouncing    | Avoid filtering on every keystroke. |

## Follow-Up 2: Replace Local Storage with an API

Replace local persistence with backend operations for:

- Create task
- Update task
- Delete task

The concepts listed in the transcript are:

| Concept        | Usage                                        |
| -------------- | -------------------------------------------- |
| REST API       | Create, read, update, and delete operations. |
| Async/await    | Make API calls.                              |
| Error handling | Handle request failures.                     |
| Retry          | Retry failed operations.                     |
| Optimistic UI  | Show changes immediately.                    |

## Follow-Up 3: Support Real-Time Collaboration

Support two users editing the board at the same time.

| Concept               | Usage                                         |
| --------------------- | --------------------------------------------- |
| WebSockets            | Send real-time updates.                       |
| State synchronization | Keep boards consistent.                       |
| Conflict resolution   | Prevent updates from overwriting one another. |

## Reference Implementation Coverage

The transcript's final code demonstrates:

- Three initial columns and sample tasks
- Adding tasks
- Deleting tasks
- Dragging tasks between different columns
- Searching tasks with a debounced value
- Saving and restoring board data through `localStorage`
- Memoizing task cards and handlers

The problem statement also lists **editing tasks** and **reordering tasks within a column**. Those behaviors are discussed in the steps above, but they are not implemented in the transcript's final code sample. Treat them as remaining implementation work when completing the full exercise.
