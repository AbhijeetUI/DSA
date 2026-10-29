# Form Handling Principles

## Table of Contents

- [Module Goal](#module-goal)
- [Learning Outcomes](#learning-outcomes)
- [Suggested Time Split](#suggested-time-split)
- [Why Form Handling Matters](#why-form-handling-matters)
- [1. Prefer Controlled Components](#1-prefer-controlled-components)
- [2. Keep Form State Together](#2-keep-form-state-together)
- [3. Separate Validation Logic](#3-separate-validation-logic)
- [4. Validate Before Submit](#4-validate-before-submit)
- [5. Show Field-Level Errors](#5-show-field-level-errors)
- [6. Disable Submit During a Request](#6-disable-submit-during-a-request)
- [7. Handle Async Submission Properly](#7-handle-async-submission-properly)
- [8. Use Reusable Input Components](#8-use-reusable-input-components)
- [9. Support Accessibility](#9-support-accessibility)
- [10. Avoid Unnecessary Validation](#10-avoid-unnecessary-validation)
- [11. Preserve User Input](#11-preserve-user-input)
- [12. Use Schema Validation](#12-use-schema-validation)
- [13. Use a Multi-Step Form Pattern](#13-use-a-multi-step-form-pattern)
- [14. Avoid Duplicate State](#14-avoid-duplicate-state)
- [15. Use Form Libraries for Large Forms](#15-use-form-libraries-for-large-forms)
- [Hands-on Problem: Multi-Step Checkout Form](#hands-on-problem-multi-step-checkout-form)

---

## Module Goal

Learn to build forms that are **predictable, reusable, accessible, and reliable**, from simple inputs to complex multi-step workflows.

## Learning Outcomes

After this lesson, you should be able to:

- Build controlled and reusable form components.
- Organize and validate form state effectively.
- Handle asynchronous submission and prevent duplicate requests.
- Show accessible, field-level errors.
- Use schema validation and form libraries appropriately.
- Design multi-step forms and preserve user input.

## Suggested Time Split

| Topic                                   |        Time |
| --------------------------------------- | ----------: |
| Controlled components and form state    |      25 min |
| Validation and error handling           |      25 min |
| Async submission and user experience    |      20 min |
| Reusable and accessible form components |      20 min |
| Schema validation and form libraries    |      15 min |
| Multi-step forms and persistence        |      15 min |
| **Total**                               | **120 min** |

## Why Form Handling Matters

| Principle                  | Why it matters                                                     |
| -------------------------- | ------------------------------------------------------------------ |
| Controlled components      | Provide a single source of truth.                                  |
| Clear validation           | Improve the user experience.                                       |
| Organized form state       | Make forms easier to maintain.                                     |
| Separate validation logic  | Make validation reusable and testable.                             |
| Validate before submission | Protect data integrity and prevent invalid submissions.            |
| User-friendly errors       | Help people understand what needs to be fixed.                     |
| Reusable form components   | Improve consistency and scalability.                               |
| Correct async handling     | Prevent duplicate requests and show clear loading or error states. |
| Preserve form state        | Avoid losing user input in longer workflows.                       |
| Accessibility support      | Make forms usable with assistive technology.                       |
| Debounced validation       | Avoid unnecessary work during frequent input changes.              |
| Multi-step forms           | Support complex workflows.                                         |

## 1. Prefer Controlled Components

A controlled input gets its value from React state. When the user types, the change handler updates that state. This keeps the form value predictable and makes validation and error handling easier.

**Avoid:** Reading values manually from an input ref for an ordinary controlled field can make form values harder to manage.

```jsx
const [email, setEmail] = useState("");

<input value={email} onChange={(event) => setEmail(event.target.value)} />;
```

**Key benefits:** validation, error handling, and predictable state.

## 2. Keep Form State Together

For a form with several related fields, keep the values together in one form object. Managing a separate state variable for every field can become difficult as the form grows.

**Avoid:**

```jsx
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
```

**Prefer:**

```jsx
const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
});
```

## 3. Separate Validation Logic

Keep validation in a separate function instead of placing all validation rules inside the submit handler. Separate logic is easier to reuse and test.

**Avoid:** Putting every field check directly inside `handleSubmit`.

**Prefer:**

```javascript
function validateForm(data) {
  const errors = {};

  if (!data.email.includes("@")) {
    errors.email = "Invalid email";
  }

  return errors;
}
```

The function returns an errors object. For example, an invalid email produces an `email` error.

## 4. Validate Before Submit

Validate the form before sending it. If validation finds errors, show them and stop the submission.

```javascript
const errors = validateForm(data);

if (Object.keys(errors).length > 0) {
  return;
}

// Continue with submission only when there are no validation errors.
```

The flow is:

**Validate → Show errors if needed → Submit**

Sending first and showing validation errors afterward creates a poor user experience.

## 5. Show Field-Level Errors

Show an error beside the field it belongs to. A general message such as “Something went wrong” does not tell the user which value needs attention.

```jsx
<input type="email" />;

{
  errors.email && <p>{errors.email}</p>;
}
```

A clear field-level message makes the problem easier to find and fix.

## 6. Disable Submit During a Request

A user may click Submit several times while a request is still running. Disable the button during submission to prevent duplicate requests.

```jsx
<button disabled={isSubmitting}>Submit</button>
```

The button's disabled state should follow the submission state.

## 7. Handle Async Submission Properly

Show a loading state while the request is running, handle success and failure, and clear the loading state when the request finishes.

```javascript
async function handleSubmit() {
  try {
    setLoading(true);
    await saveUser();
    showSuccess();
  } catch (error) {
    showError();
  } finally {
    setLoading(false);
  }
}
```

The `finally` block runs whether the request succeeds or fails, so the loading state is cleared in either case.

## 8. Use Reusable Input Components

If the same input patterns appear throughout a form or application, use a reusable component. This reduces repetition and helps keep fields consistent.

**Repeated fields:**

```jsx
<input />
<input />
<input />
```

**Reusable field:**

```jsx
<Input label="Email" error={errors.email} />
```

Reusable inputs support consistency and reuse.

## 9. Support Accessibility

Give each form field a label connected to its input. Use `aria-invalid` to expose an invalid field state.

```jsx
<label htmlFor="email">Email</label>
<input
  id="email"
  aria-invalid={Boolean(errors.email)}
/>
```

Labels and error information help screen-reader users understand the form.

## 10. Avoid Unnecessary Validation

Validating on every keystroke can run validation more often than needed. For checks such as email validation or username availability, debounce the validation so it runs after a short pause in typing.

```javascript
const debouncedValue = useDebounce(value, 300);
```

Use debounced validation when frequent input changes would otherwise trigger repeated validation work.

## 11. Preserve User Input

Losing form values after a refresh is a poor experience, especially in checkout and multi-step forms. The lesson identifies `localStorage` and `sessionStorage` as ways to preserve progress.

```text
Refresh
  ↓
Restore saved form progress
```

Use persistence where the workflow needs users to return to the values they already entered.

## 12. Use Schema Validation

For large forms, a schema can keep validation rules together. The lesson uses Zod as an example.

```javascript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

A schema centralizes validation and makes those rules reusable.

## 13. Use a Multi-Step Form Pattern

A multi-step form divides a complex workflow into smaller parts. Keep track of the current step and the form data so the user's progress can be preserved.

```text
Step 1: Personal information
        ↓
Step 2: Address
        ↓
Step 3: Payment
```

The form needs to track:

- `currentStep`
- `formData`
- Progress through the workflow

## 14. Avoid Duplicate State

Do not store a value that can be calculated from existing state. Duplicating it creates another value that can become out of sync.

**Avoid:** Keeping both `email` and a separate `isEmailValid` state value.

**Prefer:** Derive validity from the current email value.

```javascript
const isEmailValid = validateEmail(email);
```

## 15. Use Form Libraries for Large Forms

Choose the form approach based on the form's size:

- **Small forms:** `useState` can be enough.
- **Medium or large forms:** React Hook Form can reduce boilerplate and improve form performance.

A form library is useful when it makes a larger form easier to manage; it is not required for every small form.

## Hands-on Problem: Multi-Step Checkout Form

Build a checkout flow with:

- Personal information
- Address details
- Payment information
- Field-level validation
- Asynchronous order submission
- Loading and error states
- Prevention of duplicate submissions
- Keyboard and screen-reader accessibility
- Progress persistence

### Desired Outcome

Build a production-ready multi-step form with reusable form components, centralized validation, derived state, and appropriate state management.

The flow should cover:

**Form State → Validation → Error Handling → Async Submission → Success / Failure**
