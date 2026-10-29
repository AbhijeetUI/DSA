# Testing Principles

## Table of Contents

- [Why Testing Principles Matter](#why-testing-principles-matter)
- [Testing Pyramid](#testing-pyramid)
- [1. Test User Behavior, Not Implementation](#1-test-user-behavior-not-implementation)
- [2. Prefer the React Testing Library Approach](#2-prefer-the-react-testing-library-approach)
- [3. Test Critical User Flows](#3-test-critical-user-flows)
- [4. Test Loading States](#4-test-loading-states)
- [5. Test Error States](#5-test-error-states)
- [6. Test Empty States](#6-test-empty-states)
- [7. Mock API Calls](#7-mock-api-calls)
- [8. Keep Tests Independent](#8-keep-tests-independent)
- [9. Follow Arrange-Act-Assert](#9-follow-arrange-act-assert)
- [10. Use Real User Events](#10-use-real-user-events)
- [11. Test Accessibility](#11-test-accessibility)
- [12. Write Reusable Test Utilities](#12-write-reusable-test-utilities)
- [13. Avoid Testing Third-Party Libraries](#13-avoid-testing-third-party-libraries)
- [14. Prefer Integration Tests](#14-prefer-integration-tests)
- [15. Test Async Operations Properly](#15-test-async-operations-properly)
- [16. Test Custom Hooks](#16-test-custom-hooks)
- [17. Test Form Validation](#17-test-form-validation)
- [18. Test State Changes Through the UI](#18-test-state-changes-through-the-ui)
- [19. Use Snapshot Tests Sparingly](#19-use-snapshot-tests-sparingly)
- [20. Use E2E Tests for Critical Flows](#20-use-e2e-tests-for-critical-flows)

---

## Why Testing Principles Matter

| Principle                              | Why it matters                    |
| -------------------------------------- | --------------------------------- |
| Test user behavior, not implementation | More reliable tests.              |
| Write testable components              | Easier maintenance.               |
| Test critical user flows               | Highest return on effort.         |
| Mock external dependencies             | Isolation.                        |
| Keep tests independent                 | Reliability.                      |
| Test accessibility                     | Better user experience.           |
| Prefer integration tests               | Higher confidence.                |
| Use realistic user events              | Better coverage of user behavior. |
| Test loading and error states          | Production readiness.             |
| Avoid over-mocking                     | Prevents false confidence.        |
| Use snapshot testing carefully         | Avoids brittle tests.             |
| Use E2E tests for critical journeys    | Business confidence.              |

## Testing Pyramid

Use more unit tests, fewer integration tests, and the fewest end-to-end tests.

```text
          E2E
           ▲
           │
      Integration
           ▲
           │
       Unit Tests
```

**Recommended distribution:**

- 70% unit tests
- 20% integration tests
- 10% E2E tests

## 1. Test User Behavior, Not Implementation

Test what the user sees and does, not internal component state.

**Avoid:**

```javascript
expect(component.state.open).toBe(true);
```

This checks an implementation detail.

**Prefer:**

```javascript
await user.click(button);
expect(screen.getByText("Modal")).toBeVisible();
```

This checks the visible result of the user's action.

## 2. Prefer the React Testing Library Approach

Test the UI from the user's perspective. Find elements the way a user or assistive technology would identify them.

```javascript
screen.getByRole("button");
screen.getByText("Save");
screen.getByLabelText("Email");
```

Queries by role and label help focus tests on the interface rather than its internal implementation.

## 3. Test Critical User Flows

Focus tests on important user journeys that provide the most value:

- Login
- Signup
- Checkout
- Search
- Payment

## 4. Test Loading States

If a component shows a loading indicator, verify that it appears while data is loading.

```jsx
if (loading) {
  return <Spinner />;
}
```

```javascript
expect(screen.getByRole("progressbar")).toBeInTheDocument();
```

## 5. Test Error States

Verify that the user sees an error message when a request or operation fails.

```jsx
if (error) {
  return <Error />;
}
```

```javascript
expect(screen.getByText("Failed")).toBeVisible();
```

## 6. Test Empty States

When there are no results, check that the empty state is displayed instead of leaving the user with an unexplained blank area.

```javascript
expect(screen.getByText("No Results")).toBeVisible();
```

## 7. Mock API Calls

Real API calls can make tests flaky. Mock external API behavior so the test can focus on the component or flow.

The lesson names these options:

```javascript
jest.mock("./api");
```

Or use **MSW (Mock Service Worker)**, which is recommended for React applications in the lesson.

## 8. Keep Tests Independent

A test should not depend on another test having run first.

Each test should set up, execute, and verify its own behavior:

```text
Setup → Execute → Verify
```

Independent tests are more reliable.

## 9. Follow Arrange-Act-Assert

Organize a test into three clear steps:

1. **Arrange:** Set up the component and test data.
2. **Act:** Perform the user action.
3. **Assert:** Check the expected result.

```javascript
// Arrange
render(<Button />);

// Act
await user.click(button);

// Assert
expect(screen.getByText("Saved")).toBeVisible();
```

This pattern appears in many codebases.

## 10. Use Real User Events

Prefer `userEvent` over `fireEvent` when testing interactions. `userEvent` is intended to simulate user behavior.

**Prefer:**

```javascript
await userEvent.click(button);
```

## 11. Test Accessibility

Check the accessible behavior and names of:

- Buttons
- Inputs
- Labels
- Keyboard navigation
- ARIA attributes

For example, verify that a button is enabled:

```javascript
expect(screen.getByRole("button")).toBeEnabled();
```

## 12. Write Reusable Test Utilities

If tests repeatedly need the same providers and setup, create a reusable utility such as `renderWithProviders()`.

```javascript
renderWithProviders(<Page />);
```

This avoids repeating the same setup everywhere.

## 13. Avoid Testing Third-Party Libraries

Do not test the internals of libraries such as React, TanStack Query, or Material UI. They already have their own tests.

Test your application logic and how your code uses those libraries.

## 14. Prefer Integration Tests

A unit test may check that one button works. An integration test can check a complete flow across the search UI, API behavior, and rendered results.

```text
Search → API → Results render
```

The lesson recommends integration tests for higher confidence.

## 15. Test Async Operations Properly

Wait for asynchronous UI updates before asserting the result.

```javascript
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeVisible();
});
```

Or use a query that waits for the element to appear:

```javascript
expect(await screen.findByText("Loaded")).toBeVisible();
```

This is an important interview topic.

## 16. Test Custom Hooks

The lesson lists these examples of custom hooks to test:

- `useDebounce()`
- `useFetch()`
- `useOnlineStatus()`

Use `renderHook()` to test a hook.

## 17. Test Form Validation

Verify the validation rules that matter to the form:

- Required fields
- Invalid email
- Password rules

For example, submit the form and check that the required-email message appears:

```javascript
await user.click(submitButton);
expect(screen.getByText("Email required")).toBeVisible();
```

## 18. Test State Changes Through the UI

Test state changes by performing the action the user performs, then checking the visible result.

**Avoid:**

```javascript
expect(state.count);
```

**Prefer:**

```javascript
await user.click(button);
expect(screen.getByText("1")).toBeVisible();
```

## 19. Use Snapshot Tests Sparingly

Snapshots can be useful for small presentational components. They are a poor fit for complex components or dynamic UI, where snapshots can become noisy.

## 20. Use E2E Tests for Critical Flows

Use end-to-end tests for important user journeys. The lesson names these tools:

- Playwright
- Cypress

Examples of critical flows include:

- Login
- Checkout
- Search
- Payments
