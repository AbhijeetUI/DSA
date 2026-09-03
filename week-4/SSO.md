# Google and YouTube Single Sign-On (SSO) Flow

This document details the step-by-step cross-domain authentication process that allows seamless access to YouTube once a user has authenticated via Google.

---

## 📋 Process Summary

1. **Google Login:** You log in at `accounts.google.com`.
2. **Cookie Storage:** Google stores a secure, Google-only session cookie in your browser.
3. **Visit YouTube:** You navigate to `youtube.com`.
4. **Redirection:** YouTube detects you are unauthenticated on its domain and redirects you to Google for verification.
5. **Recognition:** Google checks your browser cookies and recognizes your existing, valid session.
6. **Code Issuance:** Google generates and sends a temporary authentication code back to YouTube.
7. **Verification:** YouTube receives and verifies the code with Google's backend servers.
8. **Session Creation:** YouTube creates its own local `youtube.com` session cookie.
9. **Access Granted:** You can now use YouTube with your account features fully unlocked without re-entering your password.

---

## 🔄 Visual Workflow

```text
       [ User ]                  [ YouTube ]               [ Google ]
          │                           │                         │
          │────── Log In ─────────────┼────────────────────────>│
          │                           │                         │ (Validates credentials)
          │<───── Set Cookie ─────────┼─────────────────────────│ (Saves Google session cookie)
          │                           │                         │
          │────── Visit Website ─────>│                         │
          │                           │                         │
          │<───── Redirect ───────────│                         │ (Asks Google to verify user)
          │                           │                         │
          │────── Request Token ──────┼────────────────────────>│
          │                           │                         │ (Recognizes Google cookie)
          │<───── Send Temp Code ─────┼─────────────────────────│
          │                           │                         │
          │────── Handshake Code ────>│                         │
          │                           │────── Verify Code ─────>│
          │                           │<───── Token Confirmed ──│
          │                           │                         │
          │<───── Set Cookie ─────────│                         │ (Saves YouTube session cookie)
          │                           │                         │
   (Logged In)
```

---

## 🛠️ Key Components

- **`accounts.google.com`**: The centralized authentication authority.
- **Google Session Cookie**: A domain-specific identifier restricted to `*.google.com`.
- **Temporary Authentication Code**: A short-lived token used safely to bridge the gap between distinct domains.
- **YouTube Session Cookie**: A local cookie that keeps you logged in explicitly on `*.youtube.com`.
