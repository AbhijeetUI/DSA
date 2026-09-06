# Cache Storage: Staff Engineer Revision Guide

## 1. What Is Cache Storage?

**Cache storage** is a temporary or semi-persistent place where an application stores a copy of data that is expensive or slow to produce, so later requests can be served faster.

```text
First request:  Client -> Application -> Database/API
                           slow

Later request:  Client -> Cache
                           fast
```

A cache improves latency and reduces load, but it introduces a second copy of the data. That means the main engineering problem is not only storing data; it is deciding **when cached data is valid**.

## 2. What Can Be Cached?

- HTTP responses and static files
- Images, JavaScript, CSS, and fonts
- API responses
- Database query results
- Sessions and configuration
- Computed results such as reports
- DNS lookups
- Frequently accessed objects

## 3. Cache Storage vs Similar Browser Storage

| Storage           | Main purpose                                | Automatically sent with requests? | Typical lifetime          |
| ----------------- | ------------------------------------------- | --------------------------------: | ------------------------- |
| HTTP cache        | Cache HTTP responses                        |      Yes, according to HTTP rules | Browser controlled        |
| Cache Storage API | Store named `Request`/`Response` pairs      |           No, application chooses | Until deleted/evicted     |
| `localStorage`    | Small string key/value data                 |                                No | Persistent until cleared  |
| `sessionStorage`  | Per-tab string key/value data               |                                No | Until tab closes          |
| IndexedDB         | Structured client-side data                 |                                No | Persistent until cleared  |
| Service worker    | Intercept requests and apply cache strategy |              No, code controls it | Depends on implementation |

Do not use `localStorage` as a replacement for the Cache Storage API. Cache Storage stores complete HTTP-style responses and works naturally with service workers.

## 4. Browser Cache Storage API

The Cache Storage API is exposed through `caches`. It stores named caches containing request/response pairs.

```js
const cache = await caches.open("app-v1");

await cache.put(
  new Request("/api/products"),
  new Response(JSON.stringify([{ id: 1, name: "Keyboard" }]), {
    headers: { "Content-Type": "application/json" },
  }),
);

const response = await cache.match("/api/products");
const products = response ? await response.json() : null;
```

Important properties:

- `caches.open(name)` opens or creates a named cache.
- `cache.put(request, response)` stores a response.
- `cache.match(request)` reads a matching response.
- `cache.delete(request)` removes one entry.
- `caches.delete(name)` removes an entire named cache.
- Cache Storage is asynchronous and available in windows and service workers.

## 5. Real Service Worker Example

This example caches the application shell during installation, serves cached files quickly, and removes old versions during activation.

```js
const CACHE_NAME = "shop-static-v3";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      ),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse.ok) return networkResponse;

          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });

          return networkResponse;
        })
        .catch(() => caches.match("/offline.html"));
    }),
  );
});
```

### Why `response.clone()` is required

A `Response` body is a stream. Reading it consumes the stream. The browser needs one copy for the page and another copy for the cache, so the response must be cloned before storing it.

## 6. Common Browser Cache Strategies

### Cache-first

Best for versioned static assets such as `/app.8f31.js`.

```text
Cache hit  -> return cache
Cache miss -> fetch network, store response, return response
```

Risk: users may receive stale data if filenames are not versioned.

### Network-first

Best for pages or data that should be fresh but still work offline.

```text
Try network -> cache successful response
Network fails -> return cached response
```

### Stale-while-revalidate

Best when fast display is more important than immediate freshness.

```text
Return cached response immediately
Refresh cache in the background
```

### Network-only

Best for payments, login, and highly sensitive or always-current operations.

### Cache-only

Best for assets guaranteed to be pre-cached during installation.

## 7. HTTP Caching

HTTP caching is controlled primarily by response headers. Example:

```http
HTTP/1.1 200 OK
Cache-Control: public, max-age=3600, stale-while-revalidate=60
ETag: "product-list-v42"
Content-Type: application/json

{"items":[{"id":1,"name":"Keyboard"}]}
```

Meaning:

- `public`: shared caches such as CDNs may store it.
- `max-age=3600`: it may be considered fresh for one hour.
- `stale-while-revalidate=60`: stale data may be served for up to 60 seconds while refreshing.
- `ETag`: identifies a particular representation for validation.

A browser can later ask:

```http
GET /api/products
If-None-Match: "product-list-v42"
```

If unchanged, the server returns:

```http
HTTP/1.1 304 Not Modified
ETag: "product-list-v42"
```

The body is not resent, saving bandwidth.

### Important directives

```http
Cache-Control: no-store
```

Do not store the response. Use for secrets and highly sensitive responses.

```http
Cache-Control: private, no-cache
```

Only a private browser cache may store it, and it should revalidate before reuse.

```http
Cache-Control: public, max-age=31536000, immutable
```

Good for content-hashed files such as `/app.8f31.js` that never change at that URL.

```http
Vary: Accept-Encoding, Accept-Language
```

Separate cached representations based on request headers.

## 8. Server-Side Cache: Redis Example

