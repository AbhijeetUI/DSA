# Frontend Performance Engineering

## Module Goal

Design frontend systems for measurable, scalable, and sustainable performance across devices, networks, geographies, releases, and teams.

Performance engineering is not simply “make the page load faster.” It is a continuous discipline:

```text
Define → Measure → Diagnose → Optimize → Validate → Monitor → Prevent regressions
```

Frontend performance is a system property. Network latency, backend response, caching, images, JavaScript, hydration, main-thread work, rendering, third-party scripts, and release practices can all affect the user experience.

## Table of Contents

- [1. Performance Fundamentals](#1-performance-fundamentals)
- [2. Core Web Vitals and User Experience](#2-core-web-vitals-and-user-experience)
- [3. Asset Optimization](#3-asset-optimization)
- [4. Network Optimization](#4-network-optimization)
- [5. Build and Bundle Optimization](#5-build-and-bundle-optimization)
- [6. JavaScript and Main-Thread Optimization](#6-javascript-and-main-thread-optimization)
- [7. React Optimization](#7-react-optimization)
- [8. Loading Strategies](#8-loading-strategies)
- [9. Performance Budgets](#9-performance-budgets)
- [10. Performance Monitoring and Regression Prevention](#10-performance-monitoring-and-regression-prevention)
- [11. Performance Engineering Workflow](#11-performance-engineering-workflow)
- [12. Practice Scenarios](#12-practice-scenarios)

---

## 1. Performance Fundamentals

Frontend performance spans several connected layers:

| Layer | Common concerns |
| ----- | --------------- |
| Network | Latency, bandwidth, request count, cacheability, geographic distance |
| CPU | JavaScript parsing, compilation, execution, event handlers, rendering |
| Memory | DOM size, caches, retained objects, garbage collection |
| Rendering | Style calculation, layout, paint, compositing, layout thrashing |
| Perception | Feedback, progressive content, loading states, interaction response |

### 1.1 Performance Lifecycle

A mature performance lifecycle is continuous:

1. Define user and business performance goals.
2. Measure representative routes, devices, and user journeys.
3. Diagnose the dominant bottleneck.
4. Change one or more contributing factors.
5. Validate both the targeted metric and related user experience.
6. Monitor production behavior and prevent regressions.

Avoid optimizing based only on intuition. A large bundle may be a problem, but a slow backend, a delayed hero image, or long main-thread tasks may dominate the actual experience.

### 1.2 Network, CPU, Memory, and Rendering

- **Network performance** depends on transferred bytes, round trips, request dependencies, cache reuse, and distance to the origin.
- **CPU performance** depends on the work required to parse and execute JavaScript, process events, and render updates.
- **Memory performance** is affected by retained DOM nodes, unbounded caches, event listeners, and objects that remain reachable.
- **Rendering performance** includes style calculation, layout, paint, and compositing.

Alternating layout reads and writes can force repeated synchronous layout (layout thrashing). Batch reads before writes where possible, and profile before rewriting code.

### 1.3 User-Perceived Performance

Technical completion time and perceived speed can differ. Immediate feedback, skeletons, progressive loading, optimistic updates, preserving existing content, and prioritizing above-the-fold resources can make an experience feel more responsive.

These techniques must represent real progress and avoid unnecessary animation, visual noise, and layout shifts.

## 2. Core Web Vitals and User Experience

Core Web Vitals focus on loading, responsiveness, and visual stability. Commonly used “good” targets at the 75th percentile are:

| Metric | What it measures | Good target |
| ------ | ---------------- | ----------- |
| LCP (Largest Contentful Paint) | Loading of the largest visible content element | 2.5 seconds or less |
| INP (Interaction to Next Paint) | Responsiveness across user interactions | 200 milliseconds or less |
| CLS (Cumulative Layout Shift) | Unexpected layout movement | 0.1 or less |

Teams should validate current measurement definitions and thresholds against their target browser and product requirements.

### 2.1 LCP

LCP measures when the largest visible content element is rendered. Typical candidates include a hero image, product image, large heading, or prominent content block.

Common causes of slow LCP:

- Slow TTFB or server processing.
- Late discovery of the critical image or data.
- Oversized images.
- Client-only rendering that delays content.
- Render-blocking CSS or excessive initial JavaScript.
- Poor CDN or cache strategy.

Make the LCP resource discoverable early. Do not lazy-load an above-the-fold image that is likely to be the LCP element. Set appropriate dimensions and use resource prioritization carefully; marking too many resources as high priority defeats prioritization.

### 2.2 INP

INP captures the delay between user interactions and the next visual update, including input delay, event processing, and presentation delay.

Common causes include long JavaScript tasks, expensive component renders, synchronous loops, heavy event handlers, excessive DOM updates, and third-party scripts.

Prioritize the minimum work required for the next visible response. Defer analytics or recommendations when they are not necessary for immediate feedback.

### 2.3 CLS

CLS measures unexpected visual movement. Common causes include images without reserved dimensions, dynamically inserted ads, late-loading fonts, banners inserted above content, and widgets that change size after loading.

Reserve layout space when practical:

```html
<img src="/product.jpg" width="800" height="600" alt="Product" />
```

For dynamic slots, define an appropriate minimum size. Reserving space can create whitespace when content does not load, so choose dimensions based on product behavior and measured impact.

### 2.4 TTFB and FCP

- **TTFB (Time to First Byte)** measures how long the browser waits for the first response byte. It can be affected by DNS and connection setup, geographic distance, cache misses, cold starts, backend queries, and server-side rendering.
- **FCP (First Contentful Paint)** measures when the first content appears. Render-blocking CSS, server-rendered HTML, critical CSS, font strategy, and initial JavaScript all affect it.

These metrics help diagnose different parts of the request and rendering path; improving one does not automatically improve all others.

## 3. Asset Optimization

Images, fonts, and video can dominate transferred bytes. Optimize assets based on their role, visibility, and quality requirements.

### 3.1 Images

Avoid downloading a source image many times larger than its rendered dimensions. Provide responsive variants and let the browser select an appropriate resource:

```html
<img
  src="/product-640.jpg"
  srcset="/product-320.jpg 320w, /product-640.jpg 640w, /product-960.jpg 960w"
  sizes="(max-width: 640px) 100vw, 640px"
  width="640"
  height="480"
  alt="Product"
/>
```

Use lazy loading for below-the-fold media, not critical above-the-fold content. Reserve intrinsic dimensions or an aspect ratio to avoid layout shifts.

### 3.2 Image Formats

- **WebP** often provides smaller files than legacy formats while retaining broad browser support.
- **AVIF** can provide strong compression and visual quality, but encoding cost and decode behavior should be tested for the product.
- **SVG** is well suited to icons, logos, and simple illustrations. Complex SVGs with many paths can be expensive; handle untrusted SVG carefully because it may contain active content depending on use.

Provide sensible format fallbacks where needed:

```html
<picture>
  <source srcset="/hero.avif" type="image/avif" />
  <source srcset="/hero.webp" type="image/webp" />
  <img src="/hero.jpg" alt="Hero" />
</picture>
```

### 3.3 Fonts

Fonts can delay text rendering and cause layout shifts. Ship only required families and weights, subset character sets when appropriate, and prefer efficient formats such as WOFF2.

Preload only critical fonts. `font-display: swap` can show fallback text quickly but may cause a visual change when the custom font loads; other strategies have different visibility and swap trade-offs.

### 3.4 Video and Compression

Video can dominate page weight. Use an appropriate poster, defer offscreen or nonessential playback, select suitable resolutions, and consider adaptive streaming for long or high-resolution media.

Use Brotli or gzip for compressible text resources such as HTML, CSS, JavaScript, and JSON. Avoid spending CPU recompressing already compressed formats such as JPEG, PNG, MP4, or AVIF. Precompress static assets where practical and serve the correct variants from the CDN.

## 4. Network Optimization

Network optimization aims to reduce transferred bytes, request count, and round trips; improve cacheability; prioritize critical resources; and move content closer to users.

### 4.1 CDN and Caching

A CDN can reduce latency, reuse connections, cache content, protect the origin, and absorb traffic. Trade-offs include invalidation, stale content, provider cost, and cache-key complexity.

Design cache keys and lifetimes deliberately. Personalized or private responses must not be shared across users. Track cache hit rates and ensure invalidation matches the freshness requirements.

### 4.2 Connection and Resource Hints

- **DNS prefetch** resolves a likely future origin. Too many speculative lookups waste resources.
- **Preconnect** may establish DNS, transport, and TLS connections before a critical request. Use it for a small number of important origins.
- **Preload** fetches a resource that is critical but may be discovered late, such as a hero image or critical font. Incorrect preloads can compete with more important resources.
- **Prefetch** fetches resources for likely future navigation, ideally when the browser is idle. It can waste bandwidth when navigation is uncertain, especially on metered or mobile connections.

Prioritize requests deliberately. If every image and script is marked high priority, no resource receives meaningful preference.

### 4.3 Connections and Compression

Modern HTTP protocols support connection reuse and multiplexing. Excessive domain sharding can add DNS lookups, connection setup, and TLS negotiation; balance isolation needs against connection reuse.

Coordinate compression across the origin, reverse proxy, CDN, and browser. Compress text resources once in the delivery path and verify the actual content-encoding and cache behavior.

## 5. Build and Bundle Optimization

A typical production pipeline transforms source code into browser resources:

```text
Source → Compile → Transform → Tree shake → Minify → Split → Compress → Deploy
```

### 5.1 Minification and Dead Code

Minification reduces transfer size but can make production debugging harder; retain source maps with appropriate access controls.

Tree shaking and dead-code elimination remove unused exports and unreachable code, but dynamic module patterns and side effects can limit optimization. Remove abandoned experiments, obsolete feature flags, unused polyfills, and legacy code that is no longer needed.

### 5.2 Code Splitting and Chunking

Split code by route or feature so users download only what they need. Avoid both extremes:

- Too little splitting creates a large initial bundle.
- Too much splitting creates many tiny chunks, coordination overhead, possible waterfalls, and cache complexity.

Chunk boundaries should consider route usage, shared dependencies, and update frequency. A single oversized vendor chunk may be invalidated by an unrelated dependency change.

### 5.3 Dynamic Imports and Bundle Analysis

Load infrequently used features on demand, such as admin tools, charting libraries, rich-text editors, and map views. Do not defer critical above-the-fold UI if doing so harms LCP.

Use bundle analysis to identify large dependencies, duplicate packages, unexpected polyfills, unused locale data, and multiple versions of the same library. Optimize the measured source of weight rather than guessing.

## 6. JavaScript and Main-Thread Optimization

JavaScript has costs beyond transfer size: parsing, compilation, execution, memory allocation, garbage collection, and potential DOM updates.

### 6.1 Long Tasks and Web Workers

Long main-thread tasks can delay input, scrolling, animation, and rendering. Reduce unnecessary work, split tasks into smaller units, yield between chunks, or move suitable computations to a Web Worker.

Workers are useful for CPU-intensive operations such as image processing, large JSON transformations, search indexing, and cryptographic work. They cannot directly manipulate the DOM, and message serialization and data transfer add overhead.

### 6.2 Scheduling, Debouncing, and Throttling

Prioritize visible and interactive work over analytics, speculative prefetching, and background processing.

- **Debounce** when only the final event matters, such as search input. Higher delays reduce request count but make results feel slower.
- **Throttle** when updates should happen at a controlled rate, such as scroll, mouse movement, or resize handling. Lower frequency reduces CPU but may reduce visual smoothness.

### 6.3 Memory Management

Unbounded caches, retained event listeners, and long-lived references can cause memory growth. Use bounded caches, TTL or LRU eviction, and lifecycle cleanup where appropriate. More caching can reduce network work but consumes memory; choose limits based on observed usage.

## 7. React Optimization

Common sources of React performance problems include unnecessary renders, expensive render calculations, unstable references, broad context updates, large DOM trees, and poorly placed state.

### 7.1 Measure Before Optimizing

Not every re-render is a problem. Profile the affected interaction and component tree before introducing memoization or architectural complexity.

### 7.2 Memoization

`React.memo`, `useMemo`, and `useCallback` can help when rendering or calculation is expensive and inputs remain stable. They also add dependency tracking, memory use, and complexity; stale dependencies can create bugs.

Memoization is less useful for cheap calculations or components whose props change on every render. Use stable function identity when it enables a meaningful optimization, such as allowing a memoized child to skip work.

### 7.3 Virtualization

For very large tables, feeds, logs, or dropdowns, render the visible window plus a small buffer rather than creating DOM nodes for every item.

Trade-offs include accessibility, dynamic row heights, browser find behavior, SEO, and scroll restoration. Validate these behaviors as part of the design.

### 7.4 Concurrent Rendering

Concurrent rendering techniques can help prioritize urgent updates, such as keeping typed input responsive while a large result list updates at lower priority. Treat them as tools for scheduling and user experience—not substitutes for reducing excessive computation.

## 8. Loading Strategies

Loading architecture strongly affects perceived performance.

### 8.1 Lazy and Progressive Loading

Lazy-load routes, components, and media that are not immediately needed. Progressive loading can prioritize a product title, price, and hero image, then load reviews and recommendations later.

Avoid deferring content that is critical to the initial view or likely to be the LCP element.

### 8.2 Skeleton Screens

Skeletons can provide immediate feedback and reserve space while content loads. Poorly designed skeletons can create visual noise, fake progress, or make fast operations feel slower. Keep their geometry close to the eventual content to reduce layout movement.

### 8.3 Optimistic UI

For low-risk actions, update the UI immediately and reconcile with the server response. Keep the optimistic state on success and roll it back with clear feedback on failure.

Optimistic updates work well for actions such as likes or simple preferences. They are riskier for payments, irreversible operations, or inventory guarantees because rollback and consistency are more complex.

## 9. Performance Budgets

Performance budgets turn “try to keep it fast” into measurable limits that teams can review and enforce.

Budgets may include:

- Initial and route-level JavaScript size.
- Third-party JavaScript size.
- Image size and dimensions.
- Request count.
- Core Web Vitals and other product-specific SLOs.
- Build time or runtime resource consumption.

Example budgets should be selected for the application and its audience rather than copied as universal thresholds. Automate checks in the build or CI pipeline where possible, report meaningful regressions, and define an explicit process for reviewing exceptions.

## 10. Performance Monitoring and Regression Prevention

Optimization without monitoring eventually regresses. Combine laboratory tests with production measurements.

### 10.1 Lab and Field Data

- **Lab data** comes from controlled tests and is useful for repeatable diagnosis and pre-release comparisons.
- **Field data** comes from real users and captures actual devices, networks, routes, and interaction patterns.

Lab results are reproducible but may not represent the full user population. Field data reflects reality but can vary and requires careful aggregation and segmentation.

### 10.2 Real User Monitoring and Synthetic Monitoring

Real User Monitoring (RUM) collects performance signals from actual sessions. Synthetic monitoring runs controlled journeys periodically or on key releases.

Track meaningful dimensions such as route, device class, browser, geography, release, and network quality while minimizing collection of unnecessary personal data.

### 10.3 Regression Prevention

Establish baselines, alert on sustained regressions, and compare releases. Use bundle reports, browser performance traces, and field metrics together to find both code-level and system-level causes.

## 11. Performance Engineering Workflow

Use a repeatable workflow for each performance issue:

1. Define the user journey and target metric.
2. Capture a baseline across representative conditions.
3. Identify the critical path and bottleneck.
4. Choose the smallest change that addresses the measured cause.
5. Validate the target metric and check for regressions in related metrics.
6. Roll out safely and monitor field behavior.
7. Record the result and update budgets or alerts when appropriate.

Avoid optimizing one metric in isolation. For example, inlining a large amount of CSS may improve first paint in one scenario while increasing HTML size, TTFB, transfer time, and cache inefficiency.

## 12. Practice Scenarios

### 12.1 Slow Product Page

Inspect the LCP element, TTFB, product-data waterfall, image dimensions, and resource priority. Ensure the hero image is discoverable early and not lazy-loaded when it is above the fold. Measure the impact of CDN caching and format selection.

### 12.2 Laggy Search

Profile input delay, event processing, list rendering, and network request volume. Debounce requests when appropriate, keep input feedback urgent, move expensive computation off the main thread if useful, and virtualize very large result lists.

### 12.3 Layout Shifts on a Content Page

Inspect images, fonts, advertisements, and late widgets. Reserve space for expected content, tune font loading, and verify CLS in both lab and field data.

### 12.4 Growing Application Bundle

Analyze route-level bundles, duplicate dependencies, locales, polyfills, and third-party scripts. Remove obsolete code, split route-specific features, and lazy-load noncritical libraries without delaying critical content.

### 12.5 Performance Regressions After Release

Compare field metrics by release, route, device, and geography. Reproduce the change with synthetic tests or a lab profile, inspect the critical path and bundle diff, then add a targeted budget or alert to prevent recurrence.
