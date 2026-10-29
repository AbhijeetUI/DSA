# Machine Coding (LLD)

## Getting Started & Course Overview

This course covers the design patterns, data-handling strategies, and architectural decisions needed to build scalable, testable, and high-performance React applications.

## Course Guide Index

Use this index to navigate the topic guides in this folder. Add new guides here as you create them so this file remains the course table of contents.

|   # | Guide                                                                           | Focus                                                                                     |
| --: | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
|  01 | [Component Design](./ComponentDesign.md)                                        | Reusable components, composition, component APIs, and UI/logic separation                 |
|  02 | [State Management](./StateManagement.md)                                        | State ownership, derived and normalized state, client/server state, and workflows         |
|  03 | [Event Handling](./EventHandling.md)                                            | Event handlers, propagation, debounce/throttle, accessibility, and async events           |
|  04 | [Form Handling Principles](./Form_Handling_Principles.md)                       | Controlled forms, validation, async submission, accessibility, and multi-step workflows   |
|  05 | [API Integration Principles](./API_Integration_Principles.md)                   | API architecture, server state, caching, cancellation, and real-time updates              |
|  06 | [Async Programming Principles](./Async_Programming_Principles.md)               | Async/await, promises, race conditions, retries, and the event loop                       |
|  07 | [Search Optimization Principles](./Search_Optimization_Principles.md)           | Debouncing, request cancellation, caching, pagination, and server-side search             |
|  08 | [Performance Optimization Principles](./Performance_Optimization_Principles.md) | Memoization, code splitting, virtualization, images, caching, and Web Workers             |
|  09 | [Recursive Rendering Principles](./Recursive_Rendering_Principles.md)           | Tree rendering, expansion state, lazy loading, search, and large trees                    |
|  10 | [Data Rendering Principles](./Data_Rendering_Principles.md)                     | Stable keys, rendering states, derived data, pagination, and virtualization               |
|  11 | [Testing Principles](./Testing_Principles.md)                                   | User-focused tests, integration, accessibility, async behavior, and E2E flows             |
|  12 | [Machine Coding: Kanban Board](./Practice_Problem.md)                           | Board data, component design, task operations, drag and drop, persistence, and follow-ups |

## Core Overview

- **Advanced Component Architecture:** Go beyond simple props with compound components, polymorphic APIs, and headless components. Extract business logic into custom hooks and separate UI from logic.
- **Scalable State & Form Management:** Distinguish client state from server state, normalize complex state, handle asynchronous workflows, and build dynamic, accessible forms with schema validation.
- **High-Performance Data Handling:** Address large datasets with infinite scrolling, pagination, and virtualization. Use recursive rendering for structures such as file explorers and nested comments, and optimize search with debouncing and caching.
- **API Integration & Async Orchestration:** Design robust data layers with tools such as TanStack Query. Prevent race conditions with `AbortController`, implement optimistic UI updates, and handle real-time data efficiently.
- **Performance Engineering & Testing:** Prepare applications for production with bundle optimization, code splitting, virtualization, behavioral testing, and resilient test suites.

## Core Benefits

- **Architectural Justification (the “Senior” Edge):** Learn to explain design trade-offs, such as choosing Context over Redux or controlled over uncontrolled components.
- **AI-Enhanced Coding Workflow:** Develop an architectural blueprint for prompting AI to produce modular, testable code, and learn to review its output for bottlenecks and anti-patterns.
- **Production-Grade Stability:** Build robust applications with error boundaries, cleanup strategies that prevent memory leaks, and accessibility-first design.
- **Interview-Ready Patterns:** Develop a toolkit of machine-coding solutions for virtualized lists, recursive file explorers, and autocompletes that handle race conditions.
- **Reduced Cognitive Load:** Make code easier to review and maintain by separating UI from logic and normalizing state.

## Who Is This Course For?

- **Senior developers** preparing for high-level system-design coding rounds (LLD/machine coding).
- **Mid-level engineers** looking to transition to senior roles by mastering architectural patterns.
- **Team leads** who want to standardize coding practices within their teams.

## Is This Course for You?

This course may be a good fit if:

- You want to move beyond tightly coupled code, prop drilling, and unmanageable state.
- You can build features but want more confidence explaining architectural choices and trade-offs.
- You want to tackle complex requirements such as recursive trees, virtualization, custom event handling, and resilient asynchronous workflows.