A common backend pattern is **cache-aside**:

1. Read from cache.
2. On a miss, read from the database.
3. Store the result with a TTL.
4. Return the result.

```js
async function getProduct(productId) {
  const key = `product:${productId}`;
  const cached = await redis.get(key);

  if (cached !== null) {
    return JSON.parse(cached);
  }

  const product = await database.products.findById(productId);

  if (product === null) {
    // Short negative caching prevents repeated misses, but keep it brief.
    await redis.set(key, JSON.stringify(null), { EX: 30 });
    return null;
  }

  await redis.set(key, JSON.stringify(product), { EX: 300 });
  return product;
}
```

The TTL prevents data from living forever, but TTL alone does not guarantee correctness. Update operations should also invalidate or update the cache.

```js
async function updateProduct(productId, changes) {
  const product = await database.products.update(productId, changes);
  await redis.del(`product:${productId}`);
  return product;
}
```

## 9. Cache Invalidation Strategies

### Time-based expiration

Every item expires after a TTL.

- Simple
- Limits staleness
- May serve stale data until expiry

### Explicit invalidation

Delete or replace an entry whenever the source changes.

- Fresher data
- Requires every write path to invalidate correctly

### Versioned keys

```text
product-list:v41
product-list:v42
```

The application switches to a new key instead of mutating an existing cached object.

### Event-driven invalidation

A database update publishes an event. Cache consumers remove or refresh affected keys.

```text
Database update -> ProductUpdated event -> cache invalidation worker
```

## 10. Cache Consistency Problems

### Stale data

The cache contains an older value than the database.

Mitigations:

- Shorter TTL
- Invalidate after writes
- Versioned values
- Read directly from the source for critical operations

### Cache stampede

A popular key expires and many requests query the database simultaneously.

Mitigations:

- Add jitter to TTLs
- Use a distributed lock
- Refresh before expiry
- Serve stale data while one request refreshes

Example TTL jitter:

```js
const ttlSeconds = 300 + Math.floor(Math.random() * 60);
await redis.set(key, value, { EX: ttlSeconds });
```

### Cache penetration

Requests repeatedly ask for IDs that do not exist.

Mitigations:

- Short negative caching
- Input validation
- Rate limiting
- Bloom filters for very large keyspaces

### Cache poisoning

An attacker causes incorrect or unsafe content to be stored and served to other users.

Mitigations:

- Never cache responses containing user-specific data in shared caches.
- Include the correct dimensions in `Vary`.
- Validate cache keys and response ownership.
- Do not build cache keys from untrusted input without normalization.

## 11. Security Rules

Never put these in a shared browser or CDN cache:

- Access tokens
- Password reset pages
- Payment details
- Private user dashboards
- Responses containing another user's data

For sensitive responses, use:

```http
Cache-Control: no-store
```

For user-specific but browser-cacheable responses, use:

```http
Cache-Control: private, no-cache
```

Also remember: a cache is not an authorization layer. Always authenticate and authorize the request even when the requested object is found in cache.

## 12. Staff Engineer Design Checklist

Before adding a cache, answer these questions:

1. What is the source of truth?
2. How stale can the data safely be?
3. What is the cache key, and does it include tenant/user/locale/version dimensions?
4. What happens on a cache miss?
5. What happens when the cache is unavailable?
6. How will writes invalidate or refresh entries?
7. What is the TTL and why?
8. Can a popular key cause a stampede?
9. Could private data leak through a shared cache?
10. What metrics will reveal a problem?

Useful metrics:

- Hit rate: `hits / (hits + misses)`
- Miss rate
- Cache read/write latency
- Eviction count
- Item size
- Backend load during expiry events
- Staleness age
- Error rate when the cache is unavailable

## Final Revision Summary

> A cache is a performance optimization, not the source of truth. Cache Storage in the browser stores request/response pairs, while HTTP caches and server caches use their own policies. A reliable design defines cache keys, TTLs, invalidation, failure behavior, security boundaries, and observability before implementation.

## Definition and Real Use Case

### Definition

**Cache storage is a temporary data store that keeps frequently requested or expensive-to-create data closer to the consumer, allowing future requests to be served faster than reading from the original source.**

The original source remains the source of truth. A cache is an optimization and may contain data that is expired, missing, or temporarily unavailable.

### Real Use Case: Product Catalog

An online store has 100,000 products, but thousands of customers repeatedly request the same popular product:

```text
GET /api/products/42
```

Without a cache, every request queries the database:

```text
1,000 requests -> 1,000 database queries
```

With a cache-aside design:

```text
Request 1  -> cache miss -> database -> store result for 5 minutes
Requests 2-999 -> cache hit -> return product immediately
```

Benefits:

- Lower response latency
- Fewer database queries
- Better performance during traffic spikes
- More capacity for database writes and less frequently accessed data

When product `42` is updated, the application must delete or refresh `product:42`. Otherwise, customers may see the old price until the five-minute TTL expires. For checkout and payment, the application should read current data from the source of truth instead of trusting a possibly stale cache.
