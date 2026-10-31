# Rendering Architecture

## Module Goal

Design frontend systems that choose where, when, and how UI is rendered based on product requirements such as SEO, personalization, freshness, interaction density, latency, infrastructure cost, cacheability, deployment scale, and JavaScript bundle size.

Rendering architecture is not simply “CSR or SSR.” Modern applications often combine multiple rendering models across routes, page regions, and interactive components.

## Table of Contents

- [1. Rendering Fundamentals](#1-rendering-fundamentals)
- [2. Client-Side Rendering](#2-client-side-rendering-csr)
- [3. Server-Side Rendering](#3-server-side-rendering-ssr)
- [4. Static Site Generation](#4-static-site-generation-ssg)
- [5. Incremental Static Regeneration](#5-incremental-static-regeneration-isr)
- [6. Streaming SSR](#6-streaming-ssr)
- [7. Partial Hydration](#7-partial-hydration)
- [8. Islands Architecture](#8-islands-architecture)
- [9. Edge Rendering](#9-edge-rendering)
- [10. React Server Components](#10-react-server-components)
- [11. Rendering Decision Framework](#11-rendering-decision-framework)
- [12. Practice Scenarios](#12-practice-scenarios)

---

## 1. Rendering Fundamentals

Rendering describes where and when an application turns data and components into HTML and interactive UI.

### 1.1 Browser Rendering Lifecycle

Regardless of rendering strategy, the browser must process the delivered resources:

1. Receive HTML and discover referenced resources.
2. Parse HTML into a document structure.
3. Fetch and parse CSS.
4. Download and execute JavaScript as required.
5. Calculate layout and paint pixels.
6. Attach or activate interactions when client-side code is ready.

The rendering strategy changes how much useful content arrives in the initial response, how much work is done on the server, and how much JavaScript the browser must download and execute.

### 1.2 Rendering Models

| Model | When HTML/UI is produced | Typical strengths |
| ----- | ------------------------ | ----------------- |
| Client-side rendering (CSR) | In the browser after JavaScript loads | Rich interaction and low per-request render cost |
| Server-side rendering (SSR) | For each request, or from a server cache | Request-time data and initial HTML |
| Static site generation (SSG) | During a build | CDN delivery and low request-time compute |
| Incremental static regeneration (ISR) | Generated statically and refreshed later | Static delivery with periodic freshness |
| Edge rendering | At or near a user's edge location | Low-latency request-aware personalization |
| Streaming SSR | Server sends HTML progressively | Earlier useful content while slower regions complete |
| Partial hydration / islands | Static output plus selected interactive regions | Less client JavaScript for mostly static pages |
| React Server Components (RSC) | Components execute on the server with client boundaries | Server-side data access and reduced client component code |

These approaches can be combined. For example, a product page may use cached server-rendered HTML for its core content, stream reviews later, and hydrate only the image gallery and purchase controls.

## 2. Client-Side Rendering (CSR)

With CSR, the server commonly returns a minimal HTML shell and JavaScript renders the application in the browser:

```text
Browser → HTML shell → JavaScript bundle → API requests → rendered UI
```

In React, a client-rendered application mounts into the document. Hydration is a different process used when server-rendered HTML already exists.

### 2.1 Request Waterfall

A common first-load sequence is:

```text
Request HTML
  → Download HTML
  → Discover and download JavaScript
  → Parse and execute JavaScript
  → Discover data requirements
  → Fetch API data
  → Render useful UI
```

This waterfall can delay meaningful content, especially on slower devices or networks. Avoidable sequential API requests can add further latency; genuinely independent requests may be fetched in parallel.

### 2.2 SEO and Initial Content

Pure CSR may initially return little page content before JavaScript executes. Modern crawlers can execute some JavaScript, but relying on that can introduce indexing delays, crawler variability, social-preview problems, and metadata complexity.

CSR is often a strong fit when:

- SEO is not important.
- The application is authenticated and user-specific.
- Interaction density is high.
- Users spend longer sessions navigating client-side.
- A rich client experience matters more than server-generated initial HTML.

Examples include internal dashboards, admin applications, editors, and project-management tools.

### 2.3 Trade-Offs

**Benefits**

- Static assets can be served efficiently from a CDN.
- Lower request-time server rendering cost.
- Rich client-side navigation and interaction.
- A natural fit for highly interactive applications.

**Costs**

- JavaScript download, parse, and execution delay.
- Potentially large bundles and main-thread pressure.
- API waterfalls and delayed initial content.
- More work for lower-powered mobile devices.
- SEO and metadata may require additional rendering or prerendering strategies.

## 3. Server-Side Rendering (SSR)

With SSR, the server generates HTML for a request and returns it to the browser. The browser can display the HTML before client-side JavaScript enables interactions.

### 3.1 Benefits and Costs

SSR can improve initial content availability and support SEO-sensitive pages. It is useful when output depends on request-time information such as current data, geography, or a request-specific context.

However, SSR adds request-time work:

```text
SSR cost ≈ request volume × render CPU × data-fetch cost × runtime duration
```

High traffic can make per-request rendering expensive unless the output or underlying data can be cached safely.

### 3.2 Caching and Personalization

If a page is identical for many users, a CDN or server cache may reuse the rendered HTML. Personalized output makes caching more complicated.

Potential cache dimensions include:

- URL.
- Country or language.
- Authentication state.
- Experiment assignment.
- User segment.

As the number of combinations grows, cache cardinality can increase and hit rates can fall. Never share personalized or private HTML across users through an incorrectly configured cache.

SSR is a useful candidate when request-time data, freshness, personalization, or SEO is important. It may be a poor default when content is mostly static, request volume is very high, server cost matters, and CDN caching is effective.

### 3.3 SSR Does Not Guarantee Fast Pages

The server may have to wait for slow dependencies before returning the page. A slow API can increase time to first byte or delay useful content. Parallelize independent data fetches where appropriate, cache reusable results, and consider streaming or partial rendering when regions have different latency.

## 4. Static Site Generation (SSG)

SSG generates HTML during a build and serves the result as static files, commonly through a CDN.

### Benefits

- Low request-time rendering cost.
- Fast delivery from geographically distributed caches.
- Simple scaling for pages that can be prepared ahead of time.

### Trade-Offs

- Content can become stale until the next build or deployment.
- Very large page sets can increase build time and artifact size.
- Per-user or request-specific content cannot be baked into a shared page safely.

SSG is a strong fit for content that is known before a request and changes infrequently, such as documentation, marketing pages, or stable articles.

## 5. Incremental Static Regeneration (ISR)

ISR combines static generation with later regeneration or revalidation. Pages are delivered statically, then refreshed according to framework or platform policy.

Use ISR when content changes periodically but does not require perfect request-by-request freshness—for example, a product catalog that can tolerate a short refresh interval.

Consider:

- How stale a page may be.
- How regeneration is triggered and observed.
- What users see while a page is being regenerated.
- How cache invalidation works after important updates.
- Whether personalized data is kept out of shared generated output.

## 6. Streaming SSR

Traditional SSR may wait for all required data before sending a complete HTML response. Streaming SSR can send useful page regions as they become ready:

```text
Product details → sent first
Reviews         → streamed when ready
Recommendations → streamed when ready
```

Suspense boundaries or equivalent framework mechanisms can provide loading fallbacks for slower regions.

### Benefits

- Earlier first useful content.
- Slow dependencies need not block all page content.
- Natural loading and failure boundaries.
- Improved perceived performance even when total work remains similar.

### Trade-Offs

- More complex debugging and boundary design.
- Proxy or CDN buffering can prevent progressive delivery.
- Partial failure handling and hydration coordination need care.

Streaming changes when content reaches the user; it does not necessarily reduce backend work or total completion time.

Use traditional SSR when required data is fast and the page is simple. Consider streaming when independent sections have variable latency and progressive UX provides meaningful value.

## 7. Partial Hydration

Hydration attaches client-side behavior to server-rendered HTML. Traditional hydration may download and execute JavaScript for a large component tree even when only a few regions are interactive.

Partial or selective hydration aims to activate only the parts that need browser behavior:

```text
Static header
Static article
Static images
Interactive comments
Interactive share button
Static footer
```

This can reduce JavaScript download, parsing, execution, event setup, and main-thread work.

### Trade-Offs

- More architectural complexity.
- Component boundaries and shared state require planning.
- Framework and ecosystem support may constrain the design.

It is a useful approach for pages that are mostly content with a limited number of interactive widgets.

## 8. Islands Architecture

Islands architecture extends selective hydration with a static-first approach:

> Static HTML is the “ocean”; interactive components are isolated “islands.”

A media or news page might render the article, author, and images as static HTML while hydrating a stock widget, comments, and newsletter form separately.

### Benefits

- Less client JavaScript for mostly static pages.
- Reduced hydration work and main-thread pressure.
- Interactive features can be isolated to the components that need them.

### Trade-Offs

- Shared state between islands is less straightforward.
- Component and data boundaries require careful design.
- Highly interactive applications may not benefit from a static-first model.

Islands work well when most content is static and interactivity is limited to discrete widgets.

## 9. Edge Rendering

Edge rendering executes request-aware logic at or near a user's geographic location, often alongside CDN infrastructure.

Possible uses include:

- Selecting locale or currency.
- Rewriting a route.
- Choosing an experiment variant.
- Returning a cached or personalized page variant.

### Benefits

- Lower geographic latency for supported workloads.
- Request-time decisions close to the user.
- Potentially efficient routing and lightweight personalization.

### Trade-Offs

- Runtime APIs and execution limits may be constrained.
- Cold starts or platform limitations may apply.
- Distributed state, data locality, consistency, and observability become more complex.
- A nearby edge does not help if required dependencies remain far away.

Evaluate the entire request path and data dependencies, not just the location of the rendering function.

## 10. React Server Components

React Server Components (RSC) introduce a boundary between server-executed components and client components. Server components can fetch data in a server environment and avoid shipping their component implementation to the browser. Client components provide browser interactivity such as state, effects, and event handlers.

Example conceptual component tree:

```text
ProductPage [Server]
├── ProductInfo [Server]
├── Description [Server]
├── Reviews [Server]
└── AddToCart [Client]
    └── QuantitySelector [Client]
```

The aim is to keep non-interactive UI and suitable data work on the server while marking only the interactive boundaries for the client.

### 10.1 Serialization Boundary

Data passed from server components to client components crosses a serialization boundary. Serializable values can cross; functions and other server-only runtime values generally cannot be passed as ordinary props.

Treat this as an architectural boundary: consider serialization, ownership, execution location, security, and data transfer—not just component syntax.

### 10.2 Data Fetching and Bundle Size

Server components can access server-side services directly where supported, potentially avoiding an unnecessary browser-to-API-to-server round trip. Server-only component code can also reduce the client JavaScript bundle.

### 10.3 Trade-Offs

**Potential benefits**

- Less client JavaScript.
- Server-side data access and colocated fetching.
- Integration with streaming in supported frameworks.
- Fewer API layers for some architectures.

**Costs**

- A more complex server/client mental model.
- Serialization restrictions and boundary mistakes.
- Framework coupling, caching complexity, and debugging challenges.

Keep secrets and privileged data on the server, and return only the data required by the client component. RSC behavior depends on framework and runtime support.

## 11. Rendering Decision Framework

Avoid universal claims such as “SSR is always faster” or “SSG is always best for SEO.” Evaluate the page and its constraints.

### 11.1 Decision Dimensions

| Dimension | Questions |
| --------- | --------- |
| SEO | Must crawlers and social previews receive useful initial HTML and metadata? |
| Freshness | How quickly must changes appear? |
| Personalization | Does output vary by user, location, or experiment? |
| Interaction density | How much of the page needs client-side state and event handling? |
| Page count | Can all relevant pages be generated at build time? |
| Traffic and cost | What request volume and server rendering cost are expected? |
| Cacheability | Can output be safely reused across requests? |
| Geography | Are users far from the origin, and can dependencies also be served nearby? |
| JavaScript budget | How much code must be downloaded and executed on client devices? |
| Build time | Will static generation create an impractical build or deployment? |

### 11.2 CSR vs. SSR

**CSR is a strong candidate when:**

- SEO and initial public content are low priority.
- The application is authenticated and user-specific.
- Interaction density and long client-side sessions are high.

**SSR is a strong candidate when:**

- Initial content and SEO matter.
- Data depends on request-time context.
- Content is too dynamic to generate ahead of time.

SSR can still require substantial client JavaScript for interactivity; server rendering alone does not eliminate client performance concerns.

### 11.3 SSR vs. SSG

Ask whether the HTML can be safely generated before the request:

- **Yes:** Consider SSG, especially when content is stable and cacheable.
- **No:** Consider SSR or another request-aware rendering model.

Use SSR for request-specific or frequently changing content. Use SSG for content known at build time.

### 11.4 SSG vs. ISR

- Choose **SSG** when content changes only with a deployment.
- Choose **ISR** when content changes periodically and a bounded period of staleness is acceptable.

An about page may suit SSG; a product catalog with periodic updates may suit ISR.

### 11.5 Traditional SSR vs. Streaming

- Traditional SSR may be sufficient when required data is fast and the page is simple.
- Streaming is valuable when independent regions have variable latency and progressive rendering improves the experience.

### 11.6 Combine Models by Route and Region

A realistic application may use:

- SSG for documentation and marketing.
- ISR for periodically refreshed product content.
- SSR for request-specific public pages.
- CSR for authenticated, highly interactive tools.
- Streaming for pages with slow, optional sections.
- Islands or partial hydration for content pages with a few interactive widgets.
- Edge rendering for lightweight request-aware decisions.

Choose the rendering model at the page or region level where the framework allows it, rather than forcing one strategy across the entire application.

## 12. Practice Scenarios

### 12.1 Product Detail Page

Consider SEO, price and inventory freshness, personalization, and caching. A page may render shareable product content on the server or from a static cache, while isolating interactive image galleries, quantity selection, and add-to-cart behavior as client components. Optional reviews or recommendations may stream or load independently.

### 12.2 Admin Dashboard

SEO is usually irrelevant, data is user-specific, and interaction density is high. CSR can be a strong fit. Improve the initial experience with a lightweight shell, parallelize independent data requests, and show clear loading and partial-failure states.

### 12.3 Documentation or Marketing Site

Content is often known before the request and highly cacheable. SSG or a static-first/islands approach can provide fast CDN delivery while limiting JavaScript to interactive widgets.

### 12.4 Personalized Global Page

If the page depends on locale, experiment assignment, or request context, consider SSR or edge rendering. Define safe cache keys and avoid sharing personalized HTML between users. Verify that required APIs and data are available near the rendering location.
