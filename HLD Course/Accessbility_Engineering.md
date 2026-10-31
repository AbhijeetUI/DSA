# Accessibility Engineering

## Module Goal

Design frontend systems that are usable by people with diverse visual, auditory, motor, cognitive, and situational needs.

Accessibility is not simply adding ARIA, adjusting contrast, passing an automated audit, or meeting a checklist. It is an end-to-end property of the experience, including semantics, keyboard interaction, focus, dynamic updates, reusable components, workflows, and testing.

## Table of Contents

- [1. Accessibility Fundamentals](#1-accessibility-fundamentals)
- [2. Semantic HTML](#2-semantic-html)
- [3. Keyboard Accessibility and Focus](#3-keyboard-accessibility-and-focus)
- [4. Screen Readers and Dynamic Content](#4-screen-readers-and-dynamic-content)
- [5. ARIA](#5-aria)
- [6. Color and Visual Accessibility](#6-color-and-visual-accessibility)
- [7. Accessible Components](#7-accessible-components)
- [8. Accessibility Testing](#8-accessibility-testing)
- [9. Design Exercise: Modal and Autocomplete](#9-design-exercise-modal-and-autocomplete)
- [10. Architecture Principles and Trade-Offs](#10-architecture-principles-and-trade-offs)
- [11. Module Outcomes](#11-module-outcomes)

---

## 1. Accessibility Fundamentals

Accessibility engineering helps people perceive, understand, navigate, and operate software across different abilities and assistive technologies.

Users may interact through a mouse, keyboard, touch screen, screen reader, switch device, voice control, screen magnifier, high-contrast mode, reduced-motion preference, browser zoom, or custom stylesheet. Temporary and situational constraints matter too: a broken arm, bright sunlight, a noisy train, one-handed mobile use, or a slow network can change how an interface is usable.

### 1.1 Inclusive Design

Ask who might be excluded by an interaction and define an interaction contract that works across input methods.

For example, a quantity control should expose meaningful names such as “Decrease quantity of headphones,” communicate the current quantity, provide usable touch targets, support keyboard operation, and avoid using color alone to convey disabled state.

The solution is not automatically “add ARIA.” First choose an interaction model that can work consistently for all users.

### 1.2 Accessibility as a System Property

A component may be individually accessible while the workflow fails. In a single-page application, a search form may work correctly, but after results load focus can remain on the old control and no status may be announced.

Evaluate accessibility at three levels:

- **Component:** Can the individual control be operated and understood?
- **Workflow:** Can the user complete the task?
- **Application:** Do routing, loading, errors, and dynamic updates preserve context?

### 1.3 WCAG and POUR

WCAG provides a structured framework for web accessibility. A common production target is WCAG AA, selected according to product requirements and applicable obligations.

Its four principles are:

| Principle | Meaning |
| --------- | ------- |
| Perceivable | Information and controls can be perceived through available senses |
| Operable | Users can navigate and operate controls |
| Understandable | Content and interaction behavior are clear and predictable |
| Robust | Content works with browsers and assistive technologies |

Use the framework as a foundation, not a substitute for testing the actual user journey.

## 2. Semantic HTML

Native HTML elements provide built-in roles, states, keyboard behavior, and browser support. Prefer semantic elements before recreating their behavior with generic containers.

Use:

- `<button>` for actions.
- `<a>` for navigation.
- `<label>` and form elements for input.
- Headings for document structure.
- Landmarks such as `<header>`, `<nav>`, `<main>`, and `<footer>` for page regions.

### 2.1 Landmarks and Headings

Landmarks help users navigate major regions. A coherent heading hierarchy creates a navigable content outline.

Design-system components should avoid hardcoding a semantic heading level that is wrong in another context. Separate visual size from semantic level or allow contextual composition so a large visual heading can still have the appropriate document level.

### 2.2 Forms

Every control needs a meaningful accessible label. Placeholder text alone is not a robust replacement for a label.

Connect validation feedback to the field and expose its invalid state. Error messages should be clear, and validation timing should avoid excessive interruption:

- Before a field has been visited, avoid aggressive error announcements.
- Validate on blur when useful.
- On submit, identify all relevant errors.
- During correction, revalidate in a way that supports recovery without noisy repetition.

### 2.3 Native Controls vs. Custom Controls

Prefer native buttons, inputs, selects, textareas, and disclosure elements when they meet product needs. Replacing a native select with a custom widget means taking responsibility for keyboard behavior, focus, option semantics, selection state, type-ahead, Escape behavior, and assistive-technology support.

Use a custom combobox when search, asynchronous results, or richer options justify the additional accessibility and maintenance work.

## 3. Keyboard Accessibility and Focus

Every essential workflow should be operable without a mouse. Common keys include Tab, Shift+Tab, Enter, Space, Escape, arrow keys, Home, End, and Page Up/Down; the expected contract depends on the component.

### 3.1 Tab Order and DOM Order

Natural tab order should generally follow DOM order. Avoid positive `tabindex` values, which create fragile custom navigation sequences. Use `tabindex="0"` to include a custom focusable element in normal order and `tabindex="-1"` when an element should be focusable programmatically but omitted from sequential tab navigation.

CSS visual reordering can diverge from DOM order. Keep visual and logical order aligned so sighted keyboard users do not encounter focus in an unexpected location.

### 3.2 Focus Management

Define focus behavior for modals, route changes, validation errors, removed content, opened menus, and autocomplete results.

After deleting an item, focus may move to the next item, previous item, list heading, or a confirmation action depending on the workflow. Treat that behavior as part of the component contract.

### 3.3 Single-Page Application Navigation

SPA route changes do not naturally reset focus like a full document navigation. A route transition may need to update the document title and move focus to the main heading or region. Focus movement must be intentional, predictable, and tested; unexpected focus changes can disrupt a user's current context.

### 3.4 Focus Traps and Skip Links

Modal dialogs commonly contain focus while open:

```text
Open modal → move focus into modal → keep Tab within modal
  → close modal → restore focus to trigger
```

Background content should not remain interactable behind a modal. Large applications should provide a visible-on-focus “Skip to main content” link so keyboard users can bypass repeated navigation.

## 4. Screen Readers and Dynamic Content

Screen readers interact with an accessibility representation derived from the DOM, native semantics, ARIA, and browser accessibility APIs—not from pixels alone.

### 4.1 Accessible Names

Interactive controls need meaningful accessible names. Prefer visible labels and native semantics; provide a programmatic name when visible text is not available. Naming should describe the action and context, not merely the control type.

### 4.2 Dynamic Updates

Modern applications update content without full page reloads. Users may need a concise announcement when:

- Search results load.
- A form submission succeeds or fails.
- A cart count changes.
- A background save completes.
- A route transition changes the primary content.

Not every DOM update should be announced. Excessive announcements can interrupt users and obscure important information.

### 4.3 Announcement Strategy

Use live regions selectively and choose politeness based on urgency:

- `polite` for status updates that can wait for a pause.
- `assertive` only for time-sensitive information that must interrupt.

Debounce or coalesce rapid updates such as autocomplete result counts. Announce stable, useful information rather than every intermediate state.

## 5. ARIA

ARIA supplements HTML semantics when native elements do not express a required widget role or state. It does not automatically add keyboard behavior or make an incorrect interaction model accessible.

### 5.1 First Rule of ARIA

Prefer native HTML when it already provides the necessary semantics and behavior. A custom role without the corresponding keyboard and state behavior can be worse than using a generic native element correctly.

### 5.2 Roles, States, and Properties

- **Roles** describe what an element is, such as a dialog or tab.
- **States** describe changing conditions, such as expanded, selected, or invalid.
- **Properties** provide relationships or additional meaning, such as a label or description.

Keep ARIA values synchronized with actual UI state. For example, `aria-expanded` should match whether a controlled region is open.

### 5.3 Live Regions

Use live regions for meaningful asynchronous updates such as form status or search results. Avoid creating a separate competing live region for each component; a shared announcement strategy can reduce duplicated and conflicting messages.

## 6. Color and Visual Accessibility

Do not communicate meaning using color alone. Pair color with text, icons, patterns, or labels. Charts can use line styles, markers, direct annotations, and accessible data alternatives in addition to color.

### 6.1 Focus Visibility

Never remove the keyboard focus indicator without providing a clear replacement. A visible focus style helps users understand where keyboard input will go.

### 6.2 Zoom and Reflow

Test at increased zoom and small viewports. Content should remain available without unnecessary horizontal scrolling, overlap, disappearing controls, or dialogs that exceed the viewport.

Responsive design is part of accessibility engineering. Consider large text, high zoom, reduced motion, and constrained screens when designing components and tokens.

### 6.3 Design Tokens

Design tokens can centralize accessible color combinations, focus indicators, spacing, and typography. This makes accessibility a shared design-system capability, although token compliance still needs validation in actual compositions and states.

## 7. Accessible Components

Complex components should be designed as interaction systems with explicit state and keyboard contracts.

### 7.1 Modal

An accessible modal typically needs:

- A meaningful name and, where useful, description.
- Dialog semantics and correct modal behavior.
- Intentional initial focus.
- Focus containment and background isolation.
- Escape and close behavior appropriate to the workflow.
- Focus restoration to the trigger when it still exists.

Initial focus depends on context. For a destructive confirmation, focusing Cancel may reduce accidental actions; a form dialog may focus its first meaningful field. Keep generic modal mechanics reusable while letting product-specific policies define content and focus choices.

### 7.2 Menus, Selects, and Popovers

“Dropdown” can mean an action menu, navigation menu, select, combobox, or popover. These have different semantics and keyboard contracts. Use distinct primitives rather than one universal dropdown component.

### 7.3 Tabs

Tabs need a tab list, selected state, associated panels, and a keyboard model. Arrow keys commonly move among tabs, with Home/End optionally moving to the first/last tab.

Choose activation behavior based on loading cost:

- **Automatic activation:** Focus movement also opens the panel; suitable when panels are already available and switching is immediate.
- **Manual activation:** Focus moves first; Enter or Space opens the panel; useful when activation triggers expensive work or network requests.

### 7.4 Autocomplete

Autocomplete combines asynchronous search, keyboard navigation, loading and empty states, selection, and announcements. Model it as an explicit state machine, for example:

```text
Idle → Debouncing → Loading
                       ├─ Results
                       ├─ Empty
                       └─ Error
```

Track query, results, active option, selected value, open state, and request identity. Cancel stale requests or ignore responses from older queries so late results cannot replace newer ones.

Keep focus behavior and active-option representation predictable. Announce stable result counts without repeatedly interrupting the user.

### 7.5 Data Grids

Data grids can provide powerful interactions but require deliberate semantics, keyboard movement, focus management, sorting announcements, selection state, and accessibility behavior for virtualization. Use a semantic table when the interaction model is tabular reading; use a grid pattern only when spreadsheet-like navigation is truly needed.

## 8. Accessibility Testing

Accessibility testing needs multiple layers. Automated tools can detect some structural issues but cannot establish that a workflow is understandable and usable.

### 8.1 Automated Testing

Automated checks can find missing names, invalid ARIA, some contrast problems, duplicate identifiers, and role issues. Run them during development and in CI, but do not treat a clean automated report as proof of accessibility.

### 8.2 Keyboard Testing

Manually verify:

- All essential actions are reachable and operable.
- Focus order is logical and visible.
- Modals contain focus and restore it appropriately.
- Menus and composite widgets follow their documented key contracts.
- Users can recover from errors and complete critical journeys.

### 8.3 Screen-Reader Testing

Test representative combinations of browsers and screen readers that match the audience and platform support. Verify names, roles, state, reading order, dynamic announcements, and workflow completion.

### 8.4 CI/CD Strategy

A practical approach combines automated checks on pull requests, component tests for primitives, keyboard testing of critical journeys, periodic screen-reader testing, and production monitoring or user feedback. Automated coverage should complement—not replace—manual testing.

## 9. Design Exercise: Modal and Autocomplete

### 9.1 Accessible Modal

Design a reusable modal supporting keyboard and screen-reader users, dynamic content, destructive confirmation, and small screens.

Define the lifecycle:

```text
Capture trigger → Render modal → Make background unavailable
  → Move focus into modal → Contain focus
  → Close → Restore background and focus
```

Decisions include initial focus, Escape behavior, backdrop behavior, nested dialogs, scroll locking, route changes, mobile layout, and what happens if the original trigger is removed. Reusable primitives should provide semantics and focus mechanics; product-level components should define contextual focus policy and business actions.

### 9.2 Accessible Autocomplete

For a large asynchronous dataset, define query and result states, request cancellation, keyboard navigation, focus behavior, loading and error announcements, and selection rules.

A common contract:

- Arrow Down/Up moves through options.
- Enter selects the active option.
- Escape closes the list.
- Tab preserves predictable form navigation.
- Home/End behavior is defined if supported.

Consider whether focus remains on the input, whether the first result is auto-highlighted, and how virtualization affects assistive-technology access.

## 10. Architecture Principles and Trade-Offs

| Decision | Option A | Option B | Trade-off |
| -------- | -------- | -------- | --------- |
| Control implementation | Native control | Custom widget | Robust built-in behavior vs. flexibility and added responsibility |
| Validation timing | Every keystroke | Blur or submit | Immediate feedback vs. interruption and announcement noise |
| Tab activation | Automatic | Manual | Convenience vs. avoiding expensive panel loading |
| Feed loading | Infinite scroll | Explicit load more | Continuous engagement vs. user control and navigation |
| Dynamic announcements | Announce every change | Announce selectively | Awareness vs. noise |
| Accessibility ownership | Centralized primitives | Feature-specific implementation | Consistency vs. local expertise and scaling |
| Testing | Automated checks | Manual assistive-technology testing | Speed and breadth vs. real usability |
| Data grid | Native table | Custom grid | Reading semantics vs. advanced interaction |
| Modal focus | Generic default | Context-aware policy | Simplicity vs. workflow correctness |
| Autocomplete | Full result DOM | Virtualized results | Simpler accessibility vs. large-data performance |

A scalable architecture builds accessibility from standards and semantic HTML into design tokens, accessible primitives, complex components, workflow contracts, layered testing, and production feedback.

## 11. Module Outcomes

After this module, learners should be able to:

- Explain accessibility as a frontend architecture concern.
- Apply WCAG and POUR principles to product decisions.
- Design semantic page structures and accessible forms.
- Define keyboard interaction and focus contracts.
- Reason about SPA route changes and dynamic announcements.
- Use ARIA to supplement native semantics appropriately.
- Build and test complex accessible components.
- Identify accessibility risks in virtualization and custom controls.
- Establish automated, keyboard, and screen-reader testing.
- Discuss accessibility trade-offs in frontend system-design interviews.

The interview-level question is not only whether the UI renders correctly. Ask whether users with different input methods, perception models, and assistive technologies can understand the current state, operate the workflow, recover from errors, and maintain context as the application changes.
