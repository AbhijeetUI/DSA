# Google and YouTube Cookies: Quick Revision

## Core Rule

`google.com` and `youtube.com` **cannot directly share cookies** because they are different registrable domains.

- A cookie for `.google.com` is sent to Google subdomains.
- A cookie for `.youtube.com` is sent to YouTube subdomains.
- A Google cookie is never sent to YouTube.

## How Single Sign-On Works

Google and YouTube share **identity**, not the same cookie.

1. The browser opens `youtube.com`.
2. YouTube checks its own session cookie.
3. If authentication is needed, YouTube redirects the browser to `accounts.google.com`.
4. The browser sends Google cookies only to Google.
5. Google authenticates the user and returns a short-lived authorization code or assertion.
6. YouTube validates it with Google, usually server-to-server.
7. YouTube creates its own YouTube session cookie.

```text
Google cookie                     YouTube cookie
     |                                  |
accounts.google.com  ->  auth result  ->  youtube.com
     |                                  |
Google identity                     YouTube session
```

## Important Security Concepts

- **Cookie isolation:** One site cannot read another site's cookies.
- **Same-origin policy:** JavaScript on YouTube cannot access Google responses or cookies.
- **Top-level redirect:** Lets Google use its own cookies in its own domain context.
- **Short-lived authorization code:** Safer than sending a long-lived token in a URL.
- **Separate sessions:** YouTube can have its own expiration, permissions, and account data.
- **Third-party cookie restrictions:** Modern browsers increasingly block iframe-based cross-site cookies.

## Staff Engineer Summary

> Google owns the central identity session. YouTube delegates authentication to Google, receives a scoped authorization result, validates it, and creates its own session. The products share identity through an authentication protocol, not by sharing cookies.
