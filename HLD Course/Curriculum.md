# Frontend System Design (HLD) — Curriculum

## Table of Contents

1. [Web, Networking & API Foundations](#module-1-web-networking-and-api-foundations)
2. [Client-Server Communication Techniques](#module-2-client-server-communication-techniques)
3. [Frontend Security](#module-3-frontend-security)
4. [Frontend Architecture Patterns](#module-4-frontend-architecture-patterns)
5. [Rendering Architecture](#module-5-rendering-architecture)
6. [Frontend Performance Engineering](#module-6-frontend-performance-engineering)
7. [Offline-First & Progressive Web Apps](#module-7-offline-first-and-progressive-web-apps)
8. [Frontend Testing Strategy](#module-8-frontend-testing-strategy)
9. [Logging, Monitoring & Observability](#module-9-logging-monitoring-and-observability)
10. [Frontend Data, Storage & Caching](#module-10-frontend-data-storage-and-caching)
11. [Accessibility Engineering](#module-11-accessibility-engineering)
12. [Design Systems & Cross-Browser Consistency](#module-12-design-systems-and-cross-browser-consistency)
13. [Scalability, Reliability & Resilience](#module-13-scalability-reliability-and-resilience)
14. [Frontend Infrastructure & Delivery Architecture](#module-14-frontend-infrastructure-and-delivery-architecture)

---

## Module 1: Web, Networking and API Foundations

**Goal:** Understand how frontend applications communicate with browsers, networks, servers, APIs, CDNs, and backend systems.

### 1.1 How the Web Works

- What happens when you enter a URL?
- Request path: browser → DNS → CDN → load balancer → server → database
- DNS resolution, TCP connections, and TLS handshakes
- HTTP request/response lifecycle and browser rendering lifecycle
- Origin and cross-origin concepts
- Reverse proxies and gateways

### 1.2 Communication Protocols

- TCP vs. UDP
- HTTP vs. HTTPS
- HTTP/1.1, HTTP/2, and HTTP/3
- QUIC and TLS
- Choosing the right protocol

### 1.3 REST APIs

- Resources, endpoints, and the request/response model
- Request and response headers
- HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`
- Status codes, query and path parameters, and request bodies
- Pagination: offset, cursor, and keyset
- Filtering, sorting, and API versioning
- Idempotency, error contracts, retry semantics, and rate limiting
- Advanced: comparing HTTP versions, REST best practices, over-fetching, under-fetching, API aggregation, and the Backend for Frontend (BFF) pattern
- **Hands-on:** Build and consume a production-style REST API

### 1.4 GraphQL

- Overview, use cases, and why GraphQL
- Schemas, types, queries, mutations, subscriptions, resolvers, fragments, and variables
- Error handling and pagination
- Advanced: N+1 problem, batching, DataLoader, query complexity, validation, authorization, security, persisted queries, and caching challenges
- **Hands-on:** Build a GraphQL-powered frontend

### 1.5 gRPC

- RPC fundamentals, service definitions, and RPC methods
- Protocol Buffers, interface definition language (IDL), and code generation
- Unary, server-streaming, client-streaming, and bidirectional-streaming RPCs
- Browser limitations and gRPC-Web
- **Hands-on:** Explore frontend communication using gRPC-Web

### 1.6 API Architecture for Frontend

- Direct API consumption, API gateways, and Backend for Frontend
- API composition and aggregation layers
- Edge APIs and serverless APIs
- **Design exercise:** Design the API layer for an e-commerce application

## Module 2: Client-Server Communication Techniques

**Goal:** Choose the right communication model based on latency, scale, consistency, and product requirements.

### 2.1 Communication Model Overview

- Request-response, polling, streaming, and push-based communication
- Event-driven communication and peer-to-peer communication

### 2.2 Short Polling

- Architecture and request lifecycle
- Polling intervals, advantages, and limitations
- Server load and use cases

### 2.3 Long Polling

- Architecture and connection lifecycle
- Timeout handling and reconnection
- Scalability challenges

### 2.4 WebSockets

- Connection lifecycle and full-duplex communication
- Persistent connections, heartbeats, and reconnection strategies
- Message ordering and connection recovery
- Scaling WebSockets with sticky sessions and Pub/Sub integration

### 2.5 Server-Sent Events

- One-way streaming with `EventSource`
- Automatic reconnection and event IDs
- SSE vs. WebSockets

### 2.6 Webhooks

- Event-driven callbacks and delivery semantics
- Retry strategies, idempotency, and signature verification

### 2.7 Advanced: WebRTC

- Peer-to-peer communication and signaling
- ICE, STUN, and TURN
- Media streams and data channels

### 2.8 Decision Framework

- Polling vs. long polling
- SSE vs. WebSockets
- WebSockets vs. WebRTC
- Webhooks vs. polling
- **Design exercises:** Live cricket scores, chat, notifications, collaborative editing, and ride tracking

## Module 3: Frontend Security

**Goal:** Design secure frontend architectures and understand browser-side attack surfaces.

### 3.1 Security Fundamentals

- Threat modeling, attack surfaces, and trust boundaries
- Defense in depth and a zero-trust mindset

### 3.2 Cross-Site Scripting (XSS)

- Stored, reflected, and DOM-based XSS
- Prevention through escaping, sanitization, and Content Security Policy (CSP)

### 3.3 Cross-Site Request Forgery (CSRF)

- Attack mechanism
- CSRF tokens, `SameSite` cookies, and origin validation

### 3.4 Clickjacking & IFrame Protection

- `X-Frame-Options`, CSP `frame-ancestors`, and sandbox attributes

### 3.5 Authentication & Authorization

- Sessions, cookies, JWT, OAuth 2.0, OpenID Connect, and SSO
- RBAC and ABAC
- Token lifecycle, refresh tokens, and token rotation
- Frontend route guards vs. actual authorization

### 3.6 Security Headers

- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### 3.7 Client Storage Security

- Risks of `localStorage`, `sessionStorage`, and IndexedDB
- Cookie security and secure token storage

### 3.8 Secure Communication

- HTTPS, TLS, mixed content, and certificate validation

### 3.9 Dependency Security

- Supply-chain attacks and dependency confusion
- Vulnerability scanning, lock files, and package integrity

### 3.10 Input Validation & Sanitization

- Client-side and server-side validation
- HTML sanitization and URL validation

### 3.11 Server-Side Request Forgery (SSRF)

- Why frontend engineers should understand SSRF
- Proxy endpoints, image fetchers, and server-side rendering risks

### 3.12 Server-Side JavaScript Injection

- SSR and Node.js attack surfaces
- Risks of dynamic evaluation

### 3.13 Cross-Origin Resource Sharing (CORS)

- Same-Origin Policy, simple requests, and preflight requests
- Credentials and common misconfigurations

### 3.14 Subresource Integrity

- Integrity hashes and third-party scripts

### 3.15 Compliance & Regulations

- GDPR, CCPA, and consent management
- Data minimization and PII handling

- **Design exercise:** Design a secure authentication architecture for a banking frontend

## Module 4: Frontend Architecture Patterns

**Goal:** Design frontend applications that scale across teams, domains, repositories, and deployment boundaries.

### 4.1 Architecture Fundamentals

- Modular, layered, feature-based, and domain-driven frontend architecture
- Vertical slices and dependency boundaries

### 4.2 Monolith Frontend

- Architecture, benefits, and scaling challenges

### 4.3 Microfrontends

- Why microfrontends?
- Team autonomy, independent deployment, and domain ownership
- Runtime vs. build-time composition

### 4.4 IFrame-Based Microfrontend

- Isolation, communication, security, and limitations

### 4.5 Web Components

- Custom Elements and Shadow DOM
- Encapsulation and cross-framework interoperability

### 4.6 Module Federation

- Host and remote applications
- Shared dependencies and runtime composition
- Version conflicts and deployment strategy

### 4.7 Route-Based Micro Apps

- Domain-based routing, independent applications, and shell architecture

### 4.8 Microfrontend Communication

- Props, custom events, event buses, and shared state
- URL, browser storage, and backend coordination

### 4.9 Monorepo vs. Polyrepo

- Architecture, dependency management, and build pipelines
- Ownership, versioning, and deployment

### 4.10 Monorepo Tooling

- Nx, Turborepo, and workspaces
- Dependency graphs and affected builds

- **Design exercise:** Design frontend architecture for a large e-commerce organization with 20+ teams

## Module 5: Rendering Architecture

Rendering is a dedicated module so its architecture and trade-offs can be studied separately from performance optimization.

### 5.1 Rendering Fundamentals

- Browser, client, server, build-time, and edge rendering

### 5.2 Client-Side Rendering (CSR)

- Architecture, hydration, SEO, and performance trade-offs

### 5.3 Server-Side Rendering (SSR)

- Request-time rendering, TTFB trade-offs, server cost, and caching

### 5.4 Static Site Generation (SSG)

- Build-time generation and CDN distribution
- Build scalability

### 5.5 Incremental Static Regeneration (ISR)

- Revalidation, stale content, and regeneration

### 5.6 Streaming SSR

- Progressive HTML, Suspense boundaries, and faster perceived performance

### 5.7 Partial Hydration

- Hydration cost and selective interactivity

### 5.8 Islands Architecture

- Static-first architecture and interactive islands

### 5.9 Edge Rendering

- Edge compute, geographic latency, and personalization

### 5.10 React Server Components

- Server vs. client components
- Serialization boundaries, data fetching, and bundle reduction

### 5.11 Rendering Decision Framework

- CSR vs. SSR, SSR vs. SSG, SSG vs. ISR, and streaming vs. traditional SSR
- **Design exercise:** Choose a rendering architecture for an e-commerce site, news website, admin dashboard, and social feed

## Module 6: Frontend Performance Engineering

**Goal:** Design for measurable performance at scale.

### 6.1 Performance Fundamentals

- Performance across network, CPU, memory, rendering, and user-perceived experience

### 6.2 Core Web Vitals

- LCP, INP, CLS, TTFB, and FCP

### 6.3 Asset Optimization

- Image optimization and responsive images
- WebP, AVIF, SVG, font, and video optimization
- Compression

### 6.4 Network Optimization

- CDN, DNS prefetch, preconnect, preload, and prefetch
- Compression, connection reuse, and priority hints

### 6.5 Build Optimization

- Minification, tree shaking, and dead-code elimination
- Code splitting, chunking, dynamic imports, and bundle analysis

### 6.6 JavaScript Optimization

- Main-thread blocking and long tasks
- Web Workers and scheduling
- Debouncing, throttling, and memory management

### 6.7 React Optimization

- Re-rendering and memoization
- `React.memo`, `useMemo`, and `useCallback`
- Virtualization and concurrent rendering

### 6.8 Loading Strategies

- Lazy loading, progressive loading, skeleton screens, and optimistic UI

### 6.9 Performance Budgets

- JavaScript, image, and request budgets
- Core Web Vitals targets

### 6.10 Performance Monitoring

- Lab and field data
- Real User Monitoring (RUM), synthetic monitoring, and performance regression

- **Design exercise:** Improve a slow e-commerce product page

## Module 7: Offline-First and Progressive Web Apps

### 7.1 Offline Architecture Overview

- Offline-first vs. online-first
- Network uncertainty and resilient UX

### 7.2 Progressive Web Apps (PWAs)

- Web App Manifest, installation, and app-like experience

### 7.3 Service Workers

- Lifecycle: install, activate, fetch, and update

### 7.4 Caching Strategies

- Cache First, Network First, Stale While Revalidate, Network Only, and Cache Only

### 7.5 Offline Data

- IndexedDB, local queues, and mutation persistence

### 7.6 Synchronization

- Background Sync, retry queues, and conflict resolution

### 7.7 Offline UX

- Connectivity indicators, stale data, and pending operations

- **Design exercise:** Design an offline-first note-taking application

## Module 8: Frontend Testing Strategy

### 8.1 Testing Pyramid & Testing Trophy

- Testing philosophy, confidence vs. cost, and what should be tested

### 8.2 Unit Testing

- Pure functions, hooks, utilities, and business logic

### 8.3 Component Testing

- Rendering, interaction, state changes, and accessibility

### 8.4 Integration Testing

- Multiple components, API integration, and state integration

### 8.5 End-to-End Testing

- User journeys, browser automation, and critical flows

### 8.6 Contract Testing

- Frontend/backend contracts and schema compatibility

### 8.7 Visual Regression Testing

- Screenshot comparison and design system regression

### 8.8 A/B Testing

- Experiment design, assignment, metrics, and statistical considerations
- Feature interactions

### 8.9 Test-Driven Development (TDD)

- Red, green, refactor

### 8.10 Automation Testing

- CI integration, parallel execution, flaky tests, and test retries

### 8.11 Tools

- Jest, Vitest, React Testing Library, Playwright, and Cypress

- **Design exercise:** Define a testing architecture for a payment checkout flow

## Module 9: Logging, Monitoring and Observability

### 9.1 Observability Overview

- Logging, metrics, traces, and user telemetry

### 9.2 Error Capture

- JavaScript errors and promise rejections
- API, resource, and navigation failures

### 9.3 Telemetry

- Feature usage, user journeys, funnel tracking, and interaction events
- Session context

### 9.4 Performance Monitoring

- Web Vitals, page load, API latency, and resource latency

### 9.5 Alerting

- Error thresholds, API failure rates, and performance regression
- Availability and infrastructure capacity

### 9.6 Debugging

- Stack traces, source maps, correlation IDs, and session replay
- Distributed tracing

### 9.7 Incident Lifecycle

- Detect, triage, prioritize, debug, mitigate, recover, and prevent

### 9.8 Error Budgets & SLOs

- SLA, SLO, SLI, and error budgets

- **Design exercise:** Design observability for a checkout application

## Module 10: Frontend Data, Storage and Caching

### 10.1 Data Architecture Overview

- Server, client, URL, form, and persistent state

### 10.2 HTTP Caching

- `Cache-Control`, ETag, Last-Modified, Expires, and conditional requests

### 10.3 Browser Cache

- Memory cache, disk cache, and cache lifecycle

### 10.4 Service Worker Caching

- Runtime cache, precache, and cache versioning

### 10.5 API Caching

- In-memory caching, request deduplication, and query caching
- Stale-while-revalidate

### 10.6 State Management

- Local component, shared, global, server, and event-driven state

### 10.7 Local Storage

- Architecture, limitations, and security

### 10.8 Session Storage

- Session lifecycle and use cases

### 10.9 Cookies

- Session and persistent cookies
- `Secure`, `HttpOnly`, and `SameSite`

### 10.10 IndexedDB

- Structured client data, transactions, indexes, and offline storage

### 10.11 Data Consistency

- Optimistic and pessimistic updates
- Cache invalidation and conflict resolution

- **Design exercise:** Design data architecture for an infinite social feed

## Module 11: Accessibility Engineering

### 11.1 Accessibility Fundamentals

- Inclusive design, WCAG, and POUR principles

### 11.2 Semantic HTML

- Landmarks, headings, forms, and native controls

### 11.3 Keyboard Accessibility

- Tab order, focus management, focus traps, and skip links

### 11.4 Screen Readers

- Accessible names, announcements, and dynamic content

### 11.5 Accessible Rich Internet Applications (ARIA)

- Roles, states, properties, and live regions

### 11.6 Color & Visual Accessibility

- Contrast, color blindness, and non-color indicators

### 11.7 Accessible Components

- Modals, dropdowns, tabs, autocomplete, and data grids

### 11.8 Accessibility Testing

- Automated, keyboard, and screen-reader testing

- **Design exercise:** Design an accessible modal and autocomplete

## Module 12: Design Systems and Cross-Browser Consistency

### 12.1 Design System Fundamentals

- Why design systems, design language, reusability, and governance

### 12.2 Design Tokens

- Colors, typography, spacing, elevation, and motion

### 12.3 Component Architecture

- Primitives, components, patterns, and templates

### 12.4 Theming

- Light and dark modes, brand themes, and multi-tenant themes

### 12.5 Component API Design

- Props, composition, controlled/uncontrolled behavior, and extensibility

### 12.6 Versioning

- Semantic versioning, breaking changes, and migration strategy

### 12.7 Polyfills

- Feature detection, progressive enhancement, and transpilation

### 12.8 Cross-Browser Compatibility

- Chromium, Firefox, Safari/WebKit, and mobile browsers

### 12.9 Browser Support Strategy

- Browserslist, compatibility matrix, and graceful degradation

### 12.10 Design System Governance

- Contribution model, ownership, documentation, and adoption metrics

- **Design exercise:** Design a multi-brand enterprise design system

## Module 13: Scalability, Reliability and Resilience

This module covers frontend concerns that are especially relevant to HLD interviews.

### 13.1 Frontend Scalability

- User, traffic, codebase, team, and geographic scale

### 13.2 Failure Handling

- API, partial, dependency, and CDN failures

### 13.3 Retry Strategies

- Immediate retry, exponential backoff, jitter, and retry budgets

### 13.4 Timeout Strategy

- API and UI timeouts
- `AbortController`

### 13.5 Graceful Degradation

- Feature fallback, reduced functionality, and static fallback

### 13.6 Circuit Breaker Concepts

- Failure thresholds, recovery, and frontend applicability

### 13.7 Feature Flags

- Progressive rollout, kill switches, user segmentation, and experimentation

### 13.8 Deployment Safety

- Canary release, blue-green deployment, progressive rollout, and rollback

- **Design exercise:** Design a frontend that remains resilient during partial backend outages

## Module 14: Frontend Infrastructure and Delivery Architecture

This module covers infrastructure and delivery topics important for Senior- and Staff-level interviews.

### 14.1 Build Pipeline

- Source, build, test, package, and deploy

### 14.2 CI/CD

- Pull request validation, build pipelines, test automation, and deployment automation

### 14.3 CDN Architecture

- Edge caching, geographic distribution, and cache invalidation

### 14.4 Static Asset Deployment

- Content hashing, immutable assets, and versioning

### 14.5 Environment Management

- Development, staging, and production
- Runtime configuration

### 14.6 Release Strategies

- Rolling deployment, blue-green deployment, canary releases, and progressive delivery

### 14.7 Rollback Strategy

- Application and asset rollback
- Compatibility concerns

- **Design exercise:** Design a global deployment architecture for a large single-page application

---

## Practice & Interview Preparation

- **Practice problems:** Apply the module concepts to realistic frontend system-design scenarios.
- **Interview questions:** Review concepts and practice explaining architectural decisions, trade-offs, and failure handling.
