# Logging, Monitoring & Observability

## Module Goal

Design frontend observability systems that help teams answer:

- What failed, where, and why?
- Which users and business workflows were affected?
- Is the problem getting worse?
- Did a release or experiment introduce the issue?
- Can the user journey be reconstructed safely?
- Are reliability and performance objectives being met?

Observability is an architectural capability that connects browser behavior, user journeys, frontend errors, API requests, backend traces, releases, experiments, and business outcomes. Merely sending errors to a monitoring vendor does not make an application observable.

## Table of Contents

- [1. Observability Fundamentals](#1-observability-fundamentals)
- [2. Frontend Error Capture](#2-frontend-error-capture)
- [3. Product and User-Journey Telemetry](#3-product-and-user-journey-telemetry)
- [4. Performance Monitoring](#4-performance-monitoring)
- [5. Telemetry Architecture and Privacy](#5-telemetry-architecture-and-privacy)
- [6. Alerting and Availability](#6-alerting-and-availability)
- [7. Debugging and Distributed Tracing](#7-debugging-and-distributed-tracing)
- [8. Incident Lifecycle](#8-incident-lifecycle)
- [9. SLOs, SLIs, and Error Budgets](#9-slos-slis-and-error-budgets)
- [10. Design Exercise: Checkout Observability](#10-design-exercise-checkout-observability)
- [11. Reference Architecture and Principles](#11-reference-architecture-and-principles)

---

## 1. Observability Fundamentals

Observability is the ability to understand a system's internal state from its external outputs. For a frontend, those outputs include logs, errors, metrics, traces, performance measurements, meaningful user events, and browser or device context.

Consider a report that “payment failed.” Useful diagnosis needs more context:

- Which checkout attempt and route?
- Which application release, browser, device, and experiment?
- Did the payment API fail, or did the UI fail after payment succeeded?
- Which request and backend trace correspond to the interaction?
- Was the issue isolated or widespread, and what was its business impact?

### 1.1 The Three Pillars

| Signal | Represents | Frontend examples |
| ------ | ---------- | ----------------- |
| Logs | Discrete events with context | API failure, route-load failure, validation error |
| Metrics | Numerical measurements aggregated over time | Error rate, checkout success, p95 latency |
| Traces | The lifecycle of work across components and services | Browser request through gateway, checkout, and payment services |

User and business telemetry add information about what people do and whether they complete important workflows. The strongest observability systems correlate technical health, user experience, distributed-system behavior, and business outcomes.

### 1.2 Structured Events and Metrics

Prefer structured, queryable events over arbitrary console strings. A consistent event envelope may include event type, timestamp, release, route, device class, and correlation context.

Metrics commonly include:

- **Counters:** Total checkout attempts, API failures, or JavaScript errors.
- **Gauges:** Current active sessions, memory use, or queue depth.
- **Histograms:** Latency distributions used to calculate percentiles.

Use percentiles such as p50, p95, and p99 for user-facing latency. Averages can hide severe tail latency.

## 2. Frontend Error Capture

Frontend failures are difficult to reproduce because the application does not control the user's browser, extensions, device CPU, memory, network, cache, service worker, or tab lifecycle. Capture failures at multiple boundaries and include enough context to diagnose them.

### 2.1 Error Categories

Capture and distinguish:

- Uncaught JavaScript exceptions.
- Unhandled promise rejections.
- Framework render failures.
- API errors, timeouts, offline requests, CORS failures, and rate limits.
- Resource failures for JavaScript, CSS, images, fonts, and third-party scripts.
- Navigation failures such as route loader errors or lazy-chunk failures.

Use global handlers for broad coverage and framework-, route-, or feature-level boundaries for richer context. Distinguish expected cancellations and handled business errors from unexpected failures to avoid noisy dashboards.

### 2.2 Centralized API Instrumentation

A centralized API client is a useful observability boundary. Record request method, normalized route, status, duration, and failure category. Preserve errors for application handling and reporting; telemetry should not change request semantics.

Normalize dynamic URL segments before metric ingestion:

```text
/api/users/123
/api/users/456
        ↓
/api/users/:id
```

Unnormalized identifiers create high-cardinality metrics, which are costly and difficult to interpret.

### 2.3 Resource and Navigation Failures

Track critical asset load failures, including dynamic imports and old chunks requested by clients running stale HTML. A stale page may request an asset removed by a deployment and fail with a chunk-load error. Versioned asset retention and a carefully bounded recovery path can mitigate this class of incident.

For single-page applications, measure navigation starts, completions, failures, and duration. A route can fail because of chunk loading, data loading, authentication checks, redirects, or rendering even when the document request succeeded.

## 3. Product and User-Journey Telemetry

Telemetry should answer how users experience and use the product, not just whether a request returned an error.

### 3.1 Meaningful Events

Prefer domain-specific events with a standard envelope:

```text
checkout_started
address_submitted
payment_started
payment_completed
order_confirmed
```

Generic events such as “button clicked” are easy to emit but have weak meaning. Domain events require governance but better support product analysis and incident diagnosis.

Do not capture every click indiscriminately. Excessive event volume adds cost, creates privacy risk, and obscures useful signals.

### 3.2 Journeys and Funnels

Model important user journeys as ordered events. A checkout funnel might be:

```text
Cart viewed → Checkout started → Address completed
  → Payment started → Payment completed
```

A drop in payment completion can expose a frontend issue even when server availability and infrastructure dashboards look healthy. Correlate funnel changes with browser, route, payment method, geography, experiment, and release.

### 3.3 Session Context

Useful context may include a pseudonymous session or user identifier, release, route, browser family, device class, locale, network category, enabled feature flags, and trace identifiers. Keep identifiers purpose-limited and avoid collecting more data than needed.

## 4. Performance Monitoring

Measure performance from the user's perspective and segment results so poor experiences are not hidden by global averages.

### 4.1 Browser Metrics

Track user-centric metrics such as:

- LCP (Largest Contentful Paint).
- INP (Interaction to Next Paint).
- CLS (Cumulative Layout Shift).
- TTFB (Time to First Byte) and FCP (First Contentful Paint) as supporting diagnostics.

Segment by route, device, browser, geography, release, network, and experiment where volume permits. Desktop results can conceal much slower mobile or low-end-device performance.

### 4.2 Page, API, and Resource Latency

Measure navigation, DNS and connection setup where available, TTFB, resource loading, JavaScript execution, hydration, and interactive readiness.

Track API latency distributions (for example p50, p95, and p99) and correlate browser timings with server-side traces. User-perceived request time includes browser, DNS, connection, CDN, gateway, service, and database work.

Monitor resource latency for application bundles, CSS, images, fonts, and third-party scripts. A healthy application API does not guarantee a fast page if an analytics, chat, or advertising script blocks the main thread.

## 5. Telemetry Architecture and Privacy

A typical collection pipeline is:

```text
Browser instrumentation
  → Buffer, batch, and sample
  → Redact and validate
  → Telemetry gateway
  → Error, metric, trace, and event stores
  → Dashboards, alerts, and product analytics
```

Buffering and batching can reduce network overhead. Sampling controls cost and volume, but critical errors and rare high-impact events may need different sampling policies from routine events.

### 5.1 Privacy and Data Minimization

Never casually collect passwords, payment-card numbers, CVVs, authentication tokens, raw authorization headers, private messages, or sensitive form contents.

Apply privacy controls before transmission:

- Redaction and masking.
- Consent and purpose limitation where required.
- Data minimization and short retention.
- Access control and auditability.
- Sampling policies and sensitive-field exclusions.

Session replay can help reconstruct difficult UX failures but carries privacy, storage, performance, and compliance costs. Mask sensitive fields and components, sample conservatively, restrict access, and limit retention.

### 5.2 Event and Metric Cardinality

Avoid high-cardinality labels such as raw URLs, unique user IDs, or arbitrary request values on metric dimensions. Normalize routes and keep detailed identifiers in access-controlled logs or traces when necessary.

## 6. Alerting and Availability

Monitoring without actionable alerts creates dashboards nobody watches. An alert should state what happened, severity, affected users, start time, likely change, and the next useful investigation step.

### 6.1 Error and API Alerts

Use rates and affected-user counts rather than raw event counts alone. A percentage threshold combined with a minimum affected population and sustained duration can reduce noise.

Severity must reflect business criticality. A small failure rate on payment submission can be more urgent than a larger failure rate on recommendations.

### 6.2 Performance Regression Alerts

Alerts can use static thresholds or compare with a baseline:

- Static thresholds are simple and predictable.
- Dynamic baselines can reveal regressions but may be noisy with seasonal traffic or changing user mix.

Use percentile metrics and compare equivalent segments and time windows.

### 6.3 User-Perceived Availability

A successful `GET /` response does not prove that the frontend is usable. Track application boot success, critical JavaScript loading, route rendering, and completion of critical workflows.

Synthetic checks can follow a realistic journey:

```text
Open homepage → Search → Add to cart → Open checkout
```

Also understand supporting infrastructure signals such as CDN errors, origin saturation, edge latency, SSR CPU and memory, queue depth, connection pools, and cache hit rate. Infrastructure affects frontend performance and business outcomes.

## 7. Debugging and Distributed Tracing

### 7.1 Source Maps

Production bundles are usually minified, making raw stack traces difficult to interpret. Source maps translate generated locations back to source files and lines.

Generate and upload source maps to an access-controlled observability platform without publicly serving them when source exposure is a concern. Retain the exact source maps associated with each release.

### 7.2 Correlation Identifiers

Propagate identifiers that connect browser events with backend logs and traces:

- `trace_id`: one distributed operation.
- `span_id`: one operation within a trace.
- `request_id`: one request.
- `session_id`: a user session context.

These identifiers serve different purposes and should not be treated as interchangeable.

### 7.3 Distributed Tracing

For checkout, a browser request may pass through an API gateway, checkout service, inventory, pricing, and payment providers. A distributed trace reveals which span dominates latency or failed, rather than attributing the entire delay to “the checkout API.”

### 7.4 Session Replay

Replay can reconstruct interactions, navigation, DOM changes, errors, and network activity. Use it selectively with masking, sensitive-field blocking, sampling, short retention, and role-based access.

## 8. Incident Lifecycle

A mature incident process follows a repeatable path:

1. **Detect:** Receive a meaningful alert, synthetic failure, user report, or business metric change.
2. **Triage:** Determine affected routes, users, regions, devices, and critical workflows.
3. **Prioritize:** Assign severity using user impact, business criticality, scope, and duration.
4. **Debug:** Correlate errors, release changes, browser context, requests, and distributed traces.
5. **Mitigate:** Reduce harm quickly with rollback, feature-flag disablement, traffic control, or a safe fallback; a code fix is not always the fastest mitigation.
6. **Recover:** Verify that service and user journeys have returned to expected behavior.
7. **Prevent:** Record contributing causes and create targeted actions such as tests, alerts, safer rollout, or architecture changes.

The goal is not only to find the faulty line but to restore the user journey safely and prevent recurrence.

## 9. SLOs, SLIs, and Error Budgets

| Term | Meaning | Example |
| ---- | ------- | ------- |
| SLA (Service Level Agreement) | Contractual commitment, potentially with penalties | 99.9% monthly availability |
| SLO (Service Level Objective) | Internal reliability or user-experience target | 99.95% successful checkout initiation |
| SLI (Service Level Indicator) | Actual measured value for an objective | Successful valid checkout requests / total valid checkout requests |

Choose SLOs that reflect user outcomes, not only infrastructure health. “CPU below 80%” is not a user-facing SLO; “99.5% of valid checkout requests succeed” is closer to one.

An error budget is the tolerated failure implied by the SLO. If an objective is 99.9%, the budget is 0.1% of eligible events. Teams can use remaining budget to guide release risk:

- When the budget is healthy, ship features and experiments with controlled risk.
- When it is exhausted, prioritize reliability and pause risky changes.

Higher reliability targets usually require more redundancy, cost, and operational complexity. Reliability is a product and business decision as well as an engineering one.

## 10. Design Exercise: Checkout Observability

Assume a global checkout with web and mobile web clients, multiple payment providers, frequent frontend releases, and microservice dependencies.

### 10.1 Critical Journey

```text
checkout_started
  → address_submitted
  → delivery_selected
  → payment_started
  → payment_completed
  → order_confirmed
```

Also measure important secondary paths such as coupon application, payment retry, address changes, and checkout abandonment.

### 10.2 Signals to Collect

- Frontend errors: JavaScript, unhandled rejections, render errors, chunk/resource failures, API and navigation failures.
- User journey: step starts, completions, failures, and abandonment.
- Performance: checkout LCP/INP/CLS, route transition time, payment API p95/p99, and bundle load latency.
- Context: normalized route, release/build identifier, browser/device category, region, payment method category, and experiment assignment.
- Distributed traces: browser request through gateway and downstream checkout/payment services.

Do not collect payment credentials or sensitive form contents. Apply redaction, sampling, retention, and access controls before data reaches the telemetry pipeline.

### 10.3 Alert and Response

Alert on sustained, user-impacting checkout or payment failures and meaningful performance regressions, with thresholds tied to business criticality. Correlate incidents with release identifiers. Use canaries or feature flags to limit impact, and ensure responders can disable a rollout or roll back safely.

## 11. Reference Architecture and Principles

```text
Frontend users
  ↓
Browser instrumentation
  ├── Errors and stack traces
  ├── Metrics and Web Vitals
  ├── Product events and funnels
  └── Trace context and release metadata
  ↓
Telemetry SDK
  ├── Redaction and validation
  ├── Sampling and batching
  └── Retry and bounded buffering
  ↓
Telemetry gateway and storage
  ├── Error and event store
  ├── Metrics and dashboards
  └── Trace and source-map systems
  ↓
Alerts, product analytics, and incident response
```

Connect technical health, user experience, distributed behavior, and business outcomes. A mature system should answer which users were affected, which journey failed, which release introduced it, which dependency caused it, what business impact resulted, and how to mitigate it safely.
