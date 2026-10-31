# Client-Server Communication Techniques

## Module Objective

By the end of this module, you should be able to:

- Explain the major client-server communication models.
- Choose between short polling, long polling, WebSockets, Server-Sent Events (SSE), webhooks, and WebRTC.
- Evaluate latency, connection count, message frequency, direction, browser support, infrastructure, and cost.
- Design communication flows that handle reconnection, missed or duplicate events, ordering, and partial failures.
- Select suitable patterns for chat, notifications, live scores, dashboards, collaborative editors, payment status, video calls, and location tracking.

## Table of Contents

- [1. Communication Models](#1-communication-models)
- [2. Start with Requirements](#2-start-with-requirements)
- [3. Short Polling](#3-short-polling)
- [4. Long Polling](#4-long-polling)
- [5. WebSockets](#5-websockets)
- [6. Server-Sent Events](#6-server-sent-events)
- [7. Webhooks](#7-webhooks)
- [8. WebRTC](#8-webrtc)
- [9. Trade-Off Comparison](#9-trade-off-comparison)
- [10. Failure Handling and Delivery Semantics](#10-failure-handling-and-delivery-semantics)
- [11. Authentication, Subscriptions, and Event Design](#11-authentication-subscriptions-and-event-design)
- [12. Decision Framework and Case Studies](#12-decision-framework-and-case-studies)
- [13. Interview Questions](#13-interview-questions)
- [14. Hands-On Assignment](#14-hands-on-assignment)

---

## 1. Communication Models

Frontend applications use different interaction patterns depending on who initiates communication and how quickly updates are needed.

| Model | Communication pattern | Typical fit |
| ----- | --------------------- | ----------- |
| Request-response | Client requests; server responds | CRUD operations and infrequent updates |
| Short polling | Client periodically requests updates | Simple, low-frequency refresh |
| Long polling | Client request waits until an update or timeout | Near-push behavior where persistent streaming is unavailable |
| WebSockets | Persistent, bidirectional connection | Interactive real-time communication |
| SSE | Persistent server-to-client stream over HTTP | One-way live updates |
| Webhooks | Server-to-server event notification | Reliable backend integration events |
| WebRTC | Peer-to-peer media or data | Calls, conferencing, and direct peer communication |

These approaches are not interchangeable. The right choice depends on product requirements and operational constraints, not just the word “real-time.”

## 2. Start with Requirements

Before selecting a protocol, clarify:

- Is the communication client-to-server, server-to-client, bidirectional, or server-to-server?
- How quickly must updates arrive?
- How often are updates produced, and how many clients will be connected?
- Can updates be lost, or must they be replayed and acknowledged?
- Are ordering and duplicate processing important?
- What browser, proxy, firewall, and CDN constraints apply?
- How should clients authenticate and renew credentials?
- What reconnect, offline, and fallback behavior is needed?
- What connection, bandwidth, memory, and operational costs are acceptable?

### 2.1 Communication Decision Dimensions

Evaluate the following dimensions together:

| Dimension | Questions |
| --------- | --------- |
| Direction | Does the client only receive updates, or must it send frequent messages too? |
| Latency | Is a delay of seconds acceptable, or must updates feel immediate? |
| Frequency | Are updates occasional, frequent, or continuous? |
| Reliability | Can events be dropped, or are acknowledgement and replay required? |
| Scale | How many concurrent clients and messages are expected? |
| Compatibility | Do browsers, proxies, and network policies support the approach? |
| Complexity | Can the team operate the required gateways, connection state, and recovery logic? |

## 3. Short Polling

With short polling, the client sends a request at a fixed interval:

```text
Client → request
Server → current result
Client waits
Client → next request
```

### Advantages

- Simple to implement and debug.
- Uses ordinary HTTP request/response behavior.
- Works through most infrastructure that supports normal HTTP.

### Limitations

- Updates are delayed until the next polling request.
- Requests may return no new data.
- Frequent polling increases request volume and server load.
- Many clients on the same interval can create synchronized traffic spikes.

### Polling Interval Trade-Off

A shorter interval reduces update delay but increases request volume. A longer interval reduces load but makes information less current. Select the interval based on how stale the data may be and how costly each request is.

### Adaptive Polling and Backoff

Polling does not need to use one fixed interval in every state. A client can poll less frequently when data is inactive, increase frequency during active use, and back off after failures.

Use exponential backoff with jitter when retrying transient failures. This helps avoid a thundering herd in which many clients retry at once after a service recovers. Stop or slow retries for permanent errors, and respect server instructions such as `Retry-After`.

### When to Use Short Polling

- Updates are infrequent.
- A small delay is acceptable.
- The implementation should remain simple.
- The number of clients or polling rate is moderate.
- Existing HTTP infrastructure makes persistent connections difficult.

## 4. Long Polling

With long polling, the client sends a request and the server holds it open until an update is available or a timeout occurs. The client then processes the response and immediately issues another request.

```text
Client → request
          (server waits)
Client ← update or timeout
Client → next request
```

### Advantages

- Lower idle request volume than short polling.
- Near-push behavior while retaining an HTTP request/response model.
- Can be useful when persistent streaming is unavailable or difficult to operate.

### Limitations

- Connections are still repeatedly opened and completed.
- Proxies, load balancers, and servers need appropriate timeouts and capacity.
- Reconnect and duplicate-event behavior still need explicit design.
- A delayed response from an earlier request can race with a newer request if the client does not track request or event order.

### Short Polling vs. Long Polling

| Concern | Short polling | Long polling |
| ------- | ------------- | ------------ |
| Request behavior | Repeated requests at a fixed interval | Request waits for an update or timeout |
| Idle traffic | Can be high | Usually lower |
| Update latency | Bounded by polling interval | Often lower while a request is waiting |
| Operational complexity | Lower | Higher due to held connections and timeout handling |

Use long polling when HTTP compatibility matters and a near-push experience is valuable, but a streaming connection is not a suitable choice.

## 5. WebSockets

WebSockets provide a persistent, bidirectional connection. Both client and server can send messages after the connection is established.

### 5.1 Connection Lifecycle

A browser typically begins with an HTTP upgrade request. If the server accepts the upgrade, the connection changes to the WebSocket protocol:

```http
GET /chat HTTP/1.1
Upgrade: websocket
Connection: Upgrade
```

```http
HTTP/1.1 101 Switching Protocols
```

Afterward, the connection remains open for message exchange until either side closes it or the network fails.

### 5.2 Suitable Use Cases

- Chat and messaging.
- Collaborative editing.
- Multiplayer interactions.
- Live trading or other frequent bidirectional updates.
- Interactive applications where clients send and receive messages continuously.

WebSockets are often unnecessary when updates are one-way, infrequent, or adequately served by ordinary HTTP or SSE.

### 5.3 Message Design

Define a stable message envelope rather than sending unrelated ad hoc payloads. Include a message or event ID, type, version, timestamp, and correlation information where needed. Keep business data in a clearly defined payload.

The envelope makes it easier to route messages, detect duplicates, trace operations, and evolve the protocol.

### 5.4 Reconnection and Missed Messages

A connection can drop when a mobile user changes networks, a device sleeps, a proxy closes an idle connection, or a server restarts. A production design should define:

- Reconnect behavior with backoff and jitter.
- How clients determine whether a connection is alive.
- How to authenticate again if credentials expire.
- How the client resumes after reconnecting.
- How the server replays events missed during disconnection.
- How duplicate messages are detected.

Reconnecting the socket alone does not guarantee that the client has received every event.

### 5.5 Ordering, Duplicates, and Acknowledgements

Network delivery and retries can result in duplicates or delayed messages. If order matters, include sequence numbers or version information and define how clients handle gaps and out-of-order events.

For important events, acknowledgements and server-side replay may be needed. Make handlers idempotent so processing the same event twice does not apply the business operation twice.

### 5.6 Heartbeats and Liveness

Heartbeats can help detect stale connections and keep intermediary infrastructure from treating an idle connection as dead. Choose heartbeat frequency with proxy timeouts, battery use, and connection scale in mind.

### 5.7 Scaling WebSockets

Persistent connections consume server and network resources. At scale, consider:

- Connection limits and memory use.
- Load balancing and how reconnects are routed.
- Pub/Sub or another message distribution mechanism across server instances.
- Subscription filtering so clients receive only relevant events.
- Backpressure when producers generate data faster than clients can consume it.
- Whether to batch, sample, aggregate, or drop stale updates.

Sticky sessions may simplify routing a client to the same server, but they do not replace shared state or cross-instance event distribution where those are required.

## 6. Server-Sent Events

SSE provides a persistent, one-way stream from server to client over HTTP. The browser's `EventSource` API can connect to an endpoint and receive events:

```javascript
const source = new EventSource("/api/events");

source.onmessage = (event) => {
  console.log(event.data);
};
```

Example event stream:

```text
data: {"price": 100}

event: stock-price
id: 124
data: {"symbol": "GOOG", "price": 201}
```

Named events can be handled explicitly:

```javascript
source.addEventListener("stock-price", (event) => {
  console.log(event.data);
});
```

### Advantages

- Natural fit for server-to-client updates.
- Uses HTTP and is often simpler than bidirectional WebSockets.
- Browser support includes automatic reconnection behavior.
- Event IDs can help a server resume a stream from the last received event.

### Limitations

- Communication is server-to-client; clients use a separate request to send data.
- Long-lived connections still require infrastructure capacity and timeout configuration.
- Authentication, reconnect, and replay policies need to fit the chosen browser and server implementation.

### SSE vs. WebSockets

| Factor | SSE | WebSockets |
| ------ | --- | ---------- |
| Direction | Server to client | Bidirectional |
| Protocol | HTTP stream | WebSocket connection |
| Reconnection | Browser support can reconnect automatically | Application usually defines reconnection |
| Complexity | Often lower for one-way streams | Higher, but supports two-way messaging |
| Good fit | Live feeds, dashboards, AI output streaming | Chat, collaboration, interactive real-time apps |

SSE is often sufficient for a live news feed or a server-generated response streamed to the browser. WebSockets are more natural when the client and server both exchange frequent messages.

SSE still has long-lived connections; it is not operationally free. Capacity planning should account for connection count, load balancing, memory, and event distribution.

## 7. Webhooks

A webhook is a server-to-server HTTP notification. It is not usually browser push.

For example, after a payment provider completes an asynchronous payment, it can send an event to the merchant backend. The backend updates order state, and the frontend later retrieves or subscribes to that state.

Do not treat a browser redirect after checkout as authoritative proof of payment. The browser may close, lose connectivity, or send an untrusted request. A verified provider webhook is a server-to-server confirmation.

### 7.1 Delivery and Idempotency

If a webhook receiver is unavailable, the sender may retry. The receiver can therefore see the same event more than once.

Include a unique event ID and record processed IDs so duplicate deliveries can be safely ignored:

```json
{
  "eventId": "evt-123",
  "type": "payment.success"
}
```

### 7.2 Security

Webhook receivers should validate the sender and request using appropriate mechanisms, such as:

- Signature verification.
- Timestamp validation and replay protection.
- HTTPS.
- Secret rotation.

Never trust an incoming webhook solely because its payload looks valid.

### 7.3 Webhook vs. WebSocket

These solve different problems:

- Use webhooks for backend-to-backend event delivery.
- Use WebSockets or SSE to update a connected browser.
- A complete flow may use both: provider webhook → application backend → browser event stream or a later client fetch.

## 8. WebRTC

WebRTC supports peer-to-peer media and data communication. It is commonly used for voice/video calls and direct data channels.

### 8.1 Signaling, STUN, and TURN

Peers need a signaling mechanism to exchange connection information before a peer connection can be established. Signaling may use an application server and can be implemented with HTTP or WebSockets.

- **STUN** helps a peer discover network address information visible outside its local network.
- **TURN** relays traffic when a direct peer-to-peer path cannot be established.

WebRTC is more complex than choosing a browser API: production systems must account for signaling, network traversal, relays, permissions, device behavior, and call recovery.

### 8.2 When to Use WebRTC

Use WebRTC when direct peer-to-peer media or data is a core requirement, such as video calls or low-latency peer communication. Do not select it merely because an application needs real-time updates; SSE or WebSockets may be simpler.

For multi-party calls, a media server or selective forwarding unit may be needed rather than a full mesh, depending on participant count, bandwidth, and product requirements.

## 9. Trade-Off Comparison

| Technique | Direction | Latency | Complexity | Common fit |
| --------- | --------- | ------- | ---------- | ---------- |
| Short polling | Client initiated | Depends on interval | Low | Infrequent refreshes |
| Long polling | Request/response with held request | Near-push | Medium | HTTP-compatible near-real-time updates |
| WebSocket | Bidirectional | Low | High | Chat and interactive collaboration |
| SSE | Server to client | Low | Low to medium | Live feeds and one-way updates |
| Webhook | Server to server | Event-driven | Medium | Payment and backend integration events |
| WebRTC | Peer-to-peer media/data | Very low when direct | Very high | Voice/video and direct peer communication |

This table is a starting point. Real decisions also depend on event reliability, browser and proxy behavior, connection scale, security, and operational maturity.

## 10. Failure Handling and Delivery Semantics

### 10.1 Failure Handling by Technique

| Technique | Failure considerations |
| --------- | ---------------------- |
| Polling | Request failures, backoff, jitter, and stale data |
| Long polling | Request timeout, reconnect races, and duplicate results |
| WebSocket | Disconnects, reconnect, missed events, ordering, and backpressure |
| SSE | Stream disconnect, reconnect, event replay, and connection limits |
| Webhook | Receiver downtime, retries, duplicate delivery, and signature validation |
| WebRTC | Signaling failure, blocked paths, TURN relay availability, and peer recovery |

### 10.2 Delivery Semantics

- **At-most-once:** An event may be lost, but duplicates are avoided. This may be acceptable for transient signals such as cursor movement.
- **At-least-once:** Events are retried until received, so duplicates are possible. Consumers need deduplication and idempotent processing.
- **Exactly-once:** Difficult to guarantee end-to-end across networks and services. Systems commonly combine at-least-once delivery with idempotent processing to achieve the desired business outcome.

Not every event needs the same reliability. A dropped typing indicator is usually tolerable; a payment or order status event is not. Match durability, replay, and acknowledgement cost to business impact.

### 10.3 Backpressure and Update Rates

If a server generates data faster than the UI can render or process it, queues and memory can grow and latency can increase. Possible strategies include:

- Batch related updates.
- Drop stale intermediate values when only the latest value matters.
- Sample or rate-limit updates.
- Aggregate events before sending.
- Apply flow control or limit subscriptions.

For example, a chart may only need to render a subset of high-frequency price updates, while an order event must not be silently discarded.

## 11. Authentication, Subscriptions, and Event Design

### 11.1 Authentication

Polling and webhooks commonly use standard HTTP authentication patterns. Persistent connections introduce additional questions:

- How are credentials supplied during connection setup?
- What happens when a token expires while the connection remains open?
- Should the client reconnect with a fresh token or re-authenticate?
- Can a short-lived connection credential be used safely?

Do not assume that authentication at initial connection time removes the need to manage authorization changes later.

### 11.2 Subscription Model

Avoid sending every event to every connected user. Let clients subscribe to the specific resources or topics they need, and enforce authorization for each subscription.

Example:

```json
{
  "type": "SUBSCRIBE",
  "symbols": ["GOOG", "MSFT"]
}
```

For chat, a subscription might target a conversation ID. Filtering reduces bandwidth, client processing, and infrastructure load.

### 11.3 Event Envelope

A reusable event envelope separates metadata from business payload:

```json
{
  "id": "evt-123",
  "type": "ORDER_STATUS_CHANGED",
  "version": 1,
  "timestamp": 1710000000,
  "correlationId": "order-456",
  "payload": {
    "status": "SHIPPED"
  }
}
```

The ID supports deduplication, type supports routing, version supports evolution, timestamp provides context, and correlation ID helps connect related operations.

### 11.4 Event Versioning

Events are contracts. Prefer additive changes where possible, and use explicit versioning or compatible readers when event shapes must evolve. Old clients may continue to receive events after a server deploy, so avoid assuming all consumers update at once.

## 12. Decision Framework and Case Studies

### 12.1 Decision Framework

Ask these questions in order:

1. Is this server-to-server event delivery? Consider a webhook.
2. Is peer-to-peer media or data required? Consider WebRTC.
3. Is communication bidirectional and frequent? Consider WebSockets.
4. Is it mostly server-to-client streaming? Consider SSE.
5. Are updates infrequent and latency flexible? Consider short polling.
6. Is near-push behavior needed but persistent streaming impractical? Consider long polling.

Then validate the decision against scale, delivery semantics, browser support, infrastructure, security, and cost.

### 12.2 Chat Application

**Requirements:** messages, typing indicators, read receipts, presence, and bidirectional interaction.

WebSockets are a natural candidate. The design must also address:

- Reconnection and missed-message recovery.
- Message ordering and duplicate detection.
- Acknowledgements for important messages.
- Offline message handling.
- Subscription authorization and connection scaling.

### 12.3 Food Delivery Tracking

**Requirements:** A driver reports location periodically, and a customer sees updates on a map.

Choose the update mechanism based on update frequency, tolerated staleness, client count, and network conditions. Polling may be sufficient for less frequent updates; SSE or WebSockets may be suitable when lower-latency updates are required. The driver-to-server ingestion path and customer-facing update path may use different mechanisms.

### 12.4 Payment Status

The payment provider should notify the merchant backend through an authenticated webhook. The backend verifies and deduplicates the event, updates authoritative order state, and makes the result available to the browser through a fetch, polling, SSE, or WebSocket depending on the user experience.

Do not rely only on a browser redirect to confirm payment.

## 13. Interview Questions

- When would you choose polling over WebSockets?
- What is the difference between short and long polling?
- When is SSE sufficient, and when are WebSockets more appropriate?
- Why is a webhook not the same as browser push?
- How would you safely reconnect a WebSocket?
- How would a client recover missed messages?
- How do you handle duplicate messages and preserve ordering?
- Why are acknowledgements and idempotency important?
- What is backpressure, and how can a system respond to it?
- How would you scale persistent connections across multiple servers?
- When might sticky sessions or Pub/Sub be useful?
- How should a persistent connection handle token expiry?
- What are at-most-once and at-least-once delivery?
- Why is exactly-once delivery difficult?
- How would you design live scores, chat, payment status, or a collaborative editor?

## 14. Hands-On Assignment

Design real-time communication for a food delivery application.

Include:

- Functional requirements and acceptable location staleness.
- Driver-to-server ingestion and customer-facing update paths.
- A communication technique for each path and why it fits.
- Expected connection and message volume.
- Reconnect, missed-update, ordering, and duplicate behavior.
- Authentication, subscription authorization, and event shape.
- Backpressure, fallback, and degraded-network behavior.
- How reliability requirements differ for location updates and order status.
