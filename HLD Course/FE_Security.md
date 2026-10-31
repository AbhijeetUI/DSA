# Frontend Security

## Module Objective

By the end of this module, you should be able to:

- Model frontend trust boundaries and explain the browser security model.
- Identify common risks including XSS, CSRF, clickjacking, CORS misconfiguration, token exposure, insecure storage, dependency attacks, and unsafe iframe messaging.
- Design secure authentication, authorization boundaries, session handling, CSP, security headers, third-party script usage, file upload flows, and microfrontend architectures.
- Evaluate trade-offs such as cookies vs. `localStorage`, sessions vs. JWTs, CSP strictness vs. migration effort, iframe isolation vs. integration complexity, and usability vs. session security.

## Table of Contents

- [1. Security Starts with Trust Boundaries](#1-security-starts-with-trust-boundaries)
- [2. XSS](#2-cross-site-scripting-xss)
- [3. CSP and Security Headers](#3-content-security-policy-and-security-headers)
- [4. CSRF](#4-cross-site-request-forgery-csrf)
- [5. Clickjacking and Iframe Security](#5-clickjacking-and-iframe-security)
- [6. CORS](#6-cross-origin-resource-sharing-cors)
- [7. Authentication and Authorization](#7-authentication-and-authorization)
- [8. Token Storage and Browser Storage](#8-token-storage-and-browser-storage)
- [9. Logout and Multi-Tab Security](#9-logout-and-multi-tab-security)
- [10. Input Validation, Sanitization, and URLs](#10-input-validation-sanitization-and-urls)
- [11. Dependencies and Third-Party Scripts](#11-dependencies-and-third-party-scripts)
- [12. Iframes and Microfrontends](#12-iframes-and-microfrontends)
- [13. Privacy, Data Minimization, and Logging](#13-privacy-data-minimization-and-logging)
- [14. Secure File Uploads](#14-secure-file-uploads)
- [15. Frontend-Adjacent Server Risks](#15-frontend-adjacent-server-risks)
- [16. Security Case Studies](#16-security-case-studies)
- [17. Interview Questions](#17-interview-questions)

---

## 1. Security Starts with Trust Boundaries

A frontend system crosses multiple trust boundaries:

```text
User input
   ↓
Browser application
   ↓
Third-party scripts and assets
   ↓
Network, CDN, and API gateway
   ↓
Backend services and data stores
```

Treat user-controlled data, browser storage, network responses, third-party code, and embedded applications as untrusted until validated for their intended use. The browser is not a trusted enforcement point for authorization or business rules: users can inspect and modify client-side state and requests.

Security is a system property. No single control—such as input validation, CSP, or `HttpOnly` cookies—replaces layered defenses and server-side enforcement.

## 2. Cross-Site Scripting (XSS)

XSS occurs when attacker-controlled content is interpreted as executable content in another user's browser.

### 2.1 Common XSS Types

- **Stored XSS:** Untrusted content is saved and later rendered to users.
- **Reflected XSS:** Untrusted request data is immediately included in a response.
- **DOM-based XSS:** Client-side code uses untrusted data in an unsafe DOM operation. The vulnerable flow can exist entirely in browser code.

### 2.2 Safer Rendering

Avoid APIs that interpret strings as markup or executable code when the value is untrusted, such as `innerHTML`, `document.write`, `eval`, or dynamically constructed functions.

For plain text, use text-rendering APIs such as:

```javascript
element.textContent = userInput;
```

Frameworks such as React escape text rendered as ordinary children by default:

```jsx
<div>{userInput}</div>
```

That protection does not apply when bypassing normal escaping, for example with `dangerouslySetInnerHTML`. If rich HTML is a genuine product requirement, sanitize it with a maintained sanitizer and an explicit allowlist before rendering. Sanitization must match the output context; HTML, URL, CSS, and JavaScript contexts have different rules.

### 2.3 Defense in Depth

- Validate inputs for product rules.
- Use context-aware output encoding.
- Prefer safe DOM APIs and framework defaults.
- Sanitize intentionally supported rich HTML.
- Apply a restrictive Content Security Policy.
- Reduce the impact of session theft with appropriate cookie settings and session design.

## 3. Content Security Policy and Security Headers

### 3.1 Content Security Policy

CSP restricts which sources the browser may load or execute. A restrictive policy can reduce the impact of injected content:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'
```

Where inline scripts are necessary, a nonce-based policy can authorize specific scripts. Nonces must be generated unpredictably and associated with the response they authorize. Avoid permissive policies such as allowing arbitrary script sources or unsafe inline execution as a permanent shortcut.

### 3.2 CSP Rollout

For an existing application, use report-only mode to observe violations before enforcing a stricter policy:

```http
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'
```

A practical migration:

1. Inventory required scripts, styles, APIs, images, and frames.
2. Deploy a report-only policy and review reports.
3. Remove unnecessary sources and replace unsafe inline patterns.
4. Enforce the policy and monitor violations.

Strict CSP improves control but may require changes to legacy inline scripts and third-party integrations.

### 3.3 Other Security Headers

Configure headers appropriate to the application and deployment:

- `Strict-Transport-Security` for HTTPS enforcement.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy` to control referrer information.
- `Permissions-Policy` to restrict browser features.
- `X-Frame-Options` or CSP `frame-ancestors` to control embedding.

Security headers should be tested against real application behavior and deployed consistently.

## 4. Cross-Site Request Forgery (CSRF)

CSRF abuses a browser's automatic inclusion of credentials, commonly cookies. A user who is authenticated to one site can be induced to submit an unintended request to it from another site.

Defenses depend on the authentication and request architecture:

- Use `SameSite` cookie settings where compatible.
- Use anti-CSRF tokens for state-changing requests when appropriate.
- Validate `Origin` or `Referer` on sensitive requests as an additional control.
- Do not use `GET` for state-changing operations.
- Keep authorization and request validation on the server.

CSRF and XSS are different threats. An `HttpOnly` cookie reduces JavaScript access to the cookie value but does not, by itself, prevent CSRF because the browser still attaches the cookie to eligible requests.

## 5. Clickjacking and Iframe Security

Clickjacking attempts to trick a user into interacting with a page embedded or disguised in another page.

Use CSP `frame-ancestors` or `X-Frame-Options` to control which origins may embed the application. For an application that should not be framed, a restrictive policy can deny all framing; applications that support embedding should explicitly allow trusted origins.

When embedding third-party content:

- Apply the iframe `sandbox` attribute with only the permissions needed.
- Grant only required capabilities through the iframe `allow` attribute.
- Avoid assuming that iframe content is trustworthy because it appears inside the application.

## 6. Cross-Origin Resource Sharing (CORS)

CORS is a browser-enforced mechanism that controls whether a web page from one origin may read a response from another origin. It is not authentication or authorization and does not prevent non-browser clients from making requests.

Understand:

- The Same-Origin Policy and how origins are defined.
- Simple requests and preflight requests.
- Credentialed requests and the stricter requirements for credentialed CORS.
- Why wildcard origins are inappropriate for sensitive credentialed APIs.
- How broad or inconsistent allowlists can expose data.

Configure CORS on the server for known application origins and required methods/headers. Continue to authenticate and authorize every API request independently.

## 7. Authentication and Authorization

### 7.1 Authentication Concepts

Frontend systems may participate in flows involving:

- Server-managed sessions and cookies.
- JSON Web Tokens (JWTs).
- OAuth 2.0 and OpenID Connect.
- Single sign-on (SSO).
- Role-based access control (RBAC) and attribute-based access control (ABAC).

The frontend can improve UX with route guards, but hiding a button or route is not authorization. The server must validate the user's permissions for every protected operation and resource.

### 7.2 Sessions vs. JWTs

| Concern | Server-managed session | JWT |
| ------- | ---------------------- | --- |
| State | Session state is maintained server-side or in a shared store | Claims are carried in a signed token |
| Revocation | Often more direct with server-side session control | Can be harder before token expiry without additional mechanisms |
| Size | Usually a small session identifier | Larger token may be sent with requests |
| Distributed systems | Requires an appropriate session strategy | Can be convenient, but does not remove key, rotation, or revocation concerns |
| Common risk | Session theft or fixation if session handling is weak | Misuse, overlong lifetime, or treating claims as current authorization |

A JWT is a token format, not a complete authentication architecture. Select the approach based on the threat model, deployment, revocation needs, and operational requirements.

### 7.3 Authorization Boundaries

- Treat client-side roles and claims as display hints, not authority.
- Enforce access on the server for each action and resource.
- Avoid returning sensitive fields that the current user should not see.
- Consider permission changes while a session or live connection remains open.

## 8. Token Storage and Browser Storage

Browser storage choices have different exposure and persistence characteristics. Anything readable by application JavaScript may be exposed if an XSS vulnerability executes in the origin.

### 8.1 `localStorage` and `sessionStorage`

- `localStorage` persists across browser sessions and is readable by JavaScript.
- `sessionStorage` generally has a shorter tab/session lifecycle, but remains JavaScript-readable.
- Neither should be treated as a secure secret vault.
- Avoid casually storing long-lived bearer tokens, passwords, raw payment details, or sensitive personal data.

### 8.2 Cookies

An `HttpOnly` cookie is not available to ordinary page JavaScript. For session cookies, `Secure`, `HttpOnly`, and an appropriate `SameSite` policy are common controls:

```http
Set-Cookie: session=<opaque-value>; HttpOnly; Secure; SameSite=Lax
```

Cookies are automatically attached to matching requests, so CSRF and cross-origin behavior still need consideration. No storage choice is universally secure; evaluate the complete threat model.

### 8.3 IndexedDB and Cache Storage

IndexedDB and Cache Storage can support offline experiences and large datasets, but may retain sensitive data beyond the immediate session. Consider:

- Shared-device access.
- XSS access to same-origin data.
- Stale authorization and data after logout.
- Retention and deletion requirements.

Store only what the offline feature needs, and define cleanup and revalidation behavior.

## 9. Logout and Multi-Tab Security

Logout is more than removing one item from `localStorage`. Depending on the architecture, it may need to:

1. Revoke the server-side session or refresh token.
2. Expire authentication cookies.
3. Clear in-memory credentials and sensitive application state.
4. Remove sensitive IndexedDB, Cache Storage, and service-worker data.
5. Close authenticated WebSocket or SSE connections.
6. Notify other tabs and invalidate their private views.
7. Redirect to an unauthenticated route.

Use mechanisms such as `BroadcastChannel`, storage events, server-side session validation, and token/session revocation as appropriate. A tab that remains open after another tab logs out should not continue displaying or acting on private data indefinitely.

## 10. Input Validation, Sanitization, and URLs

### 10.1 Validation vs. Sanitization

- **Validation:** Determines whether input is allowed for a business rule or schema.
- **Sanitization:** Transforms or removes content that is unsafe for a particular output context.

They are not interchangeable. Frontend validation improves usability, but requests can bypass the frontend; the backend must independently validate data for security and integrity.

### 10.2 URL and Redirect Validation

Untrusted redirect destinations can create open redirects. Prefer relative paths, an allowlist, or mapping a known logical destination to a route rather than accepting arbitrary destinations.

Validate user-provided URLs before placing them in links or navigation. Allow only schemes and destinations required by the product; never assume that a syntactically valid URL is safe.

## 11. Dependencies and Third-Party Scripts

Frontend dependencies execute in the application context and contribute to its attack surface. A compromised direct or transitive dependency can affect every user of the shipped application.

Good practices include:

- Use a maintained dependency set and review new packages.
- Keep lockfiles and use reproducible builds.
- Monitor and remediate known vulnerabilities.
- Limit dependency privileges and remove unused packages.
- Protect package publishing and build credentials.
- Review third-party scripts for necessity, permissions, privacy, and performance impact.

### 11.1 Subresource Integrity

Subresource Integrity (SRI) lets the browser verify that a fetched resource matches an expected cryptographic hash:

```html
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-expected-hash"
  crossorigin="anonymous"
></script>
```

SRI is useful for versioned, immutable third-party assets. It requires hash updates when the resource changes and is less suitable for scripts whose content changes frequently.

## 12. Iframes and Microfrontends

### 12.1 Secure Iframe Messaging

When using `postMessage` between windows or frames:

- Specify the intended `targetOrigin` rather than using a wildcard.
- Validate `event.origin` and, where needed, the expected source window.
- Validate message shape and allowed message types.
- Treat messages as untrusted input.
- Do not expose secrets or privileged operations to an embedded frame.

### 12.2 Iframe vs. Module Federation

| Concern | Iframe | Module Federation / shared runtime |
| ------- | ------ | ---------------------------------- |
| Isolation | Stronger browser boundary when configured correctly | Runs in a more shared page context |
| Integration | More communication and styling boundaries | Easier composition and shared UI |
| Shared DOM and JavaScript | Generally isolated | Often shared |
| Security fit | Useful for untrusted or separately controlled content | May be appropriate for trusted internal teams with governance |

Remote JavaScript loaded at runtime can expand the trust boundary of the host application. For sensitive domains, use strict deployment controls, review remote code sources, and consider stronger isolation.

## 13. Privacy, Data Minimization, and Logging

### 13.1 Data Minimization

Return only the data the frontend needs. Hiding a field in the UI is not protection if the API already sent it to the browser. Likewise, masking a value with CSS does not protect the original data in the network response.

### 13.2 Consent and Third-Party Tracking

Respect consent before loading optional analytics or tracking scripts. Do not load a tracker first and ask for consent afterward when consent is required.

Consider privacy requirements such as GDPR and CCPA, data minimization, retention, and purpose limitation as part of the architecture.

### 13.3 Logging and Error Messages

- Redact tokens, credentials, personal data, and payment details from logs and telemetry.
- Use allowlists for fields sent to monitoring systems.
- Avoid exposing internal infrastructure details in user-facing errors.
- Return a correlation or request ID so support can find controlled server-side diagnostics.

Balance debuggability with information disclosure risk.

## 14. Secure File Uploads

File-upload security is an end-to-end responsibility. The frontend can improve UX and reject obviously unsupported input, but server-side checks remain authoritative.

Design for:

- Allowed file types, size limits, and upload quotas.
- Server-side validation of content rather than trusting filename or browser-provided MIME type alone.
- Malware scanning or content processing where appropriate.
- Safe storage and access control.
- Safe rendering or download behavior for uploaded content.
- Upload authorization, expiration, and cleanup.

Treat filenames and metadata as untrusted input. Avoid serving user uploads from a privileged application origin unless the content is safely handled.

## 15. Frontend-Adjacent Server Risks

Some risks originate in backend or server-rendering components but are important to frontend architecture.

### 15.1 Server-Side Request Forgery (SSRF)

Features such as URL previews, image fetchers, proxy endpoints, and server-side rendering can cause a server to fetch user-controlled destinations. Validate and constrain server-side outbound requests, including destination and redirect behavior. Client-side URL validation is not sufficient protection.

### 15.2 Server-Side JavaScript Injection

Server-rendered applications and Node.js services must avoid evaluating untrusted input as code. Keep untrusted data separate from executable templates and dynamic code paths.

### 15.3 Cross-Origin and Embedded Integrations

Server configuration, browser policy, and frontend messaging should be designed together. CORS, CSP, iframe permissions, and authentication need consistent, explicit origin rules.

## 16. Security Case Studies

### 16.1 Banking Frontend

- Prefer a session design with appropriately scoped `HttpOnly`, `Secure`, and `SameSite` cookies where suitable.
- Apply CSRF defenses to state-changing operations.
- Use safe rendering, context-appropriate sanitization, and a restrictive CSP.
- Prevent framing unless explicitly required.
- Avoid storing sensitive account data unnecessarily.
- Enforce transfer authorization on the backend.
- Do not blindly retry money transfers; use server-supported idempotency.

### 16.2 Social Media Platform

- Sanitize supported rich text and handle external URLs safely.
- Treat uploads and SVG content as untrusted.
- Avoid long-lived JavaScript-readable credentials where possible.
- Restrict script sources with CSP.
- Protect account actions with backend authorization and appropriate session controls.

### 16.3 Embedded Analytics Dashboard

- Define allowed embedding origins and use iframe sandboxing where practical.
- Minimize data exposed to the embedded application.
- Validate `postMessage` origins and payloads.
- Load analytics scripts according to user consent and privacy requirements.

## 17. Interview Questions

- How would you model trust boundaries in a frontend application?
- What is the difference between stored, reflected, and DOM-based XSS?
- Why does `HttpOnly` reduce token exposure but not eliminate CSRF?
- When would you choose cookies over browser storage for a session?
- Why are frontend route guards not authorization?
- How would you roll out a strict CSP in a legacy application?
- What does CORS protect, and what does it not protect?
- How should logout handle other tabs and offline browser storage?
- How would you safely embed a third-party application?
- What are the security trade-offs between an iframe and a shared-runtime microfrontend?
- Why is masking sensitive data in the UI insufficient?
- How would you protect user-uploaded content and third-party scripts?
