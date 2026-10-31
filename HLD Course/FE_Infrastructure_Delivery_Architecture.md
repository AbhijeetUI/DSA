# Frontend Infrastructure & Delivery Architecture

## Module Goal

Design frontend delivery systems that support growing engineering teams, frequent releases, global users, low-latency asset delivery, safe rollouts, and rapid recovery from bad deployments.

A production frontend exists inside a larger delivery system:

```text
Developer
   ↓
Source control and pull-request validation
   ↓
Build and test infrastructure
   ↓
Immutable artifact registry
   ↓
Deployment controller
   ↓
Origin or application runtime
   ↓
CDN and edge locations
   ↓
Browser
```

The architecture must account for the complete path from source change to browser, including configuration, cache behavior, rollout, observability, and rollback.

## Table of Contents

- [1. Frontend Delivery Lifecycle](#1-frontend-delivery-lifecycle)
- [2. CI and Pull-Request Validation](#2-ci-and-pull-request-validation)
- [3. Build and Artifact Management](#3-build-and-artifact-management)
- [4. Environment Configuration](#4-environment-configuration)
- [5. CDN and Asset Caching](#5-cdn-and-asset-caching)
- [6. Deployment Strategies](#6-deployment-strategies)
- [7. Frontend and API Compatibility](#7-frontend-and-api-compatibility)
- [8. Preview and Runtime Environments](#8-preview-and-runtime-environments)
- [9. Deployment Observability and Governance](#9-deployment-observability-and-governance)
- [10. Delivery Architecture Exercise](#10-delivery-architecture-exercise)
- [11. Architecture Trade-Offs](#11-architecture-trade-offs)
- [12. Module Outcomes](#12-module-outcomes)

---

## 1. Frontend Delivery Lifecycle

Frontend infrastructure is more than a build command. A mature delivery lifecycle includes:

1. Change submitted to source control.
2. Pull-request checks and review.
3. Build, test, and security validation.
4. Versioned artifact creation and publication.
5. Environment deployment and health checks.
6. Traffic shift, monitoring, and success or rollback decision.

Delivery differs by rendering model:

| Frontend type | Typical serving path |
| ------------- | -------------------- |
| Static SPA | Artifact registry → object storage or origin → CDN → users |
| Server-rendered app | Artifact registry → application runtime → load balancer → CDN → users |

Deployment includes artifact selection, authorization, environment validation, health checks, traffic management, and monitoring—not just copying files.

## 2. CI and Pull-Request Validation

Continuous Integration frequently integrates changes while validating correctness. Continuous Delivery keeps each valid change deployable, possibly with an approval before production. Continuous Deployment automatically releases every valid change to production.

A pull-request pipeline can include:

```text
Lint and type check
        ↓
Unit and component tests
        ↓
Affected integration tests
        ↓
Production build and bundle budget
        ↓
Security and dependency checks
        ↓
Accessibility and visual checks
        ↓
Preview deployment and review
```

### 2.1 Fast Feedback

Parallelize independent work such as linting, type checking, unit tests, and builds. Run dependent end-to-end checks after required build steps have passed.

Running every test for every change may be too slow and expensive in a large monorepo. Use the dependency graph to identify affected projects:

```text
Changed files → dependency graph → affected projects → relevant tests
```

Selective testing improves speed and cost but depends on an accurate dependency graph and can miss hidden coupling. A common balance is affected-project tests on pull requests, broader tests on the main branch, and full regression suites on a schedule.

## 3. Build and Artifact Management

The build pipeline may transform TypeScript, bundle JavaScript, process CSS, optimize images, generate source maps, and produce an asset manifest. Treat the build output as a versioned artifact with enough metadata to identify its provenance.

Example metadata:

```json
{
  "application": "consumer-web",
  "version": "4.18.2",
  "commit": "a82f19c",
  "buildId": "1842",
  "createdAt": "2026-07-05T10:30:00Z"
}
```

### 3.1 Build Once, Promote the Same Artifact

Rebuilding separately for staging and production can produce different outputs from the same commit, so the artifact tested in staging may not be the artifact ultimately deployed.

Prefer:

```text
Source commit
      ↓
Build once
      ↓
Immutable artifact
      ├── Deploy to staging
      ├── Validate
      └── Promote the same artifact to production
```

This requires environment configuration to be provided independently from the compiled application where practical.

## 4. Environment Configuration

Development, staging, and production need different endpoints, credentials, data, and feature settings. Configuration should be explicit, validated, and managed separately from source code.

### 4.1 Build-Time Configuration

Build-time variables are injected into the bundle. This is straightforward and enables bundler optimizations, but each environment requires a separate build. That weakens artifact promotion because staging and production no longer receive exactly the same bytes.

### 4.2 Runtime Configuration

A static application can load a runtime configuration document during startup:

```json
{
  "apiUrl": "https://api.example.com"
}
```

Advantages include building once and promoting the same artifact. Costs include a startup dependency, cache policy complexity, and the need to validate the configuration before use.

If configuration cannot be loaded, do not silently initialize the application with an invalid endpoint or render a blank screen. Provide a deliberate startup error state, telemetry, and a recovery path. Any fallback must be explicitly safe and appropriate for the affected environment.

Configuration delivered to a browser is public. Do not place secrets, private keys, or privileged credentials in frontend bundles or runtime configuration.

### 4.3 Environment Parity

Staging should resemble production in routing, CDN behavior, security headers, runtime configuration, and deployment mechanisms, while using separate data and credentials. A structurally different staging environment provides weak confidence that production will behave the same way.

Production changes should be automated, auditable, and reproducible rather than relying on manual server edits.

## 5. CDN and Asset Caching

A CDN serves content from edge locations closer to users, reducing latency and origin load. Static assets such as JavaScript, CSS, images, fonts, video, and static HTML are common candidates.

### 5.1 Cache Hierarchy

Large delivery systems may use:

```text
Browser cache
      ↓
CDN edge cache
      ↓
Regional cache or origin shield
      ↓
Origin
```

An origin shield can consolidate many edge misses into fewer origin requests during a traffic spike.

### 5.2 Cache Policy for HTML and Hashed Assets

HTML references the current asset versions, so it usually needs revalidation or a short cache lifetime. Content-hashed assets can be cached for a long time because their URLs change when their content changes.

| Resource | Typical strategy |
| -------- | ---------------- |
| `index.html` | `no-cache` or short TTL with revalidation |
| `app.a91f83.js` | Long TTL with `immutable` |
| Versioned images and fonts | Long TTL when URLs are immutable |
| Runtime configuration | Short TTL or explicit revalidation based on update needs |

For example:

```http
Cache-Control: public, max-age=31536000, immutable
```

is appropriate for a content-hashed file, not for a frequently changing unversioned path such as `/app.js`.

### 5.3 Cache Invalidation and Deployment Order

Overwriting a stable URL can leave users with different versions across cache locations. Content hashing makes each version addressable and avoids depending on immediate global purges.

Publish in this order:

```text
Upload new immutable assets
        ↓
Verify availability
        ↓
Publish HTML that references the new assets
```

Retain previous assets long enough for cached HTML and active browser sessions to continue using them.

### 5.4 CDN Failure Strategy

A single mature CDN with origin resilience and strong monitoring is often operationally simpler. Multi-CDN can improve resilience and regional optimization but adds cost, cache inconsistency, duplicated configuration, and invalidation coordination. Choose based on business impact, availability targets, and operational maturity—not theoretical reliability alone.

## 6. Deployment Strategies

Choose a rollout strategy based on blast radius, traffic control, and rollback requirements.

### 6.1 Rolling and Progressive Deployment

Progressive rollout increases traffic gradually, for example from internal users to small cohorts and then to all users. Each stage should have health gates for client errors, API failures, performance, conversion, and crashes.

### 6.2 Canary Release

A canary sends a small percentage of traffic to a new version while most users remain on the existing version. It requires traffic splitting, version-aware telemetry, reliable metrics, and a decision process for stopping or continuing the rollout.

### 6.3 Blue-Green Deployment

Blue-green deployment maintains a current environment and a candidate environment. After validation, traffic switches to the candidate; rollback routes traffic to the previous environment.

Benefits include fast rollback and clear environment separation. Costs can include duplicated infrastructure and challenges with cache consistency, data changes, and API compatibility.

### 6.4 Feature Flags

Feature flags separate deployment from release. A new capability can ship disabled and then be enabled gradually. Use kill switches for risky features, define safe behavior when the flag service is unavailable, and distinguish a safety rollout (“Is it safe?”) from an experiment (“Is it better?”).

## 7. Frontend and API Compatibility

Browsers can retain old HTML, JavaScript, service workers, or cached responses after a deployment. Older clients may continue calling APIs after a newer frontend is released. API and frontend changes therefore need compatibility windows.

### 7.1 Expand, Migrate, Contract

For a response schema change, use a staged approach:

1. **Expand:** Add the new field while retaining the old field.
2. **Migrate:** Deploy clients that consume the new field.
3. **Observe:** Measure whether old clients still use the old field.
4. **Contract:** Remove the deprecated field after the compatibility window.

Do not remove an API field before clients have had a chance to migrate.

### 7.2 Backward-Compatible Data Changes

A rollback may restore an older frontend that expects an older schema. Avoid destructive schema changes that make the previous version unusable. Add new fields first, migrate readers and writers, observe usage, and remove old fields only after rollback and client-retention windows have passed.

### 7.3 Rollback Readiness

A frontend rollback plan should account for:

- Which artifact or version will be restored.
- CDN and browser caches.
- Service-worker updates.
- Retention of old immutable assets.
- API compatibility with both old and new clients.
- Runtime configuration compatibility.
- Data and schema migration reversibility.

## 8. Preview and Runtime Environments

### 8.1 Preview Environments

A pull request can create an isolated preview URL for product, design, and QA review. Previews shorten feedback loops but introduce costs: infrastructure, test data, secrets management, environment cleanup, and external-service limits.

Restrict preview access, avoid exposing production credentials, and define automatic expiration and cleanup.

### 8.2 Staging and Production

Staging should validate the same artifact, routing model, cache behavior, headers, and runtime configuration approach used in production. Production should have controlled releases, monitoring, and tested rollback procedures.

### 8.3 Environment Ownership

Make it possible to answer which version is running in each environment and how it was produced. Environments should be reproducible from deployment definitions rather than manually mutated.

## 9. Deployment Observability and Governance

Deployment metadata is critical during incidents. Record at least:

```json
{
  "application": "consumer-web",
  "environment": "production",
  "version": "4.18.2",
  "commit": "a82f19c",
  "artifact": "frontend-spa:1842",
  "deployedAt": "2026-07-05T12:00:00Z",
  "rollout": "25%"
}
```

This makes it possible to answer what was deployed, where, when, by whom, from which commit and artifact, at what rollout percentage, and whether it can be rolled back.

Connect release health to client-side JavaScript errors, API failures, performance, conversion or task completion, and user impact. Tag telemetry with release version, region, browser, and environment where appropriate, while following privacy and data-minimization requirements.

## 10. Delivery Architecture Exercise

### Scenario

Design delivery for a frontend used by many engineering teams, deployed multiple times per day, and serving users globally. It includes a static SPA, a server-rendered application, multiple environments, and APIs that evolve independently.

### Step 1: Define the Pipeline

```text
Pull request
  → lint, types, affected tests, build, security checks
  → preview deployment
  → merge
  → immutable artifact
  → staging deployment and smoke tests
  → approval or policy gate
  → production canary
  → health monitoring
  → progressive traffic increase
```

### Step 2: Define Artifact and Configuration Boundaries

Build once, attach commit and build metadata, publish the immutable artifact, and promote that exact artifact. Keep public environment configuration separate and validated; keep secrets out of browser-delivered files.

### Step 3: Define Cache Policies

Use revalidation or short TTL for HTML, long immutable caching for hashed assets, and an explicit policy for runtime configuration. Upload assets before publishing HTML that references them.

### Step 4: Define Health Gates and Rollback

Select metrics and thresholds before rollout. Ensure prior assets remain available, APIs remain compatible with older clients, and service-worker behavior does not prevent recovery.

### Step 5: Exercise Failure Scenarios

Test a missing asset, stale HTML, runtime configuration failure, CDN cache miss spike, unhealthy canary, API schema transition, and rollback to the previous frontend version.

## 11. Architecture Trade-Offs

| Decision | Option A | Option B | Trade-off |
| -------- | -------- | -------- | --------- |
| Environment config | Build-time | Runtime | Simplicity and optimization vs. same-artifact promotion |
| CI test scope | Full suite per change | Affected tests | Coverage confidence vs. speed and cost |
| Artifact handling | Rebuild per environment | Build once and promote | Environment-specific convenience vs. reproducibility |
| Cache strategy | Stable URLs and purge | Content-hashed URLs | Simple paths vs. deterministic immutable caching |
| CDN strategy | Single CDN | Multi-CDN | Operational simplicity vs. additional failover and coordination |
| Rollout | All at once | Canary or progressive | Release speed vs. reduced blast radius |
| Deployment style | Rolling | Blue-green | Resource efficiency vs. fast environment-level rollback |
| Environment review | Shared staging | Per-PR preview | Lower infrastructure cost vs. isolated review context |

## 12. Module Outcomes

After completing this module, learners should be able to:

- Describe the frontend delivery path from source control to browser.
- Design CI pipelines for fast, risk-based feedback.
- Build, identify, and promote immutable artifacts.
- Compare build-time and runtime configuration.
- Define CDN cache policies for HTML, hashed assets, and runtime configuration.
- Plan canary, progressive, and blue-green releases.
- Preserve compatibility across frontend, API, cache, and schema versions.
- Design preview environments and production rollback procedures.
- Explain how deployment observability supports incident response.

The key design question is not only how code reaches production. It is how the exact tested artifact is delivered safely, how its health is measured, and how users recover when a release or dependency fails.
