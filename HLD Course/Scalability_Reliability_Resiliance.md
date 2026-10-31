# Scalability, Reliability & Resilience

## Module Goal

Design frontend systems that continue to provide acceptable user experiences as user and traffic volumes grow, codebases and teams expand, dependencies fail, APIs slow down, deployments introduce regressions, or regions experience outages.

A scalable frontend is not simply JavaScript that runs on a user's device. It includes asset delivery, APIs, CDNs, BFFs, configuration services, feature flags, analytics, deployment systems, repositories, and engineering teams.

The central reliability principle is: failures are inevitable; user-visible collapse is a design decision.

## Table of Contents

- [1. Frontend Scalability](#1-frontend-scalability)
- [2. Resilience and Failure Domains](#2-resilience-and-failure-domains)
- [3. Retry Strategy](#3-retry-strategy)
- [4. Timeout and Cancellation](#4-timeout-and-cancellation)
- [5. Graceful Degradation](#5-graceful-degradation)
- [6. Circuit Breakers](#6-circuit-breakers)
- [7. Feature Flags and Kill Switches](#7-feature-flags-and-kill-switches)
- [8. Safe Deployment and Rollback](#8-safe-deployment-and-rollback)
- [9. Resilience Design Exercise](#9-resilience-design-exercise)
- [10. Architecture Trade-Offs](#10-architecture-trade-offs)
- [11. Module Outcomes](#11-module-outcomes)

---

## 1. Frontend Scalability

Frontend scalability has several dimensions. A decision made in the browser can influence upstream capacity, user experience, and the ability of teams to safely change the system.

### 1.1 User and Traffic Scale

Every client can generate API requests, image and asset requests, analytics events, and feature-flag evaluations. At scale, polling, retries, prefetching, and refresh policies become distributed-systems decisions.

For example, a dashboard that polls every five seconds creates twenty requests per second for 100 users but twenty thousand requests per second for 100,000 users. Alternatives include:

- Polling less frequently.
- Polling only while the tab is visible.
- Adaptive polling based on freshness needs.
- Server-Sent Events or WebSockets for frequent updates.
- Event-driven invalidation, stale-while-revalidate, or manual refresh.

| Strategy | Freshness | Backend load | Complexity |
| -------- | --------- | ------------ | ---------- |
| Frequent polling | High | Very high | Low |
| Longer polling interval | Medium | Medium | Low |
| Adaptive polling | Medium to high | Lower | Medium |
| WebSockets or SSE | High | Efficient for frequent updates | High |
| Manual refresh | Low | Very low | Low |

Traffic is also uneven. Campaigns, ticket launches, sports events, and viral content can create sudden spikes. A CDN-first architecture with cached HTML and immutable static assets can reduce origin load. Dynamic or personalized sections can load independently so an optional service does not prevent the page shell from rendering.

Personalization and cacheability are in tension. A common compromise is a shared cached shell with client-side personalized regions.

### 1.2 Codebase Scale

As a codebase grows, broad folders such as `components`, `utils`, or `services` can obscure ownership and create accidental coupling. Organize by domain where that improves boundaries:

```text
src/
├── checkout/
│   ├── components/
│   ├── api/
│   ├── hooks/
│   └── state/
├── catalog/
├── account/
└── shared/
```

Domain organization can duplicate small abstractions. The goal is not zero duplication; it is controlled duplication with low coupling. A small repeated helper can be safer than a shared abstraction that binds many teams to one change.

### 1.3 Team Scale

An architecture that works for a small team may struggle with many teams and domains because of deployment coordination, unclear ownership, slow CI, dependency conflicts, and cross-team blocking.

Possible responses include a monorepo with ownership boundaries, a modular monolith, package boundaries, or microfrontends with independent deployments.

Do not choose microfrontends merely because a product has many components. They are most useful when domains have clear ownership and release coordination is a real bottleneck. They also add runtime integration, dependency duplication, versioning, observability, and UX consistency costs.

### 1.4 Geographic Scale

Users far from a single origin experience added latency across DNS, TLS, HTML, JavaScript, APIs, and images. A global CDN and regional infrastructure can place content nearer users. Consider edge caching, regional APIs, localized content and bundles, and data-residency requirements.

Regionalization can improve latency but increases operational complexity, cache fragmentation, deployment coordination, and debugging effort.

## 2. Resilience and Failure Domains

A frontend depends on many independently failing systems: APIs, authentication, CDNs, configuration and experimentation services, analytics, payment SDKs, and service workers.

Classify dependencies by criticality so failure behavior is intentional:

| Tier | Example | Failure approach |
| ---- | ------- | ---------------- |
| Core | Application shell, critical navigation | Preserve or recover the main user journey |
| Business-critical | Cart, payment, account actions | Fail safely and communicate status clearly |
| Important enhancement | Search suggestions, recommendations | Use a fallback or reduced experience |
| Optional | Analytics, decorative enhancements | Do not block application startup |

Do not let optional dependencies block core application rendering. A payment SDK has a different criticality from an analytics SDK; their failures should not share one generic fallback policy.

### 2.1 Isolate UI Failure Domains

Give major sections independent loading, error, timeout, retry, and fallback behavior. A recommendation outage should not hide categories or prevent a product list from rendering. A page composed of independent regions can preserve useful functionality when one dependency fails.

### 2.2 CDN and Asset Delivery

CDNs improve performance but can fail through regional outages, stale assets, incorrect invalidation, DNS issues, or unreachable origins. Versioned, content-hashed filenames make assets immutable:

```text
app.a91f23.js
vendor.b18c44.js
styles.91ab22.css
```

Publish deployment artifacts in a safe order:

```text
Upload new immutable assets
        ↓
Verify asset availability
        ↓
Publish HTML that references them
```

Publishing HTML first can cause clients to request assets that are not available yet. Keep old immutable assets available long enough for cached HTML and active browser sessions to continue working.

## 3. Retry Strategy

Retries can recover transient failures, but uncontrolled retries amplify outages. If many clients fail together and immediately retry, the dependency receives a second wave of traffic precisely when it is unhealthy.

### 3.1 Exponential Backoff and Jitter

Exponential backoff increases the delay between attempts:

```text
delay = base × 2^attempt
```

Jitter adds randomness so clients do not retry in synchronized waves. Bound both the number of attempts and the total retry duration.

### 3.2 Retry Only Appropriate Failures

Retry transient network errors and selected responses such as `502`, `503`, `504`, and `429` when policy and `Retry-After` allow it. Do not retry validation errors or authorization failures as if they were transient.

Most importantly, do not blindly retry non-idempotent operations. A payment may succeed even if its response is lost. Retrying the payment can create a duplicate charge. Use idempotency keys and, when the outcome is uncertain, query transaction status before attempting the operation again.

A retry policy should specify:

- Which operations are safe to retry.
- Retryable status codes and network failures.
- Maximum attempts and total elapsed time.
- Backoff and jitter behavior.
- Handling of `Retry-After`.
- User feedback and cancellation.

## 4. Timeout and Cancellation

Without timeouts, a user can remain in a loading state indefinitely. A timeout is both a reliability policy and a user-experience decision.

Different operations need different time budgets. Search suggestions may need a short timeout; a report or file export may reasonably take longer. Avoid a single global timeout for every request.

The UI patience threshold is separate from the network timeout:

| Elapsed time | Possible UI behavior |
| ------------ | -------------------- |
| Very short request | Avoid flashing a loading indicator |
| Longer request | Show a subtle loading state |
| Sustained wait | Show progress or a skeleton |
| Excessive wait | Offer a useful recovery action |

Cancel requests that are no longer relevant. For typeahead search, a new query should abort or supersede the old request so stale results cannot overwrite current results. Cancellation reduces unnecessary work and improves correctness.

## 5. Graceful Degradation

Graceful degradation preserves the most valuable usable experience when full functionality is unavailable.

Examples:

- If personalized recommendations fail, show popular products.
- If promotional content fails, hide that section without blocking the page.
- If search is unavailable, preserve category browsing.
- If current inventory cannot be confirmed, prevent unsafe purchase actions and explain that availability is temporarily unavailable.
- If payment status is uncertain, show that it is being confirmed and query transaction status rather than claiming immediate failure.

Fallbacks should be honest and safe. Do not present stale data as current when users might make financial or safety-critical decisions from it.

## 6. Circuit Breakers

A circuit breaker temporarily stops requests to an unhealthy dependency after repeated failures. Common states are:

```text
Closed → requests flow normally
Open → requests are blocked during a cooldown
Half-open → a limited probe checks recovery
```

Client-side circuit breakers can reduce repeated failing requests and improve local user experience, but state is local to one browser, can reset on refresh, and is not visible across clients. They are not a replacement for server- or edge-level protection when system-wide load shedding is required.

Use the mechanism at the layer that has the necessary visibility and control, and ensure the UI still communicates degraded behavior.

## 7. Feature Flags and Kill Switches

Feature flags separate code deployment from feature release. A feature can be deployed while disabled, then enabled gradually as health is observed.

### 7.1 Progressive Rollout

A rollout may progress from internal users to small percentages and then to broader traffic. Monitor relevant signals such as JavaScript errors, API failures, performance, conversion, crashes, and backend load. Define stop or rollback thresholds before the rollout starts.

### 7.2 Kill Switches and Safe Defaults

A kill switch disables a risky feature without waiting for a full rebuild and redeployment. The kill switch should not depend entirely on the feature that is failing. If a flag SDK is unavailable, risky new functionality should have a deliberate safe default.

### 7.3 Segmentation and Experiments

Flags may target browser, device, country, account tier, organization, employee, or percentage cohorts. Segmentation increases the number of combinations that must be tested, so keep targeting rules purposeful.

Feature rollout asks, “Is this safe?” Experimentation asks, “Is this better?” Keep safety rollout metrics distinct from experiment outcome metrics.

## 8. Safe Deployment and Rollback

Deployment is a common source of production failures. Reduce risk with staged releases and explicit health gates.

### 8.1 Canary and Progressive Release

Canary release sends a small percentage of traffic to a new version while most users remain on the existing version. Increase exposure only after checking JavaScript errors, API failures, performance, conversion, and crashes.

A progressive rollout can move from internal users through increasing traffic percentages. Stop automatically or manually when predefined thresholds are violated.

### 8.2 Blue-Green Deployment

Blue-green deployment maintains separate current and candidate environments. After validating the candidate, traffic switches to it; rollback routes traffic back to the prior environment.

This enables fast rollback and clear environment separation but may require duplicate infrastructure and careful handling of data, cache, and API compatibility.

### 8.3 Frontend Rollback Constraints

Rolling back a frontend is not always just redeploying old files. Browsers and CDNs may hold old HTML, new JavaScript, an older service worker, or cached API responses simultaneously.

A rollout and rollback plan should account for:

- CDN cache and invalidation behavior.
- Immutable asset retention.
- Service-worker update and rollback behavior.
- API compatibility across overlapping frontend versions.
- Browser sessions that remain open during deployment.
- Backward-compatible data and schema changes.

Maintain compatibility across deployment windows so adjacent frontend versions can work with the currently supported API.

## 9. Resilience Design Exercise

### Scenario

Design an e-commerce frontend with a global, mobile-heavy audience, flash-sale traffic, and independently failing backend services:

- Authentication
- Catalog and search
- Recommendations and promotions
- Pricing and inventory
- Cart and payment

Checkout correctness is critical; recommendations and reviews are optional enhancements.

### Step 1: Identify Critical Journeys

Critical journeys include browsing, searching, viewing a product, adding to cart, checkout, and payment. Recommendations, personalized offers, and review previews may degrade independently.

### Step 2: Define Failure Boundaries

Give homepage regions independent loading and error states. A recommendation failure should not prevent search or product browsing. A cart or payment failure needs a safe, explicit recovery path.

### Step 3: Write a Dependency Policy

| Dependency | Criticality | Timeout | Retry | Fallback |
| ---------- | ----------- | ------- | ----- | -------- |
| Catalog | High | Product-specific | Bounded retry for safe reads | Cached catalog where freshness permits |
| Search | High | Short | Limited retry | Category navigation |
| Recommendations | Low | Short | No aggressive retry | Popular products |
| Promotions | Medium | Bounded | Limited retry | Hide promotion section |
| Cart | Critical | Bounded | Retry only with idempotency support | Controlled local state and reconciliation |
| Payment | Critical | Operation-specific | Never blindly retry | Query transaction status |
| Analytics | Low | Short | Background or no retry | Drop or queue event per policy |

Timeouts and thresholds should be chosen from actual service objectives and user expectations, not treated as universal constants.

### Step 4: Define Degraded Experiences

- Recommendation outage: render popular products.
- Promotion outage: hide offers without blocking browsing.
- Search outage: preserve category navigation.
- Inventory uncertainty: disable unsafe purchase actions and explain the status.
- Payment uncertainty: show “Confirming payment status” and query the transaction.

### Step 5: Protect Rollout and Observe

Roll out a new homepage gradually with a kill switch. Observe client errors, API failures, performance, cart success, checkout conversion, fallback activation, region, browser, and deployment version. Use these signals to identify whether failures are localized to one dependency, client environment, geography, or release.

## 10. Architecture Trade-Offs

| Decision | Option A | Option B | Trade-off |
| -------- | -------- | -------- | --------- |
| Data refresh | Frequent polling | Events or adaptive polling | Freshness vs. aggregate backend load |
| Page composition | Fully personalized SSR | Cached shell with client-side regions | Personalization vs. cacheability |
| Code reuse | One shared abstraction | Controlled duplication | Reuse vs. coupling across teams |
| Team architecture | Single coordinated release | Independent domain deployments | Simplicity vs. deployment autonomy |
| Retry policy | Immediate/unbounded | Bounded backoff with jitter | Fast retry vs. outage amplification |
| Failure behavior | Fail the whole page | Isolate sections and degrade | Consistency vs. partial utility |
| Circuit breaker | Client-only | Server or edge control | Local responsiveness vs. shared visibility |
| Feature release | All users at once | Progressive rollout | Speed vs. blast-radius control |
| Rollback | Replace the previous bundle | Compatibility-aware rollback | Simplicity vs. cached-client reality |

## 11. Module Outcomes

After completing this module, learners should be able to:

- Explain how browser behavior affects backend capacity and reliability.
- Identify user, traffic, codebase, team, and geographic scaling constraints.
- Establish frontend dependency tiers and independent failure domains.
- Design bounded retry, timeout, cancellation, and fallback policies.
- Protect non-idempotent operations from duplicate execution.
- Use circuit breakers and feature flags with deliberate safe defaults.
- Plan canary releases, progressive rollout, and compatibility-aware rollback.
- Define a failure matrix for a complex frontend workflow.
- Discuss resilience trade-offs in frontend system-design interviews.

The key question is not only how the happy path works. Ask what users can still do when each dependency is slow, unavailable, stale, or returning an uncertain result.
