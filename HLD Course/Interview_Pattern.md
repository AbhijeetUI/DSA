# Frontend System Design Interview Pattern

## Table of Contents

- [R-A-D-I-O Interview Framework](#r-a-d-i-o-interview-framework)
- [End-to-End Interview Flow](#end-to-end-interview-flow)
- [Discussion Checklist](#discussion-checklist)
- [End-to-End Case Studies](#end-to-end-case-studies)

---

## R-A-D-I-O Interview Framework

Use **R-A-D-I-O** as a compact structure for organizing a frontend system design interview:

| Step | Focus | What to cover |
| ---- | ----- | ------------- |
| **R** | Requirements | Clarify functional and non-functional requirements, scale, and constraints. |
| **A** | Architecture | Propose the high-level architecture and identify its major components. |
| **D** | Data model | Define client-side entities, state ownership, normalization, and data structures. |
| **I** | Interface definition | Design APIs and communication interfaces between the frontend and other services. |
| **O** | Optimization and deep dive | Address performance, security, accessibility, resilience, implementation details, and trade-offs. |

## End-to-End Interview Flow

Work through the design in a deliberate order. Explain assumptions and decisions as you go, and adapt the depth to the time available.

1. Clarify requirements.
2. Estimate scale.
3. Identify the critical user journey.
4. Define the high-level architecture.
5. Choose the rendering strategy.
6. Design APIs and communication.
7. Design state and caching.
8. Address performance.
9. Address security.
10. Handle failures and resilience.
11. Include accessibility.
12. Add observability.
13. Discuss trade-offs.
14. Explain how the design can evolve.

## Discussion Checklist

### 1. Requirement Clarification

- Functional requirements
- Non-functional requirements
- Scale
- Constraints

### 2. Back-of-the-Envelope Estimation

- Daily active users (DAU)
- Concurrent users
- Request volume
- Payload size
- Bandwidth

### 3. High-Level Architecture

- Client
- CDN
- API gateway
- Backend for Frontend (BFF)
- Backend services and storage

### 4. Component Architecture

- Page boundaries
- Feature boundaries
- Shared components

### 5. Data Model

- Client-side entities
- Normalization
- Cache structure

### 6. API Design

- REST or GraphQL
- Streaming and real-time communication

### 7. State Management

- Server state
- Client state
- URL state

### 8. Performance

- Rendering
- Loading
- Caching
- Bundles

### 9. Security

- Authentication
- Authorization
- Browser threats

### 10. Accessibility

- Consider accessibility throughout the interaction and component design.

### 11. Observability

- Explain how the system's behavior and user experience will be monitored.

### 12. Trade-offs

- Alternatives
- Constraints
- Evolution path

## End-to-End Case Studies

Use these as capstone exercises. For each one, clarify requirements, sketch the architecture, and then explore the concerns listed.

### Case Study 1 — Autocomplete / Typeahead

- Debouncing
- Caching
- Ranking
- Race conditions
- Accessibility

### Case Study 2 — Infinite Feed

- Cursor pagination
- Virtualization
- Prefetching
- Optimistic updates

### Case Study 3 — Chat Application

- WebSockets
- Message ordering
- Offline support
- Reconnection

### Case Study 4 — Video Streaming Platform

- Adaptive streaming
- CDN
- Player architecture
- Analytics

### Case Study 5 — E-commerce Platform

- Rendering strategy
- Cart state
- Search
- Checkout
- Performance

### Case Study 6 — Collaborative Editor

- Real-time communication
- Conflict resolution
- Presence
- Offline editing

### Case Study 7 — Analytics Dashboard

- Large datasets
- Visualization
- Polling and streaming
- Performance

### Case Study 8 — File Upload System

- Chunking
- Resumable uploads
- Progress
- Retry

### Case Study 9 — Notification System

- Push notifications
- WebSockets and SSE
- Preferences

### Case Study 10 — Multi-Tenant SaaS Frontend

- Tenant isolation
- Theming
- Permissions
- Configuration

### Case Study 11 — Payment Checkout

- Security
- Idempotency
- Failure recovery
- State machine

### Case Study 12 — Google Docs-Like Collaborative Application

- Real-time synchronization
- Optimistic UI
- Conflict resolution
- Offline mode
