# Frontend Architecture Patterns

## Module Goal

Design frontend applications that scale across teams, business domains, repositories, technology stacks, and deployment boundaries.

This module focuses on architecture decisions beyond folder structure:

- How can many teams deliver without constantly blocking each other?
- Where should business and technical boundaries exist?
- When should a frontend remain a monolith or evolve into microfrontends?
- Who owns shared state and cross-application communication?
- Which composition, repository, and deployment strategies fit the organization?
- How can an architecture avoid becoming a distributed monolith?

## Table of Contents

- [1. Architecture Fundamentals](#1-architecture-fundamentals)
- [2. Monolith Frontend](#2-monolith-frontend)
- [3. Microfrontends](#3-microfrontends)
- [4. Composition Strategies](#4-composition-strategies)
- [5. Microfrontend Communication](#5-microfrontend-communication)
- [6. Monorepo vs. Polyrepo](#6-monorepo-vs-polyrepo)
- [7. A Scalable Architecture for 20+ Teams](#7-a-scalable-architecture-for-20-teams)
- [8. Shared Platform and State Ownership](#8-shared-platform-and-state-ownership)
- [9. Deployment, Reliability, and Failure Isolation](#9-deployment-reliability-and-failure-isolation)
- [10. Decision Checklist](#10-decision-checklist)

---

## 1. Architecture Fundamentals

Frontend architecture is primarily about **boundaries, ownership, dependencies, and change**. Folder structure is a visible consequence of those decisions, not the architecture by itself.

### 1.1 Modular Architecture

A modular frontend divides the application into understandable units with explicit public APIs:

```text
src/
├── auth/
├── catalog/
├── cart/
├── checkout/
├── payments/
└── shared/
```

A module should expose a small public surface and keep implementation details private:

```text
catalog/
├── components/
├── services/
├── hooks/
├── models/
├── internal/
└── index.ts
```

Consumers should import through the module boundary rather than reaching into internal paths. Modularity improves reasoning and testing, reduces accidental coupling, and can support incremental evolution without introducing the operational cost of microfrontends.

Use it when capabilities are distinguishable, multiple teams contribute, or modules evolve at different rates. Avoid both an unstructured shared codebase and excessive package fragmentation.

### 1.2 Layered Architecture

Layered architecture organizes code by responsibility:

```text
Presentation → Application Workflows → Domain Rules → Infrastructure
```

For example, the UI presents a checkout action, the application layer coordinates the order workflow, the domain layer enforces business rules, and infrastructure communicates with APIs and storage.

Stronger layering can improve testability and isolate business rules from infrastructure. It can also create unnecessary indirection for simple CRUD features. Apply enough separation to clarify responsibilities without adding ceremony.

### 1.3 Feature-Based Architecture

Organize related code by business capability rather than separating all components, hooks, and services into global technical folders:

```text
features/
├── search/
│   ├── components/
│   ├── hooks/
│   ├── api/
│   └── state/
├── cart/
└── checkout/
```

This keeps a feature's UI, state, API integration, and tests close together. It can improve team ownership and make obsolete capabilities easier to remove. Domain boundaries—such as who owns coupons or pricing—still require explicit decisions.

### 1.4 Domain-Driven Frontend

Align code ownership with business domains:

```text
domains/
├── identity/
├── catalog/
├── search/
├── pricing/
├── cart/
├── checkout/
└── orders/
```

A domain may own its UI, state, API integration, models, analytics, tests, and feature configuration. The source of truth for cross-cutting concepts such as product price must be explicit; otherwise, domain boundaries become a source of duplicated and conflicting business rules.

### 1.5 Vertical Slices

A vertical slice contains what is needed to deliver one user capability, instead of spreading that capability across horizontal UI, API, and state layers:

```text
search/
├── SearchPage.tsx
├── useSearch.ts
├── searchApi.ts
├── searchState.ts
└── tests/
```

Vertical slices can improve feature cohesion and ownership. Some duplication may be preferable to premature sharing; extract common code when the shared contract is stable and has clear ownership.

### 1.6 Dependency Boundaries

Dependencies should follow an intentional direction. Cycles create unpredictable changes, circular imports, and unclear ownership.

Example:

```text
Applications → Features → Domains → Shared Infrastructure
```

Avoid allowing shared infrastructure to depend on business features or letting domain packages depend on application shells. A `shared` package filled with cart, checkout, pricing, and search rules is a hidden business monolith, not shared infrastructure.

Enforce boundaries with package exports, lint rules, dependency graphs, and code review.

## 2. Monolith Frontend

A frontend monolith is usually built, tested, versioned, and deployed as one application:

```text
ecommerce-web/
├── home/
├── search/
├── catalog/
├── cart/
├── checkout/
├── payments/
└── orders/
```

### Strengths

- Simple development and deployment model.
- Shared state, routing, and design system are straightforward.
- One runtime is easier to debug.
- Atomic changes can update related UI and API integration together.
- Fewer runtime network and compatibility failure modes.

### Scaling Challenges

As the number of teams and engineers grows, a monolith can experience:

- Slow CI from building and testing the entire application for every change.
- Ownership conflicts in shared files, routing, state, and package configuration.
- Release coupling when teams require different deployment frequencies.
- Large blast radius when a feature or dependency breaks application startup.

Do not adopt microfrontends merely because a repository or bundle is large. A well-modularized monolith is often preferable to poorly designed microfrontends.

## 3. Microfrontends

Microfrontends apply distributed ownership ideas to frontend systems. Capabilities may be developed and deployed by separate teams and composed by a shell or through routes.

### 3.1 When They Help

The strongest reason is often organizational scalability: many domain teams cannot safely deliver through one coordinated frontend release process. Microfrontends can support:

- Clear domain ownership.
- Independent roadmaps and release schedules.
- Separate CI pipelines and rollback boundaries.
- Technology differences where they are justified.

These are capabilities, not automatic benefits. If a remote requires a specific shell, shared state package, and auth SDK release in lockstep, the system is still a **distributed monolith**.

### 3.2 Trade-Offs

Independent ownership can increase:

- Inconsistent user experience and duplicated platform work.
- Runtime failures and network dependencies.
- Compatibility and shared-dependency conflicts.
- Bundle size, performance overhead, and observability complexity.
- Governance and integration work.

Technology independence does not mean every team should choose a different framework. A consistent platform can reduce operational cost while preserving domain ownership.

## 4. Composition Strategies

Different parts of a product can use different composition methods. Choose the weakest and simplest boundary that meets deployment, isolation, and ownership requirements.

### 4.1 Build-Time Composition

The host imports a feature package and compiles it with the application.

**Benefits:** Predictable runtime, compile-time checks, easier debugging, and simpler deployment.

**Trade-off:** A feature update requires rebuilding and redeploying the host, so deployment is not independent.

Use it when coordinated releases are acceptable and compile-time safety is valuable.

### 4.2 Runtime Composition and Module Federation

A shell can load modules from independently built remote applications at runtime. Module Federation is one approach; typical concepts include a host, remotes, exposed modules, shared dependencies, and runtime loading.

**Benefits:** Dynamic loading and the possibility of independently deploying domain-owned remotes.

**Trade-offs:** Network/runtime failures, version conflicts, compatibility risks, harder observability, and shared dependency coordination.

Use runtime composition only where independent deployment creates meaningful organizational value. Define compatibility contracts and fallback behavior; do not assume that remote availability is guaranteed.

### 4.3 Iframe-Based Microfrontends

An iframe creates a separate document and JavaScript context, with stronger browser-native isolation than shared-runtime composition.

It can fit payment flows, third-party widgets, partner portals, legacy applications, or untrusted content where isolation is more important than seamless integration.

**Trade-offs:** Responsive layout, focus, accessibility, browser history, styling, performance, and cross-frame communication are more complex.

Use a restrictive sandbox and validate message origins, schemas, and authorization context. Do not select iframes solely to achieve independent deployment.

### 4.4 Web Components

Custom Elements and Shadow DOM can provide reusable browser-native components across React, Angular, Vue, and plain JavaScript applications.

They can reduce style collisions and support cross-framework distribution. Evaluate framework integration, event conventions, forms, SSR, developer experience, and Shadow DOM styling constraints. Use Web Components when cross-framework reuse is a real requirement, not just because they are framework-agnostic.

### 4.5 Route-Based Micro Apps

Route-based composition assigns major user journeys to domain teams:

```text
/search/*    → Search
/product/*   → Catalog
/cart/*      → Cart
/checkout/*  → Checkout
/orders/*    → Orders
/account/*   → Identity
```

This can provide clearer ownership, stronger failure boundaries, and simpler independent deployment than composing many remotes into every page.

### 4.6 Choosing a Composition Strategy

| Requirement | Possible starting point |
| ----------- | ----------------------- |
| Shared application, coordinated releases | Modular monolith or build-time packages |
| Independent route ownership | Route-based micro apps |
| Runtime composition with independently operated teams | Module Federation or similar, with strong contracts |
| Untrusted content or strong isolation | Sandboxed iframe |
| Cross-framework reusable UI component | Web Component |

These are starting points; validate them against performance, accessibility, security, and operational capability.

## 5. Microfrontend Communication

Prefer the weakest communication mechanism that satisfies the requirement:

1. **URL:** Share navigation and bookmarkable state.
2. **Props:** Use explicit parent-child contracts.
3. **Backend state:** Let domains persist and retrieve authoritative business state.
4. **Custom events:** Notify other parts of a lightweight fact.
5. **Shared state:** Use narrowly and only for truly cross-cutting state.
6. **Event bus:** Introduce only when justified and governed.

### 5.1 Props

Props provide explicit, local, and often type-safe contracts for parent-child composition. They create direct composition dependency, which is usually appropriate within a component tree.

### 5.2 Custom Events and Event Buses

Custom events can loosely couple runtime participants, but event discovery, schema evolution, and debugging become harder. Use namespaced, versioned event names and stable payload contracts. Unrestricted event buses can turn into “event spaghetti.”

### 5.3 Shared State

A global store may simplify integration but can make every microfrontend depend on the same runtime and release contract. Keep state with the domain that owns it; avoid putting all business state in a global store.

### 5.4 Share References, Not Whole Business Objects

Prefer a flow where:

- Search navigates to a product using a URL.
- Product adds an item through the cart API and emits a lightweight `cart:item-added` notification for a badge.
- Checkout receives a cart identifier and fetches authoritative cart state.

Do not pass the entire cart through a global event bus. The backend or owning domain should remain the source of truth for business state.

## 6. Monorepo vs. Polyrepo

### Monorepo

A monorepo can support shared platform packages, atomic migrations, dependency visibility, standardized tooling, and affected-project builds.

```text
commerce-monorepo/
├── apps/
│   ├── shell/
│   ├── search/
│   ├── catalog/
│   ├── cart/
│   └── checkout/
├── packages/
│   ├── design-system/
│   ├── auth-client/
│   ├── analytics/
│   └── observability/
└── tooling/
```

Affected builds can run tests and builds only for changed applications and their dependents, provided the dependency graph accurately captures imports and generated dependencies.

### Polyrepo

Separate repositories can suit teams that need strong access control, independent lifecycle, or organizational separation. They increase coordination, versioning, and integration overhead.

### Hybrid

A hybrid strategy is often more practical than an ideological choice: keep shared frontend platform and tightly integrated applications together, while separating domains with genuinely independent security, ownership, or lifecycle requirements.

## 7. A Scalable Architecture for 20+ Teams

Consider a global commerce organization with many teams, web clients, frequent releases, multiple languages, and strong performance and SEO needs.

### 7.1 Identify Architectural Drivers

**Organizational**

- Independent team roadmaps and release frequencies.
- Clear ownership across business domains.

**Product**

- Consistent customer experience.
- Shared authentication, navigation, localization, and experimentation.

**Technical**

- Performance, SEO/SSR, rollback, and observability.
- Independent delivery without fragile runtime coordination.

### 7.2 Define Domain Boundaries

One possible grouping:

| Domain | Example capabilities |
| ------ | -------------------- |
| Customer Platform | Identity, profile, preferences |
| Discovery | Home, search, recommendations |
| Catalog | Product details, reviews, availability |
| Commerce | Cart, checkout, promotions |
| Payments | Payment methods and transactions |
| Post-Purchase | Orders, returns, customer support |

The domain boundary should match ownership and change patterns, not just the current folder layout.

### 7.3 Use Hybrid Composition

A practical design may combine:

- An application shell for navigation, session context, global observability, and error boundaries.
- Route-based applications for major domains and user journeys.
- Runtime composition only for page regions that truly benefit from independent deployment.
- Build-time packages for stable shared platform capabilities.

Not every feature needs the same composition strategy. Too many runtime remotes can add requests and failure points to every page.

### 7.4 Keep Critical Paths Independent

On a product page, primary product information and the buy action should not fail because optional recommendations or advertisements are unavailable. Load optional regions independently, provide fallbacks, and preserve the critical journey.

## 8. Shared Platform and State Ownership

### 8.1 Shared Platform Packages

Shared packages should provide stable platform capabilities such as:

- Design system and tokens.
- Authentication client.
- Analytics and experimentation SDKs.
- Observability and localization.
- API client conventions and tooling.

Keep domain-specific business rules owned by their domain. Shared packages that accumulate cart discounts, checkout rules, and search ranking become a hidden central business monolith.

### 8.2 State Ownership

Keep state with the smallest owner that can manage it:

| State | Typical owner |
| ----- | ------------- |
| Authentication session, locale, theme, currency context | Application shell/platform |
| Search filters and search results | Search domain |
| Cart | Cart domain/backend |
| Checkout workflow | Checkout domain |
| Payment state | Payments domain |
| Order history | Orders domain |

Avoid one global store that owns every domain's business state. Shared state creates coupling and makes independent deployment harder.

## 9. Deployment, Reliability, and Failure Isolation

### 9.1 Deployment Pipeline

A platform pipeline can build and validate affected projects, run unit and contract tests, publish immutable artifacts, deploy, smoke test, and roll out progressively:

```text
Commit
  → Affected dependency graph
  → Build and tests
  → Contract checks
  → Immutable artifact
  → Smoke test
  → Canary / progressive rollout
```

Runtime manifests can point to versioned remote artifacts and support rollback without rebuilding the shell, provided compatibility is maintained.

### 9.2 Compatibility and Independent Deployment

Independent deployment requires more than separate pipelines. Define:

- Stable interfaces and versioning policy.
- Compatibility between shell, remotes, and shared packages.
- Runtime health signals and rollback criteria.
- How breaking changes are introduced without lockstep releases.

If teams must coordinate every release, revisit boundaries and shared contracts.

### 9.3 Failure Isolation

Use error boundaries and independent loading states around optional features. A recommendations failure should not make product information or checkout unavailable.

Design failure boundaries around business criticality:

- Core purchase and authentication paths receive stronger availability guarantees.
- Optional content can use a fallback or be omitted.
- A remote's load or render failure should be observable and recoverable.

## 10. Decision Checklist

Before introducing a new architectural boundary, ask:

1. What organizational or product problem does this boundary solve?
2. Which team owns the capability, API, runtime behavior, and on-call response?
3. Is independent deployment truly required?
4. Can a modular monolith or build-time package meet the need with less complexity?
5. What is the runtime and performance cost of composition?
6. How are shared dependencies and contract changes managed?
7. Where does state live, and which domain is authoritative?
8. How do features communicate without creating hidden coupling?
9. What happens when a remote, shared package, or optional service fails?
10. Can the system be deployed, observed, and rolled back independently in practice?

The goal is not maximum distribution. The goal is clear ownership, controlled dependencies, reliable delivery, and a user experience that remains coherent as teams and products grow.
