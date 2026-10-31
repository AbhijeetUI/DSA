# Frontend System Design Interview Questions

## Purpose

Use these scenarios to practice frontend high-level design interviews. The questions focus on architecture, user experience, data flow, reliability, security, performance, and the trade-offs involved in building production systems.

## How to Approach a Question

Before drawing an architecture:

1. Clarify users, platforms, scale, regions, and critical user journeys.
2. Identify freshness, latency, availability, accessibility, privacy, and consistency requirements.
3. Separate critical features from optional enhancements.
4. Sketch the client, rendering, API, cache, storage, and delivery boundaries.
5. Explain data ownership, loading and error states, and recovery behavior.
6. Describe testing and observability for the highest-risk paths.
7. State trade-offs and what additional information could change the design.

## Question Index

| # | Scenario | Primary areas |
| -: | -------- | ------------- |
| 1 | [Global E-commerce Product Page](#1-design-a-global-e-commerce-product-page) | Rendering, performance, caching |
| 2 | [Live Cricket Score Platform](#2-design-a-live-cricket-score-platform) | Real-time communication, scale |
| 3 | [Banking Authentication](#3-design-secure-authentication-for-online-banking) | Security, authentication, sessions |
| 4 | [Infinite Social Feed](#4-design-an-infinite-social-media-feed) | Data, caching, performance |
| 5 | [Real-Time Chat](#5-design-a-real-time-chat-application) | WebSockets, offline, reliability |
| 6 | [Collaborative Editor](#6-design-a-collaborative-document-editor) | Real-time sync, conflict resolution |
| 7 | [Multi-Team E-commerce Frontend](#7-design-an-e-commerce-frontend-for-20-teams) | Architecture, microfrontends |
| 8 | [Global Video Streaming](#8-design-a-global-video-streaming-frontend) | CDN, playback, observability |
| 9 | [Payment Checkout](#9-design-a-resilient-payment-checkout) | Security, resilience, state |
| 10 | [Offline Field-Sales App](#10-design-an-offline-field-sales-app) | PWA, IndexedDB, synchronization |
| 11 | [Analytics Dashboard](#11-design-an-analytics-dashboard) | Large data, streaming, performance |
| 12 | [Resumable File Upload](#12-design-a-resumable-file-upload-platform) | Chunking, retry, recovery |
| 13 | [Multi-Brand Design System](#13-design-a-multi-brand-enterprise-design-system) | Tokens, governance, accessibility |
| 14 | [Third-Party Script Security](#14-design-third-party-script-security) | CSP, integrity, supply chain |
| 15 | [Global SPA Deployment](#15-design-global-spa-delivery-and-rollback) | CI/CD, CDN, rollback |
| 16 | [Typeahead Search](#16-design-an-accessible-typeahead-search) | API, race conditions, accessibility |
| 17 | [Partial Backend Outage](#17-design-a-frontend-resilient-to-partial-backend-outages) | Reliability, resilience |
| 18 | [Multi-Tenant SaaS](#18-design-a-multi-tenant-saas-frontend) | Architecture, security, theming |
| 19 | [Global News Platform](#19-design-a-global-news-platform) | Rendering, CDN, freshness |
| 20 | [Frontend Observability Platform](#20-design-a-frontend-observability-platform) | Monitoring, SLOs, incident response |

---

## 1. Design a Global E-commerce Product Page

The product page serves 25 countries and receives 10 million visits per day. It contains product information, pricing, inventory, recommendations, reviews, and personalized offers. Mobile users report slow loading. SEO is business-critical, while pricing and inventory change frequently.

Discuss:

- CSR, SSR, SSG, ISR, streaming, and whether server components are useful.
- CDN and edge caching, including personalized versus cacheable regions.
- Product API design, such as REST, GraphQL, or a BFF.
- Image delivery and Core Web Vitals.
- Cache invalidation and freshness for price and inventory.
- Partial failure behavior for recommendations and reviews.

**Key trade-off:** How can the system maximize cacheability while still showing current inventory and personalized pricing?

## 2. Design a Live Cricket Score Platform

Build a live score experience for a large audience during high-profile matches. Users need score updates, commentary, and match events on desktop and mobile, including when a connection drops and returns.

Discuss:

- Polling versus Server-Sent Events versus WebSockets.
- Event sequence numbers, deduplication, and reconnect recovery.
- How clients resume from the last processed event.
- Visibility-aware update frequency and backend load.
- Cached score fallback and behavior when the real-time channel fails.
- Whether match chat belongs on a separate bidirectional channel.

**Key trade-off:** How fresh must scores be, and what is the simplest reliable communication model that meets that requirement?

## 3. Design Secure Authentication for Online Banking

A bank frontend supports username/password, MFA, SSO, session timeout, multiple tabs, suspicious-login detection, and sensitive transactions.

Discuss:

- Session cookies versus JWTs and token lifetimes.
- `HttpOnly`, `Secure`, and `SameSite` cookie attributes and CSRF defenses.
- XSS prevention, CSP, and why long-lived sensitive tokens should not be exposed to JavaScript.
- Refresh-token rotation and session revocation.
- Session synchronization and logout across tabs and devices.
- Step-up authentication for sensitive transactions.
- The distinction between frontend route guards and server-side authorization.

**Key trade-off:** Where should session credentials live, and how should the architecture balance token exposure, CSRF, usability, and revocation?

## 4. Design an Infinite Social Media Feed

Design a personalized feed with infinite scrolling, continuously arriving posts, likes and comments, optimistic updates, navigation away and back, and support for low-memory mobile devices.

Discuss:

- Cursor versus offset pagination.
- Server-state caching, normalization, deduplication, and prefetching.
- Virtualization and memory limits.
- Optimistic updates and reconciliation.
- Scroll restoration and how to insert new posts without displacing the reader.
- Stale-while-revalidate and duplicate post handling.

**Key trade-off:** How can the feed stay fresh without losing the user's reading position?

## 5. Design a Real-Time Chat Application

Build a chat interface that supports conversation history, delivery state, reconnects, and offline composition.

Discuss:

- WebSockets versus polling and when a one-way channel is insufficient.
- Client message IDs, acknowledgements, deduplication, and ordering.
- Message states such as pending, sent, delivered, read, and failed.
- Optimistic rendering and persistence of pending messages in IndexedDB.
- Reconnection with backoff and retrieving messages after the last known sequence.
- Separating durable messages from ephemeral typing or presence events.

**Key trade-off:** Exactly-once delivery is expensive; how can at-least-once delivery, idempotent processing, and deduplication provide a reliable user experience?

## 6. Design a Collaborative Document Editor

Design a document editor where many users can edit simultaneously, see presence, work offline, reconnect, resolve conflicts, and review version history.

Discuss:

- WebSockets versus WebRTC for synchronization.
- Operational Transformation versus CRDTs and their consistency assumptions.
- Applying edits locally before sending operations.
- Durable document operations versus ephemeral cursor and typing presence.
- Local persistence, offline queues, reconnect snapshots, and operation ordering.
- Large-document performance and version history.

**Key trade-off:** How do you keep editing responsive while ensuring concurrent edits eventually converge correctly?

## 7. Design an E-commerce Frontend for 20 Teams

Search, product, cart, checkout, payments, recommendations, account, and loyalty are owned by separate teams. A single frontend monolith creates deployment coordination and cross-team blocking.

Discuss:

- Modular monolith versus microfrontends and when independent deployment is valuable.
- Route-based boundaries, runtime composition, and shared dependencies.
- Design-system ownership and framework/version conflicts.
- Authentication and shared cart state without a giant global store.
- Monorepo versus polyrepo, observability, and failure isolation.
- Communication through URLs, props, and custom events.

**Key trade-off:** How much team autonomy is worth the runtime and operational complexity of microfrontends?

## 8. Design a Global Video Streaming Frontend

Build a streaming application for global users across mobile networks and smart TVs. It needs fast startup, adaptive quality, playback recovery, analytics, and recommendations.

Discuss:

- CDN and regional delivery architecture.
- Adaptive bitrate selection, buffer policy, and preloading.
- Playback state machine and recovery from network or media errors.
- Network quality signals and memory management.
- Lazy loading and recommendation integration.
- Quality-of-experience metrics such as startup time, rebuffering, and playback failures.

**Key trade-off:** How should the player balance fast startup, playback continuity, and video quality under changing network conditions?

## 9. Design a Resilient Payment Checkout

Design checkout across payment methods and regions. Payment requests can time out even when the provider has processed them; duplicate charges are unacceptable.

Discuss:

- Payment state machine and server-authoritative transaction status.
- Idempotency keys and safe retry behavior.
- Handling uncertain results, refreshing status, and preventing duplicate submission.
- Authentication, sensitive data boundaries, and third-party payment SDK isolation.
- Accessibility, validation, error recovery, and mobile performance.
- Monitoring conversion and payment failure rates without collecting unnecessary sensitive data.

**Key trade-off:** How should the UI communicate uncertainty without incorrectly reporting failure or charging twice?

## 10. Design an Offline Field-Sales App

Sales representatives visit areas with unreliable connectivity. They need to browse assigned customers, draft orders, record notes, and synchronize later.

Discuss:

- Service-worker caching and application-shell availability.
- IndexedDB data model, storage limits, and sensitive-data handling.
- Offline mutation queue, retry, idempotency, and conflict resolution.
- User-visible pending, synced, and failed states.
- Background synchronization limitations and foreground recovery.
- Data expiration, logout, and shared-device behavior.

**Key trade-off:** Which data and actions should remain available offline, and how will conflicts be resolved safely?

## 11. Design an Analytics Dashboard

Build a dashboard for large datasets and time ranges, with filters, charts, streaming updates, and exports.

Discuss:

- Server aggregation, pagination, and query APIs.
- Request cancellation and stale-response protection when filters change.
- Rendering large tables and charts efficiently.
- Virtualization, workers, and memory constraints.
- Polling or streaming update strategy and visibility awareness.
- Loading, partial data, empty, error, and stale states.

**Key trade-off:** Which work belongs on the server, in a worker, or on the main thread to keep interaction responsive?

## 12. Design a Resumable File Upload Platform

Users upload large files on unreliable networks and may close or crash the browser before uploads finish.

Discuss:

- Chunk size, parallelism, upload sessions, and progress reporting.
- Retry policy and resumability by completed chunk.
- Persisting upload ID, file fingerprint, chunk size, and completed chunks locally.
- Server-side validation, authorization, and finalization.
- Cancellation, expiration, and storage cleanup.
- Accessibility and recovery UX.

**Key trade-off:** How should chunk size and concurrency balance throughput, memory use, and the cost of retrying failed work?

## 13. Design a Multi-Brand Enterprise Design System

Fifteen brands and more than 100 frontend teams need distinct visual identity while preserving accessibility and consistency.

Discuss:

- Primitive, semantic, and component token layers.
- Runtime versus build-time theme selection.
- Accessible color combinations and visual regression coverage.
- Component APIs, composition, controlled state, and supported customization.
- Versioning, breaking changes, codemods, and migration policy.
- Governance, contribution workflow, ownership, and adoption metrics.

**Key trade-off:** How can teams customize a brand without undermining consistency, accessibility, or maintainability?

## 14. Design Third-Party Script Security

The application depends on analytics, experimentation, support chat, and payment scripts from external vendors.

Discuss:

- Trust boundaries and the privileges granted to scripts running in the page.
- Content Security Policy, nonce/hash strategies, and Subresource Integrity where applicable.
- Consent, data minimization, and privacy.
- Loading priorities, performance impact, and failure isolation.
- Vendor review, dependency updates, and incident response.
- Sandboxing or isolating scripts that do not need full-page privileges.

**Key trade-off:** How should the system balance vendor functionality and business value against security, privacy, performance, and operational risk?

## 15. Design Global SPA Delivery and Rollback

A global single-page application deploys multiple times per day. Users may retain cached HTML, assets, and service workers across releases.

Discuss:

- Build once and promote an immutable artifact.
- Runtime versus build-time configuration.
- Content-hashed assets, HTML cache policy, and upload ordering.
- CDN and origin behavior across regions.
- Canary and progressive deployment, health gates, and kill switches.
- Compatibility with old clients and API versions during rollback.

**Key trade-off:** How can new assets be deployed globally without serving stale HTML that references missing or incompatible bundles?

## 16. Design an Accessible Typeahead Search

Build a search input with asynchronous suggestions, keyboard navigation, large result sets, and screen-reader support.

Discuss:

- Debouncing, request cancellation, sequence IDs, and stale-response protection.
- Prefix caching and result limits.
- Focus behavior, active-descendant state, and keyboard interaction.
- Loading, empty, and error announcements.
- Virtualization and mobile screen-reader behavior.
- Selection and form submission behavior.

**Key trade-off:** How can the system reduce unnecessary requests without making suggestions feel slow or confusing?

## 17. Design a Frontend Resilient to Partial Backend Outages

The application depends on user, product, recommendation, cart, and payment APIs. The recommendation API begins returning errors.

Discuss:

- Critical versus optional dependencies and independent rendering.
- Timeouts, cancellation, bounded retries, backoff, jitter, and retry budgets.
- Cached or non-personalized fallbacks.
- Circuit-breaker concepts and feature-flag kill switches.
- Safe handling for cart and payment operations.
- Telemetry for fallback activation, latency, browser, region, and release version.

**Key trade-off:** Why can aggressive retries from browsers make an existing backend outage worse?

## 18. Design a Multi-Tenant SaaS Frontend

The product serves thousands of enterprise tenants, each with custom branding, permissions, feature configuration, regional deployment, and custom domains.

Discuss:

- Tenant resolution and validated runtime configuration.
- Role- or attribute-based permissions and server-side authorization.
- Tenant-specific theming, feature flags, and route experience.
- CDN caching and tenant-aware cache keys.
- Regional deployments, custom domains, and observability.
- Data isolation and protection against trusting a tenant ID supplied by the browser.

**Security question:** If a user changes a tenant ID in a URL or request, what authoritative server-side checks prevent cross-tenant access?

## 19. Design a Global News Platform

Design a news experience with fast global delivery, frequently updated headlines, SEO requirements, personalized recommendations, and breaking-news traffic spikes.

Discuss:

- SSR, static generation, incremental regeneration, and client-side enhancement.
- CDN caching, content freshness, invalidation, and regional delivery.
- Personalization boundaries and cacheable page regions.
- Breaking-news load spikes and origin protection.
- Image optimization, accessibility, and Core Web Vitals.
- Failure behavior for recommendations and non-critical content.

**Key trade-off:** How can the platform publish breaking updates quickly without making every page request uncached and origin-dependent?

## 20. Design a Frontend Observability Platform

Multiple frontend applications need consistent insight into user-visible errors, performance, API failures, and release regressions.

Discuss:

- Error, performance, and business-event collection.
- Correlation to release, browser, region, route, and dependency.
- Sampling, privacy, consent, and data minimization.
- Source maps and secure symbolication.
- SLOs, alert thresholds, dashboards, and incident workflows.
- Protecting application performance and availability when telemetry ingestion fails.

**Key trade-off:** How can teams capture enough context to diagnose real user impact without collecting excessive personal data or overwhelming telemetry pipelines?

## Closing Practice

For each scenario, finish by stating:

- The most important assumption you made.
- The primary failure mode and fallback.
- The metric that would reveal user impact.
- The trade-off you would revisit first as scale or requirements change.
