# Web, Networking & API Foundations

## Module Objective

By the end of this module, you should be able to:

- Explain what happens when a user enters a URL in a browser.
- Describe browser-to-server communication, including DNS, TCP, TLS, HTTP, CDNs, proxies, and gateways.
- Design APIs for frontend applications and choose between REST, GraphQL, and gRPC.
- Apply HTTP caching, connection management, pagination, filtering, retries, and idempotency.
- Evaluate API Gateway and Backend-for-Frontend (BFF) patterns.
- Make architecture decisions based on latency, scale, payload size, browser support, ownership, security, caching, reliability, and implementation complexity.

## Table of Contents

- [1. How the Web Works](#1-how-the-web-works)
- [2. Browser Cache](#2-browser-cache)
- [3. DNS Resolution](#3-dns-resolution)
- [4. Network Connection](#4-network-connection)
- [5. TLS and HTTPS](#5-tls-and-https)
- [6. HTTP Request and Response](#6-http-request-and-response)
- [7. HTTP Headers](#7-http-headers)
- [8. HTTP Methods](#8-http-methods)
- [9. Idempotency](#9-idempotency)
- [10. HTTP Status Codes](#10-http-status-codes)
- [11. REST API Design](#11-rest-api-design)
- [12. Pagination](#12-pagination)
- [13. Filtering and Sorting](#13-filtering-and-sorting)
- [14. API Versioning](#14-api-versioning)
- [15. Error Contracts](#15-error-contracts)
- [16. Retry Strategies](#16-retry-strategies)
- [17. Rate Limiting](#17-rate-limiting)
- [18. REST Product Listing Case Study](#18-rest-product-listing-case-study)
- [19. GraphQL](#19-graphql)
- [20. REST, GraphQL, and gRPC Trade-offs](#20-rest-graphql-and-grpc-trade-offs)
- [21. gRPC](#21-grpc)
- [22. Frontend API Architecture](#22-frontend-api-architecture)
- [23. Partial Failures](#23-partial-failures)
- [24. Architecture Decision Framework](#24-architecture-decision-framework)
- [25. Practice](#25-practice)

---

## 1. How the Web Works

Consider a user navigating to:

```text
https://shop.example.com/products/iphone
```

At a high level, the browser checks available caches, resolves the hostname, establishes a connection, sends an HTTP request, and processes the response. The request may pass through a CDN, load balancer, reverse proxy, or API gateway before reaching application services and storage.

```text
Browser
  → Browser cache
  → DNS
  → Network connection and TLS
  → CDN / edge
  → Load balancer / reverse proxy / API gateway
  → Application services
  → Cache, database, or other services
  → HTTP response
  → Browser parses, renders, and may fetch additional resources or APIs
```

This sequence is a foundation for reasoning about frontend latency, availability, caching, and failures.

### 1.1 URL Parsing

The browser parses a URL into parts:

```text
https://www.example.com/products/123
│       │               │
│       │               └── Path
│       └── Host
└── Protocol
```

The browser also applies relevant URL rules, determines the origin, and identifies the resource to request.

### 1.2 Browser Rendering

After receiving a document, the browser parses HTML, builds the document structure, fetches and parses CSS, executes JavaScript, and performs layout and painting. JavaScript may then request additional data and assets.

### 1.3 Request Lifecycle at a Glance

1. Parse the URL and determine the origin.
2. Check browser and intermediary caches.
3. Resolve the host through DNS if necessary.
4. Establish or reuse a network connection.
5. Negotiate TLS for HTTPS when required.
6. Send the HTTP request through the network path.
7. Process the HTTP response and any redirects.
8. Parse and render the document; fetch dependent resources and API data.

The exact sequence depends on protocol, cache state, connection reuse, redirects, and browser behavior.

## 2. Browser Cache

Before making a network request, the browser may be able to use a cached response. A fresh cached response can avoid a round trip. A stale response may require revalidation with the server.

Common HTTP caching mechanisms include:

- `Cache-Control` directives such as `max-age` and `no-cache`.
- `ETag` validators used with `If-None-Match`.
- `Last-Modified` validators used with `If-Modified-Since`.
- A `304 Not Modified` response indicating that the cached representation can be reused.

Caching can also happen in service workers, CDNs, reverse proxies, and application-level query caches. Decide which layer owns a cache and how it is invalidated; otherwise stale data or inconsistent behavior can result.

## 3. DNS Resolution

DNS maps a hostname such as `shop.example.com` to an IP address. The result may be available from a browser, operating-system, or resolver cache. If not, the DNS resolution process obtains the needed record from the DNS hierarchy.

DNS affects connection setup and can be part of perceived latency. CDNs commonly use DNS and edge routing to direct users toward an appropriate point of presence.

## 4. Network Connection

Once an address is available, the browser needs a transport connection. The connection may be reused from an existing connection pool or established for the request.

- **TCP** provides a reliable, ordered byte stream and is used by HTTP/1.1 and HTTP/2.
- **QUIC**, usually over UDP, underpins HTTP/3 and combines transport and security setup differently.
- Connection reuse can avoid repeating setup work for subsequent requests to the same origin.

The best protocol and connection behavior depend on client support, infrastructure, latency, and operational constraints.

## 5. TLS and HTTPS

HTTPS protects HTTP communication using TLS. TLS establishes an encrypted connection and authenticates the server using certificates. It protects data in transit from being read or modified by intermediaries.

TLS setup contributes to connection latency, though connection reuse and modern protocols can reduce repeated setup costs. Applications should use HTTPS consistently and avoid mixed content.

## 6. HTTP Request and Response

HTTP is a request/response protocol. A request typically includes a method, path, headers, and optionally a body.

Example request:

```http
GET /products/123 HTTP/1.1
Host: shop.example.com
Accept: application/json
Accept-Language: en-IN
```

Example response:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=60
ETag: "product-v12"

{
  "id": 123,
  "name": "Phone",
  "price": 50000
}
```

The frontend should consider the full request lifecycle: redirects, cache hits, response status, content type, payload size, latency, and whether a connection can be reused.

## 7. HTTP Headers

Headers carry metadata that influences request negotiation, caching, authentication, security, retries, and browser behavior.

### 7.1 Request Headers

Common examples include:

```http
Authorization: Bearer <token>
Accept: application/json
Accept-Language: hi-IN
Content-Type: application/json
If-None-Match: "abc123"
```

`Accept-Language` can be used to select localized content. Localization may happen in the client, API, server, or CDN/edge. Each choice can affect caching, bundle size, consistency, and SEO.

### 7.2 Response Headers

Frontend engineers should understand headers such as:

- `Cache-Control`, `ETag`, `Content-Type`, and `Content-Encoding`
- `Set-Cookie` and `Location`
- `Retry-After`

These can influence caching, authentication, security, retries, and browser behavior.

## 8. HTTP Methods

### `GET`

Retrieves a resource. It is intended to be safe and idempotent and is generally cacheable when the response permits caching.

```http
GET /products/123
```

### `POST`

Creates a resource or triggers an operation. It is not inherently idempotent.

```http
POST /orders
Content-Type: application/json

{
  "productId": 123,
  "quantity": 2
}
```

### `PUT`

Usually replaces the target resource with the supplied representation.

```http
PUT /users/123
Content-Type: application/json

{
  "name": "Chirag",
  "city": "Bangalore"
}
```

### `PATCH`

Applies a partial update to a resource.

```http
PATCH /users/123
Content-Type: application/json

{
  "city": "Bangalore"
}
```

### `DELETE`

Removes a resource. Repeating a delete should generally leave the resource in the same deleted state.

```http
DELETE /cart/items/123
```

## 9. Idempotency

An operation is idempotent if repeating it has the same intended effect as performing it once. Idempotency is important when a client cannot tell whether an operation succeeded because a response was lost or timed out.

For example, retrying a payment request without protection could charge a customer twice. A common solution is an idempotency key:

```http
POST /payments
Idempotency-Key: payment-xyz-123
```

The client reuses the same key when retrying the same logical operation. The server recognizes the duplicate and returns the original result rather than executing the operation again.

Consider idempotency for payments, bookings, order creation, wallet transfers, and ticket purchases. Client-side retry logic alone cannot guarantee exactly-once execution.

## 10. HTTP Status Codes

| Range | Meaning | Examples |
| ----- | ------- | -------- |
| `2xx` | Success | `200 OK`, `201 Created`, `202 Accepted`, `204 No Content` |
| `3xx` | Redirection or cache validation | `301`, `302`, `304 Not Modified`, `307`, `308` |
| `4xx` | Client or request issue | `400`, `401`, `403`, `404`, `409`, `422`, `429` |
| `5xx` | Server or upstream issue | `500`, `502`, `503`, `504` |

Important distinctions:

- `202 Accepted` means the request was accepted for asynchronous processing; the client may need to poll or subscribe for job status.
- `304 Not Modified` allows a cached representation to be reused.
- `401 Unauthorized` indicates missing or invalid authentication; `403 Forbidden` means the caller is authenticated but not allowed to perform the action.
- `409 Conflict` can indicate a version conflict, such as two users updating the same document.
- `429 Too Many Requests` may include a `Retry-After` header.
- Do not treat every `5xx` response the same. A `503` may be retryable with backoff; repeated immediate retries during a `500` outage can make load worse.

## 11. REST API Design

REST APIs model resources and use HTTP methods to operate on those resources.

Prefer resource-oriented endpoints:

```http
GET    /users/123
GET    /users/123/orders
POST   /orders
DELETE /orders/456
```

This is generally clearer and more composable than action-oriented paths such as `/getUser` or `/createNewOrder`.

Good API design also defines consistent request/response shapes, status codes, pagination, error contracts, versioning, and retry behavior.

## 12. Pagination

Large collections should be paginated rather than returned in a single response.

### 12.1 Offset Pagination

```http
GET /posts?page=3&limit=20
```

or:

```http
GET /posts?offset=40&limit=20
```

**Advantages**

- Simple to implement and understand.
- Supports familiar page navigation and random page jumps.

**Limitations**

- Inserts or deletes between page requests can cause duplicate or missing results.
- Large offsets can become inefficient for some data stores.

Use offset pagination for relatively static datasets and interfaces that require explicit page navigation, such as many admin tables.

### 12.2 Cursor Pagination

```http
GET /feed?after=post_123&limit=20
```

```json
{
  "items": [],
  "nextCursor": "post_456"
}
```

**Advantages**

- More stable for changing datasets.
- Efficient at scale when the data source supports cursor queries.
- Well suited to feeds and infinite scrolling.

**Limitations**

- Random page jumps are harder.
- Requires more coordination between client and server.

Choose pagination based on dataset behavior and UX: offset pagination may suit an admin table; cursor pagination is often a better fit for a social feed.

## 13. Filtering and Sorting

Filtering and sorting can be expressed with query parameters:

```http
GET /products?category=mobile&brand=apple&minPrice=50000&sort=price_asc
```

Flexible query APIs can reduce the need for many custom endpoints, but they can increase query complexity and cache cardinality. A large number of filter combinations can create many distinct cache keys and reduce cache hit rates.

Consider which filters are supported, how they are indexed, whether combinations are bounded, and how the resulting URLs map to cache behavior.

## 14. API Versioning

### URL Versioning

```http
/api/v1/products
/api/v2/products
```

This is explicit and easy to debug, but can lead to URL proliferation.

### Header Versioning

```http
Accept: application/vnd.company.v2+json
```

This keeps URLs cleaner but can be less visible and harder to debug.

For public APIs, URL versioning is often operationally straightforward. Tightly controlled internal systems may use other approaches when client and server deployments are coordinated.

## 15. Error Contracts

Human-readable strings are useful for display, but should not be the only way the client identifies an error.

Avoid an ambiguous response:

```json
{
  "error": "Something went wrong"
}
```

Prefer a machine-readable contract:

```json
{
  "code": "PAYMENT_FAILED",
  "message": "Payment could not be processed",
  "requestId": "req-123",
  "retryable": false
}
```

Validation errors can provide field-level details:

```json
{
  "code": "VALIDATION_ERROR",
  "fields": {
    "email": "Invalid email",
    "phone": "Phone number required"
  }
}
```

Frontend logic should branch on stable codes, such as `USER_NOT_FOUND`, rather than parsing message text that may change or be localized.

## 16. Retry Strategies

Retries depend on the operation, error, and idempotency guarantees.

- A transient failure for a `GET` request may be a candidate for retry.
- Retrying a payment `POST` is unsafe unless the operation has an idempotency guarantee.
- Respect retry limits and server-provided guidance such as `Retry-After`.
- Avoid retrying permanent client errors such as most `4xx` responses.

Use exponential backoff to spread attempts over time. Add jitter so many clients do not retry simultaneously after a shared outage:

```text
Attempt 1: immediately
Attempt 2: about 1 second later
Attempt 3: about 2 seconds later
Attempt 4: about 4 seconds later
```

With jitter, each client's actual delay varies within a safe range. This reduces synchronized retry spikes, also known as a thundering herd.

## 17. Rate Limiting

A server can signal that a client has sent too many requests:

```http
429 Too Many Requests
Retry-After: 30
```

The frontend should stop aggressive retries, respect `Retry-After` when provided, and communicate the current state to the user.

Search is a common source of unnecessary traffic. Sending a request for every keystroke can produce many requests for one query. Debouncing input (for example, waiting 300 ms after typing stops) can reduce requests while retaining a responsive experience. Request cancellation and stale-response handling may also be needed.

## 18. REST Product Listing Case Study

### Requirements

- Search products.
- Filter by brand and price.
- Sort results.
- Paginate results.

Example request:

```http
GET /products?query=phone&brand=apple&minPrice=50000&maxPrice=100000&sort=rating_desc&cursor=abc123&limit=20
```

Example response:

```json
{
  "items": [
    {
      "id": "p1",
      "name": "Phone",
      "price": 70000,
      "thumbnail": "/phone.webp"
    }
  ],
  "nextCursor": "xyz456",
  "hasMore": true
}
```

### Design Decisions

- Use cursor-based pagination when product ranking or inventory changes frequently.
- Return thumbnail assets and only the product fields needed by the listing to reduce payload size.
- Define filters and sorting explicitly, and consider how they affect query cost and cache variation.

## 19. GraphQL

GraphQL exposes a schema that lets clients request the data they need. It can be useful when different screens or widgets require different combinations of data.

### 19.1 Schema, Types, Queries, and Mutations

```graphql
type User {
  id: ID!
  name: String!
  email: String!
}

type Product {
  id: ID!
  title: String!
  price: Float!
}

type Query {
  user(id: ID!): User
  products: [Product!]!
}

type Mutation {
  createOrder(productId: ID!): Order!
}
```

The schema defines the available types and operations. Queries read data; mutations change data. Subscriptions can deliver updates when the server supports them.

### 19.2 Resolvers

Resolvers connect schema fields to the underlying data sources. Conceptually:

```javascript
const resolvers = {
  Query: {
    user: async (_, { id }) => userService.getById(id),
  },
};
```

### 19.3 Dashboard Example

A dashboard might need a user profile, notifications, recent orders, recommendations, and loyalty points. With REST, that could require several requests. A GraphQL query can request the necessary fields in one client-defined operation.

This can reduce over-fetching and request coordination, but it does not eliminate backend work: resolvers, authorization, caching, and query cost still need careful design.

### 19.4 N+1 Problem

A nested query that fetches many users and each user's orders can trigger one query for users plus a separate query per user for orders. This is the N+1 problem.

Batching and data-loading techniques can combine related lookups into fewer backend requests, for example fetching orders for multiple user IDs in one query.

### 19.5 GraphQL Security and Resource Limits

Flexible, deeply nested queries can consume substantial server resources. Common safeguards include:

- Query depth and complexity limits.
- Rate limits and timeouts.
- Persisted or allow-listed queries where appropriate.
- Authorization checks at the relevant resource and field boundaries.

Greater client flexibility requires stronger server-side governance.

## 20. REST, GraphQL, and gRPC Trade-offs

| Dimension | REST | GraphQL | gRPC |
| --------- | ---- | -------- | ----- |
| Browser support | Excellent | Excellent | Limited or requires gRPC-Web/proxy |
| Human readability | High | High | Lower; commonly uses Protocol Buffers |
| Payload efficiency | Depends on endpoint shape | Clients select fields | Efficient binary encoding |
| CDN and HTTP caching | Straightforward | More complex for many query patterns | Depends on gateway and infrastructure |
| Streaming | Limited in typical request/response use | Subscriptions can support updates | Strong streaming model |
| Type system | Optional conventions/schema | Strong schema | Strong service and message definitions |
| Backend complexity | Often lower | Higher governance and resolver complexity | Strong fit for service-to-service systems |
| Common fit | Resource-oriented and public APIs | Complex client data requirements | Internal services and streaming use cases |

**Starting points**

- A simple blog with resource-oriented reads may be best served by REST.
- A complex dashboard with many independently composed widgets may benefit from GraphQL.
- A large internal service architecture may use gRPC between services, while exposing REST or GraphQL to browsers.

Choose based on client requirements, caching, team ownership, operational needs, and browser constraints rather than protocol popularity.

## 21. gRPC

gRPC is an RPC framework commonly paired with Protocol Buffers. A service definition describes methods and request/response messages:

```protobuf
service UserService {
  rpc GetUser(GetUserRequest) returns (UserResponse);
}

message GetUserRequest {
  string user_id = 1;
}
```

### 21.1 RPC Communication Patterns

- **Unary:** One request and one response.
- **Server streaming:** One request followed by multiple responses.
- **Client streaming:** Multiple requests followed by one response.
- **Bidirectional streaming:** Both sides send streams of messages.

Streaming is useful for scenarios such as live updates, uploads, and real-time collaboration.

### 21.2 Browser Architecture

Browser support for native gRPC is limited compared with standard HTTP APIs. A common architecture uses gRPC-Web or a proxy/gateway between the browser and gRPC services:

```text
Browser → gRPC-Web or REST/GraphQL → BFF / proxy → gRPC services
```

This allows internal services to use gRPC while the frontend communicates through an interface that is compatible with browser constraints.

## 22. Frontend API Architecture

A frontend rarely exists in isolation. Requests may pass through an API gateway or BFF before reaching domain services.

### 22.1 API Gateway

An API gateway can provide a common entry point for routing, authentication, rate limiting, and other cross-cutting concerns. Avoid placing every application-specific composition rule into a shared gateway if that creates tight coupling.

### 22.2 Backend for Frontend

A BFF is a backend layer tailored to a specific client or frontend experience. It can aggregate backend calls, adapt response shapes, and shield the browser from internal service boundaries.

Potential benefits:

- Client-specific response shaping and API composition.
- Fewer frontend round trips to multiple services.
- A boundary for coordinating frontend-specific needs.

Trade-offs:

- Another service to build, deploy, monitor, and maintain.
- Risk of duplicating business logic or creating a bottleneck if responsibilities are unclear.

Choose direct API calls, a gateway, a BFF, or a combination based on client needs, domain ownership, security, latency, and operational cost.

## 23. Partial Failures

In a composed screen, some requests may succeed while others fail. Decide which data is essential and which features can degrade independently.

For example, a product page might still render product details if recommendations fail. Design for:

- Independent loading and error states for separate data regions.
- Timeouts and cancellation for requests that are no longer useful.
- Fallbacks for optional services.
- Retry behavior that does not repeat unsafe operations.
- Useful telemetry to identify which dependency failed.

Avoid turning every dependency failure into a blank page when a useful partial experience is possible.

## 24. Architecture Decision Framework

For each API or networking decision, ask:

1. What client is consuming the API?
2. What is the data access pattern?
3. What scale and traffic are expected?
4. How latency-sensitive is the user journey?
5. How important are caching and consistency?
6. Who owns and operates the API?
7. What browser or protocol constraints apply?
8. What failure behavior is acceptable?
9. What are the security and authorization boundaries?
10. What complexity can the team operate reliably?

| Scenario | Possible starting point |
| -------- | ----------------------- |
| Public resource-oriented API | REST |
| Complex UI with varying data requirements | GraphQL, if its operational costs are justified |
| Internal service-to-service calls with strong contracts | gRPC |
| Frontend needs aggregation or client-specific adaptation | BFF or API composition layer |
| Dynamic feed or infinite scroll | Cursor pagination |
| Static or administrative table with page navigation | Offset pagination |

These are starting points, not universal rules. Validate them against the system's constraints.

## 25. Practice

### Interview Discussion Questions

- Walk through what happens after a user enters a URL.
- When would you choose REST, GraphQL, or gRPC?
- How would you prevent duplicate payments after a network timeout?
- When would cursor pagination be preferable to offset pagination?
- How should a frontend behave when one of several backend services fails?
- How do caching and filter combinations affect API design?
- How should a client respond to `429 Too Many Requests`?

### Hands-On Assignment

Design the API and frontend data flow for a product listing page that supports search, filtering, sorting, and pagination. Include:

- Endpoint or query design and response shapes.
- Pagination choice and rationale.
- Loading, empty, error, and partial-failure states.
- Caching and invalidation considerations.
- Retry, rate-limit, and cancellation behavior.
- Payload and performance considerations.

## Module Completion Outcome

After completing this module, you should be able to explain the browser-to-service request lifecycle, design frontend-facing APIs, and justify networking and API choices using measurable user, system, and operational constraints.
