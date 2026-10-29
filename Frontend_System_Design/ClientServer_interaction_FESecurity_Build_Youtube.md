# System Design Session Guide
### Client-Server Interaction Patterns, Frontend Security Threats, and Building YouTube

> **How to use this guide:** Every topic below is linked from the table of contents. Jump to any section, and use the cheat sheet at the end ([Section 5](#5-quick-revision-cheat-sheet)) for last-minute revision before interviews.

---

## Table of Contents

1. [Session Recap and Agenda](#1-session-recap-and-agenda)
2. [Client and Server Interaction Patterns](#2-client-and-server-interaction-patterns)
   - 2.1 [Request-Response](#21-request-response)
   - 2.2 [Polling (Short Polling)](#22-polling-short-polling)
   - 2.3 [Long Polling](#23-long-polling)
   - 2.4 [When Should Polling Be Used](#24-when-should-polling-be-used)
   - 2.5 [Server-Sent Events (SSE)](#25-server-sent-events-sse)
   - 2.6 [WebSockets](#26-websockets)
   - 2.7 [Comparison at a Glance](#27-comparison-at-a-glance)
   - 2.8 [SSE vs WebSockets: What Is Really Different](#28-sse-vs-websockets-what-is-really-different)
   - 2.9 [Q&A on Interaction Patterns](#29-qa-on-interaction-patterns)
   - 2.10 [WebRTC and TCP vs UDP](#210-webrtc-and-tcp-vs-udp)
3. [Frontend Security: Threat Modeling](#3-frontend-security-threat-modeling)
   - 3.1 [Threat Modeling](#31-threat-modeling)
   - 3.2 [Cross-Site Scripting (XSS)](#32-cross-site-scripting-xss)
   - 3.3 [Cross-Site Request Forgery (CSRF)](#33-cross-site-request-forgery-csrf)
   - 3.4 [Clickjacking](#34-clickjacking)
   - 3.5 [Security Q&A](#35-security-qa)
4. [System Design Problem: Building YouTube](#4-system-design-problem-building-youtube)
   - 4.1 [How Such Interviews Start](#41-how-such-interviews-start)
   - 4.2 [Functional Requirements](#42-functional-requirements)
   - 4.3 [Non-Functional Requirements](#43-non-functional-requirements)
   - 4.4 [Interview Tips on Listing Requirements](#44-interview-tips-on-listing-requirements)
   - 4.5 [Problem 1: The Video Player](#45-problem-1-the-video-player)
   - 4.6 [Problem 2: Hover Thumbnails](#46-problem-2-hover-thumbnails)
   - 4.7 [Problem 3: Live Streaming and Live Comments](#47-problem-3-live-streaming-and-live-comments)
   - 4.8 [Problem 4: Comments on a Regular Video](#48-problem-4-comments-on-a-regular-video)
   - 4.9 [Playing Video Based on Internet Speed](#49-playing-video-based-on-internet-speed)
5. [Quick Revision Cheat Sheet](#5-quick-revision-cheat-sheet)

---

## 1. Session Recap and Agenda

**Covered in the previous session:**
- Basics of system design and the different rounds that exist in system design interviews
- How to approach system design interviews
- Rendering patterns (client and server rendering)
- Authorization models
- Feature flagging
- A few practical questions that are commonly asked in interviews

**Plan for this session:**
1. One more important topic: **client and server interaction**
2. Common **threats and security vulnerabilities**
3. A real system design problem: **building YouTube**

> **Tip from the session:** Delving deep into one system and picking problems out of it is a very common interview pattern at premium companies (the examples given were Adobe and Microsoft). The next sessions will switch to other patterns as well.

[Back to top](#system-design-session-guide)

---

## 2. Client and Server Interaction Patterns

Any good application that caters to a lot of users has some sort of client-server interaction. When a client (browser or mobile app) needs data from a server, it communicates using one of several interaction patterns.

**Each pattern is designed based on two things:**
- **How frequently the data changes**
- **How real-time the experience needs to be**

The patterns covered, in order: **Request-Response → Short Polling → Long Polling → Server-Sent Events → WebSockets**.

[Back to top](#system-design-session-guide)

---

### 2.1 Request-Response

The easiest pattern, and one everyone has definitely used.

**How it works:**
1. Client sends a request
2. Server sends a response
3. **Connection closes**
4. For any further update, the **client must request again**

**Example: login**
- The front end takes the user ID and password and sends them to the BE
- The BE checks them against the database, and sends a response back
- The connection closes

> **Takeaway:** This is the typical and most common client-server interaction.

**Simple example from the session:** the UI does a `fetch('/time')`, and the BE's `/time` API gets the server time, converts it to a string, and sends it back. The client makes a request, the BE gives the time back, and that's it. No further interaction.

[Back to top](#system-design-session-guide)

---

### 2.2 Polling (Short Polling)

**How it works:** The client **repeatedly asks the server for updates at a fixed interval of time**. Client requests, server responds, client waits, and asks one more time.

**Best for:** Simple real-time updates, whenever the server cannot push data.

**The problem:**
- Many times the server **may not have any data** for you. You made a call seeking updates and nothing changed on the BE, so **the call is wasted**
- With millions of users doing this, there can be **high server load**
- It is all subjective and depends on what other options you had, but in normal terms **polling adds more cost to the overall load**

**Example from the session:** a `/status` API returns a `Math.random()` value. The client keeps the API call **inside a `setInterval`**, so every 3 seconds it makes the call and expects data to come.

```js
// Client (illustrative)
setInterval(async () => {
  const res = await fetch('/status');
  const data = await res.json();
  // use data
}, 3000); // every 3 seconds
```

> This is what we call **short polling**: a call at a periodic interval, and the BE responds immediately.

[Back to top](#system-design-session-guide)

---

### 2.3 Long Polling

**How it works:**
1. Client sends a request
2. **Server holds the request until data changes**, then responds
3. Client **immediately sends a new request**

**Best for:** Near real-time updates, when sockets cannot be used.

**Example from the session:** the BE `/longpoll` waits for about 5 seconds to see if any data comes in that time, and after 5 seconds it processes the data and sends it. On the client, the call is made **recursively** (a new request fires as soon as the previous one completes).

**Short polling vs long polling:**

| | Short Polling | Long Polling |
|---|---|---|
| Client call pattern | Fixed interval | **Recursive**, no interval |
| BE behavior | Responds immediately | **Waits** for data, then responds |

[Back to top](#system-design-session-guide)

---

### 2.4 When Should Polling Be Used

> **Rule of thumb:** Use polling when you have a **predictable amount of time** in which data is supposed to arrive.

**Example from the session:**
- There are 10 different systems in the BE, and all of them need to process something
- **10 seconds is the maximum SLA** (the delay the product or business has agreed on)
- Something may complete in 2 seconds, so you poll every 1 or 2 seconds, and **after 10 seconds you stop**

**Right use case:** the call happens in a **finite interval of time**, not indefinitely.

**Wrong use case:** you have to keep calling throughout the life cycle of the application. If it is indefinite, a lot of calls go to the BE and there is no predictability. **Figure out a better strategy** (the techniques that follow).

[Back to top](#system-design-session-guide)

---

### 2.5 Server-Sent Events (SSE)

**How it works:** The **server keeps a connection open and continuously pushes updates to the client**. The client connects once, and the server keeps sending events.

**Key characteristics:**
- **One-way communication: server to client only**
- Client need not ask anything
- Server says "there is an update", and can send data many times

**Best for:** Data flow that is one-directional and can happen any time.
- Stock prices (the best example: the market updates very frequently, but only the server sends data)
- Live feeds
- Notifications

**BE (illustrative):**
- Set the content type to **`text/event-stream`**. This tells the browser it is not a one-time response, but a stream of data
- Set the connection to **keep-alive**, so the HTTP connection between client and server is kept alive
- Every interval (e.g., every 2 seconds) check whether anything changed, and send it

```js
// BE (illustrative)
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Connection', 'keep-alive');
setInterval(() => {
  res.write(`data: ${Date.now()}\n\n`);
}, 2000);
```

> The session noted this is **representation only**. In reality, for stock prices the BE might call the stock exchange API every ~200 ms. If the price changed, it informs the client. If not, it does not.

**Client:**
- Subscribes to the **event source** (`/events`)
- Whenever an event arrives, it parses the data and updates the UI (e.g., render stock price information)

```js
// Client (illustrative)
const source = new EventSource('/events');
source.onmessage = (e) => {
  const data = JSON.parse(e.data);
  // render on UI
};
```

**Important points:**
- **Nothing here is library-driven.** The event source and the event emission are all built into the vanilla way of building applications
- Client need not keep calling the BE (unlike polling)
- Very well suited when there is a lot of real-time communication, but **only the server sends data**

[Back to top](#system-design-session-guide)

---

### 2.6 WebSockets

So far, everything has been one-way. Think of **SSE as a pipe that only works top to bottom**. A **WebSocket is also a pipe, but both ends can use it at once**.

**How it works:**
- **Persistent connection** where both client and server can send messages any time
- **Two-way real-time communication**
- A dedicated connection path is established between client and server, and they keep interacting

**Best for:**
- **Chat apps** (the best example: you send me a message, I send you one back, over a dedicated channel)
- Multiplayer games
- Live collaboration
- Anything on a live feed

**Notes:**
- Unlike SSE, WebSockets are **not a built-in capability**. You subscribe to that protocol or install packages
- BE example: a server opened on **port 8080**. On connection established, when someone sends a message it can send the message to the user. You can add a delay or make it real-time
- Client example: the client opens the socket, receives messages, and can also send them
- There is still a BE layer in the middle, but you get a **pipe** where two clients can message each other quickly

[Back to top](#system-design-session-guide)

---

### 2.7 Comparison at a Glance

| Pattern | Real-time? | Complexity | Typical use case |
|---|---|---|---|
| **Request-Response** | Not real time | **Quite low** | APIs (most of us implement this) |
| **Short Polling** | Not real time, there is a slight delay | Low | Simple updates for a finite time |
| **Long Polling** | Relatively more real time (technically "live" compared to short polling, though not truly real time) | Low to moderate | Near real-time when sockets cannot be used |
| **Server-Sent Events** | **Real time** | **Low**, because nothing third-party is needed, it is built in | Notifications, stock prices |
| **WebSockets** | **Real time** | **Relatively higher** | Chat, games, two-way communication |

[Back to top](#system-design-session-guide)

---

### 2.8 SSE vs WebSockets: What Is Really Different

> **The question to ask yourself:** If SSE has a channel where the server keeps sending information, and WebSockets have a dedicated channel too, what is the core difference? How is it enforced that the client cannot send data in SSE?

Interviews often ask this kind of analytical question.

**SSE uses a normal HTTP connection from start to finish.**
- The browser sends an HTTP request
- The server **keeps the HTTP response open** and continuously streams data
- Communication is one-way, server to client

**The phone call analogy:**
- HTTP was meant for: you called me, I spoke to you, you spoke to me, and we **end the call**
- SSE: you called me, but the connection is still open and I am not sending anything meaningful right away. After a point, once I'm done with my work, I start speaking again
- So SSE is more like **"hacking" what HTTP was meant for** to achieve the requirement. It is still a request-response pattern, just that the server sends events back

**WebSockets start with HTTP, then switch protocols.**
- The first request (the **handshake**) is an HTTP request
- After that you move to a **different protocol** (**`ws` or `wss`**)
- That protocol is **duplex in nature**, so you can send data to and from
- After the switch, you are **no longer using HTTP**

> **One-liner to remember:**
> **SSE** is a long-lived HTTP connection where the server continuously streams data to the client.
> **WebSocket** starts with an HTTP handshake and then switches to the WebSocket protocol, enabling real-time bidirectional communication.

[Back to top](#system-design-session-guide)

---

### 2.9 Q&A on Interaction Patterns

#### Why change the protocol for WebSockets? What is the tradeoff?
- HTTP is a **request-response protocol**. You send a request, you get a response. You can delay the process (SSE is a good example), but **it is not meant for duplex communication**
- WebSockets are about a **dedicated connection**: a message sent should be immediately received by the receiver, and the same goes back
- HTTP is not designed to offer that as a feature, **that is why we switch to a new protocol**
- You could try to hack HTTP to behave that way, but it is not meant for that. **The benefits of sockets cannot be had using the HTTP protocol**
- The speaker's honest take: SSE arguably "should not have existed", and probably was not in anyone's mind when the protocol was designed. It probably exists because the protocol supported some event stream for a short time, and similar to JavaScript, some things continue to exist because of **backward compatibility**

#### ChatGPT uses SSE and not WebSockets, despite being a chat app. Why?
- In that chat use case, you send the request, and your part is done. The server then **periodically sends data in multiple parts**, one after another. It may think for some more time and send something else
- That is **one way**, so SSE can be a good fit
- But some systems still use sockets because they may have **greater use cases than what we know**

**LinkedIn vs WhatsApp example:**
- Chatting on LinkedIn is rare and mostly official (maybe less than 10% of your communication). SSE may look like a lucrative option there
- But LinkedIn may need to show whether you are **online or not**, or pass other information to the BE, so internally it may still opt for WebSockets

**Zerodha example:** a good use case for SSE because the client need not send anything. But there may be hidden reasons (a lot of information expected from the client) that mean they use sockets.

> **Interview mindset:** Always think about the **use case you are being told**, and what the right implementation is for it.

#### Will interviewers ask for code on long polling, short polling, and sockets?
- In the machine coding round, similar things have been asked
- Coding is not hard as long as you know how to make an API call at a periodic interval
- **Sockets are a very common interview question:** build a simple chatting UI where user A sends a message to user B, and user B receives it using the socket
- Sometimes the socket BE is already ready, sometimes you are allowed to search online to set up a simple node server
- These can be on the **difficult end** for a 1-hour interview. They are more common in **1.5 to 2 hour** interviews
- **Probability estimate from the speaker:** about **70 to 80%** it is asked in **high-level design rounds**, and **20 to 30%** in coding rounds
- Be aware of **both the implementation and the theory**

#### Multi-tab logout: do we use SSE?
No need. Use an **event publishing mechanism**. When one tab logs out, publish an event from that tab. All other open tabs subscribe to that event, and make the necessary UI changes to log the user out.

#### Can SSE be used for real-time data updates, even video data?
- Yes for real-time updates (stock market is the use case)
- Underneath is **TCP**, which does not bother what data you send (image, voice, text). It takes data from place A to place B
- So multimedia can be sent over SSE too (**base64** and **blob** were mentioned as ways)

> **Be aware of:** what sockets are, what SSE is, what the request-response pattern is, and **when to use which one**.

[Back to top](#system-design-session-guide)

---

### 2.10 WebRTC and TCP vs UDP

**WebSockets vs WebRTC:**
- **WebSockets:** a server is involved. The client sends a request to the server, and the server sends it on. Both clients have subscribed to the server, so there is always server involvement
- **WebRTC:** technically not a protocol, but the techniques where **no server is involved in the middle**. A good use case is a **live video call or audio call** (like the Zoom call the session was on)

**Under the hood:**
- **WebSockets use TCP**
- **WebRTC uses UDP**

**TCP vs UDP (as explained):**
- **TCP:** no packet loss. It ensures all packets are passed, so it is very reliable
- **UDP:** no guarantee that all the data you want to pass gets passed
- In a **video or audio call**, losing some packets is fine, and UDP is **faster** than TCP
- Other request-response patterns use TCP behind the scenes

> **Resource mentioned:** For a deep dive into how the network layer works (how many TCP connections a website can open, older web vs newer web), the speaker recommended a creator whose videos go into extreme technical depth (shared in the Discord community; patience required).

[Back to top](#system-design-session-guide)

---

## 3. Frontend Security: Threat Modeling

### 3.1 Threat Modeling

**Definition:** Identify **how attackers could exploit your front end**, and **prevent those attack paths**.

**Goals:**
- Prevent malicious execution
- Protect the user session
- Protect data integrity

> As a developer, you should be aware of the common attacks and how to handle them. The three covered below are quite commonly asked and critical from an interview point of view. There are many other attacks as well.

**Interview expectation:** People may ask how you would handle an attack. **Know what the attack is, and how you can solve it.**

[Back to top](#system-design-session-guide)

---

### 3.2 Cross-Site Scripting (XSS)

**What it is:** An attacker **injects malicious JavaScript into your web page**, and the **browser executes it as trusted code**.

- The browser cannot distinguish attacker code from your code
- It executes the code as is, instead of treating it as content

#### How it happens

Imagine your app allows users to post comments. You store them and display them on the page. If you render whatever the user entered **as is** as raw HTML (e.g., using `dangerouslySetInnerHTML`, because you support rich text), then an attacker can enter something like:

```html
<script>alert('Your session is stolen')</script>
```

If you render this, the script **gets executed**.

**Worse:** it can do a `fetch` that takes the cookie from the current site and passes it to the attacker's website. Example: you are on facebook.com, add a comment that grabs the cookie, and sends it to your own site.

**What the browser does:**
1. React renders HTML
2. Browser parses the HTML
3. Browser executes the script tag
4. Malicious code runs
5. User session is compromised

#### What attackers can steal

Technically **anything that is accessible to your website**:
- Cookies (if **not HTTP-only**)
- Local storage and session storage
- JWT tokens (if not stored in a safe way)
- Anything on the DOM
- User actions
- Any API call your website can make

#### How to prevent XSS

- **Use a framework like React.** React already has this capability. Unless you use `dangerouslySetInnerHTML` (or set `innerHTML`), React will never execute a script that came in as input
  - React **automatically escapes** the script, treating `<` and `>` as symbols and showing the text on the UI instead of executing it
  - Like printing special characters using escape codes (e.g., `&lt;`, `&gt;`)
- **If you must render HTML as is, sanitize it first.** Use libraries to purify it. **Sanitization removes script tags, event handlers, and malicious attributes** before you render
- **HTTP-only cookies:** with HTTP-only set, the website (scripts) cannot access the cookie. Only the browser can, and it passes it along with requests
- **Content Security Policy (CSP):** even if a script is ingested, setting the policy to **`self`** means only scripts written within your website are executed. You can set it from the server in the **response header** (e.g., when loading `index.html`) or sometimes with an **HTML meta tag**
- **Do not store tokens in local storage**, which has a higher chance of being compromised

> **Why it is named "dangerously":** It is like the "smoking causes cancer" warning on a cigarette pack. The word itself says you are explicitly bypassing the security React already has, so use it carefully.

**Summary:** XSS is an attack where an attacker ingests some script into your website, and that script can access anything your website can access (because it technically runs on your site), and share it with the attacker.

#### Variations of XSS

##### Stored XSS
- Among all the attacks, the speaker considers this **one of the most severe**
- On the UI you will not know anything. **Your site is getting compromised**
- **Malicious code is saved in the database** (via a comment, profile bio, forum post)
- The attacker typically has some basic idea of your database structure
- Example: a malicious query like selecting everything from the comments table, so you return all comments instead of specific ones
- Flow: user posts a comment, it is stored in the DB, **shown to millions**, and **malicious scripts execute for every viewer**
- **Typical motive example:** during big sales (e.g., e-commerce), a competitor wants to **make the site slow or down**. The intent is not to take money directly. If Company A's site is slow and Company B's is fast, Company B benefits

##### Reflected XSS
- Applies when the **BE itself frames the HTML response** (common in server-driven UI websites where the client has minimal control over what is rendered)
- Example: on error, the server puts `${error}` directly into the HTML body. If the attacker changes the error input to `<script>alert('hacked')</script>`, the client renders it and the script executes
- **Why it is a good attack:** if you are on the checkout page about to place an order and get a pop-up saying "your site is hacked", you will immediately stop the transaction. That can **stop a genuine user from buying**
- Or it could do something actually malicious: take the user's cookie and send it to the attacker's website, so the attacker has a **session token** and can make more API calls
- **How to avoid:** protection at **both places**
  - BE should **sanitize** the error message before sending it
  - Client can sanitize too, or use a framework like React

##### DOM-based XSS
- An extension of what we just saw, but **no server is involved**
- The client injects whatever information it gathered from the user (or server) **without sanitizing or checking the content**, causing unintended effects on the UI

> **Also note:** Scripts can be ingested into your **BE** too. Without proper protection, that code can execute, slow down your site, or pull information and pass it to the attacker.

[Back to top](#system-design-session-guide)

---

### 3.3 Cross-Site Request Forgery (CSRF)

**What it is:** The attacker **tricks the user's browser into sending an authenticated request**. A very commonly asked interview topic.

**Example:**
1. User logs into **banking.com**
2. User then goes to another site, say **gift.com** (the attacker's site, which seems genuine)
3. gift.com already has a form with an `action` and `method="post"`, and runs `document.forms[0].submit()` as soon as it opens
4. A **request is made to the bank behind the scenes**, and the user does not even know it happened (unless inspecting network calls)
5. If your cookie or token is not protected, the attacker can get hold of it, and do whatever they want

```html
<!-- Attacker's page (illustrative) -->
<form action="https://banking.com/transfer" method="POST">...</form>
<script>document.forms[0].submit();</script>
```

> **Short version:** You open a website, and even before you know, an API call is already made to transfer important information from your site into a malicious website.

#### How to prevent CSRF

**1. SameSite cookie property: `Lax` or `Strict`**
- Depending on the use case, you can restrict others from accessing your token
- The request must originate from the **same site** for the cookie to be sent
- **`Lax` and `Strict` solve this 99% of the time**
- With `Strict`, the browser knows the cookie should be passed only from this origin (even opening it in another tab, the cookie is sent only for this tab at this instance)
- The `SameSite` value is set by the server when it sends the cookie, and the browser reflects it

**2. CSRF token (extra layer, for extremely secure sites)**
- A **secret value generated by the server** and sent to the front end
- Every **sensitive request** (e.g., payment transfer) must include this token
- **Cookies prove identity. CSRF tokens prove intent.**
- Not recommended for every application. Banking-type sites that do everything in their control to be safe can opt for it

**3. Double submit cookie pattern**
- The server sends the same token in **two places**: in the cookie, and in the request header/body
- The BE checks that **both are the same** when processing
- Instead of sending the token only during login, it can be sent for every request-response pattern, and the client sends both tokens for the BE to evaluate

> **Honest caveat from the speaker:** If your token itself gets compromised, it doesn't matter whether you have two tokens or ten. If you think your token can be protected well, you don't need the multiple-token approach.

[Back to top](#system-design-session-guide)

---

### 3.4 Clickjacking

(Also called **click hijacking** in everyday conversation. The official term is **clickjacking**. Both mean the same thing, so just be aware of both in interviews.)

**What it is:** The attacker **loads your site inside an invisible iframe and tricks the user into clicking**.

**Example:** The user thinks they are clicking "Play video", but behind the scenes it triggers a **transfer money** flow.

#### How the attack is set up

1. The attacker's site (e.g., evil.com / gift.com) puts an **iframe** with `bank.com/transfer` in it, styled with **position absolute and `opacity: 0`** (invisible)
2. The bank page is **fully loaded**, and the user is **already logged in** (maybe in another tab). The transfer page is ready but invisible
3. The real transfer button exists and is clickable
4. The attacker places a **fake button** (e.g., "Play video") on top, carefully aligned so that it **exactly covers the real transfer button** inside the iframe
5. The user clicks the fake button, and the **real bank button triggers**, executed as an authenticated user. Money gets transferred

```html
<!-- Attacker's page (illustrative) -->
<iframe src="https://bank.com/transfer"
        style="position:absolute; top:0; left:0; opacity:0;"></iframe>
<button style="position:absolute; top:0; left:0;">Play video</button>
```

#### Why does the browser allow this?
- An iframe is an **acceptable way of embedding UI**
- **Opacity 0 does not disable the click**
- The browser does not know user intent. It **only knows the coordinates**. Whatever click needs to happen, will happen

**Difference from the previous attack:** here you are loading **your own site** itself. If security measures are not taken, the site is in the right place to transfer an amount, and all it needs is your click.

**Why bother with a fake click when an API call might work without a click?** Sometimes the attacker just has to **bring you from some site to their evil site** (imagine reading your email), and they can show you things that make you click, without knowing whether it is true.

**Physical analogy:** There is a TV remote on the table. Put a transparent glass (or fiber sheet) on top and draw fake buttons on it. The glass shows "1" where the real button is "2". You think you are pressing one thing, but behind the scenes something else gets pressed.

> **In one line:** The user thinks they are pressing something genuine, but behind the scenes something is happening without the user's consent.

#### How to prevent clickjacking

**1. `X-Frame-Options` header**
- If you set it to **deny**, your website will not load in an iframe
- The easiest method, and a lot of websites already have this

**2. CSP `frame-ancestors`**
- Content Security Policy `frame-ancestors`
- Can be set as an **HTML meta tag** or as a **response header** on the initial page load. The browser takes care of the rest
- **`frame-ancestors 'none'`:** nobody can embed your website in an iframe anywhere
- **`frame-ancestors 'self'`:** only pages from the **same origin** can embed it. Example: on one origin, a `dashboard` page can be embedded as an iframe in the `help` page, but nobody else can

**3. Frame busting**
- Check whether your page is the top window: if `window.top !== window`, then set `window.top.location = window.location`
- The whole website gets refreshed and goes directly to your site

```js
if (window.top !== window) {
  window.top.location = window.location;
}
```

**Choose based on your product:**
- **YouTube** will not set it to none, because they want their videos embedded on other websites
- **Google Maps** will not either, since they want maps embedded in different sites
- **A banking site** where embedding should not happen: apply the policy

> **Try it yourself:** Spin up a simple `index.html`, try loading another website (like a bank site) in an iframe, and see that it does not load. Anyone can try this.

[Back to top](#system-design-session-guide)

---

### 3.5 Security Q&A

#### Where should the CSRF token be stored: Redux, cookie, or local storage?
- A good question. With multiple tokens, the browser will not know which token to send, so you need to **think about a storage mechanism**
- Local storage is **not the right use case**
- You should use **session storage**, backed by **some sort of encryption**, so that even if an attacker gets hold of it, they should not be able to decrypt the token
- Store things in the session, not anything persistent

#### Are `SameSite` cookie and CSP headers set on the server side?
Yes. `SameSite` is a property sent when the BE sends the cookie to the client. Whatever value is sent is what the browser uses.

[Back to top](#system-design-session-guide)

---

## 4. System Design Problem: Building YouTube

### 4.1 How Such Interviews Start

The interviewer asks you to **list the functional and non-functional requirements**. (The speaker used Excalidraw for drawing. Use any tool you are comfortable with.)

**The problem statement:** You, as a developer, staff engineer, architect, or lead, are expected to **build YouTube from scratch**. What are your functional requirements and non-functional requirements?

#### Functional vs non-functional

- **Functional requirements:** things that **affect the user directly**. They are the **core of the product**. If these are not there, you won't use the product itself
- **Non-functional requirements:** things like performance, accessibility, translation. They are **not unimportant**, and they complement the functional requirements. But if, for example, accessibility is missing, YouTube is still usable. If translation is missing, English speakers can still watch the videos

> For simplicity, the session sticks to the **user's persona**, not the creator's persona (so video upload is left out).

[Back to top](#system-design-session-guide)

---

### 4.2 Functional Requirements

Collected during the session (grouped for readability):

| Category | Features |
|---|---|
| **Video player** | Play and pause, volume, settings, captions and language selection, speed, quality, skip forward, auto play, **ad placement inside video**, handling network drops (loading spinner, video freeze), playback speed, **iframe support**, PWA support (if it is a core feature for you) |
| **Video browsing** | Browse, **recommendations**, next placement |
| **Search** | Searching videos |
| **Engagement** | Comment, like, dislike, **share** (sharing a URL) |
| **Channel and subscription** | Subscribe to channels, **notifications** |
| **Personal library** | **History**, **playlists**, queue, **favorite and liked videos**, **download for offline** |
| **Live** | **Live streaming**, live chat |
| **Authentication and authorization** | Login, and restricted content (e.g., 18+ content, so a YouTube account alone doesn't allow watching everything) |
| **Settings** | User settings |
| **Complaints** | **Report**, **ban channels**, etc. |
| **Premium and membership** | Premium features such as ad-free, **exclusive member videos** (creators get a cut), payments |
| **Content safety** | **Blocking sensitive content** |
| **Localization and globalization** | Multiple languages. Localization means supporting multiple languages within a country like India. Globalization means selectively supporting global languages |

**Notes from the session:**
- **Playlist and layout** are "less important" functional requirements, not non-functional
- **Total number of views** was suggested as a requirement
- **PWA support:** if you consider it a core feature, it is a functional requirement. If your intent is not to make a PWA, you don't need it as one
- Something you need to support **explicitly** and consider a core feature belongs in functional requirements
- Creator-side items (e.g., making a vlog, uploading) come from the creator persona and are out of scope here

[Back to top](#system-design-session-guide)

---

### 4.3 Non-Functional Requirements

- **Performance**
- **Accessibility**
- **Translation**
- **Responsiveness** (very important, depending on which device you are using)
- **Security** (how you make sure your site is secure)
- **Fault tolerance**
- **Low latency**
- **Analytics** (analytical events)
- **SEO**
- **Caching** (not listed in the session's initial list, but called out as something that can be added)

> **Good news:** Non-functional requirements **do not change heavily from system to system**. You can remember this set and use it across almost all systems. Some systems focus more on certain aspects, and some less (e.g., a site may not care much about accessibility given its user base, or may support only one region so translation is not a focus).

[Back to top](#system-design-session-guide)

---

### 4.4 Interview Tips on Listing Requirements

- **Listing many requirements shows a vision.** If someone can list 17 requirements, it tells the interviewer they know the system and can remember and articulate all of them. The speaker would have listed maybe 8 to 10 alone
- **First test as a staff or lead:** can you foresee all the requirements?
- **Do not add features you don't know how to architect.** It can **backfire**, because the interviewer can keep digging deeper
  - Example: the **share** feature. If the interviewer is interested in the mobile version and you're not sure how sharing is implemented there, it can backfire
- **But don't be overly protective either.** If you only say things you're completely sure about, you may be undervalued
- **Find the middle ground:** include things you can explain to some extent. Don't include things you're not sure about
- This is **phase one** of the interview. Sometimes the interviewer already has questions to ask, and sometimes they pick one from your list

[Back to top](#system-design-session-guide)

---

### 4.5 Problem 1: The Video Player

**The player includes:** the video area, play/pause, volume, settings (quality, playback speed, subtitles/captions, audio language, sleep timer), and more.

> **Perspective:** The player is not a simple aspect. For YouTube as a product, maybe **60 to 70% of the effort** goes into building the player well. If recommendations or share are not working, you're fine, but **as long as the video plays, the crux of the requirement is being met**.

Many companies offer the **video player as a service** (subscription-based), because it is not a small problem to solve.

#### Step 1: Ask about the timeline

The most basic video player is just the HTML **`<video>` tag** with a source. But that alone won't do, because:
- The source would need to be kept locally or **downloaded completely from the server**
- **Data security:** somebody should not be able to access your video
- Video must work across **platforms** (mobile, tablet, browser) and **network speeds** (2G, 3G, 5G, Wi-Fi)

**First question to the interviewer: what is the timeline?**

| Timeline | Recommended approach |
|---|---|
| **Short (e.g., 1 month to a prototype)** | **Don't build the player yourself.** Look at players already in the market, compare rates and functionality, and pick one (e.g., Vimeo offers a service). Build the prototype with it, and in parallel build your own as time permits (**plan B**) |
| **No time constraint** | **Build it yourself**, by slowly building on top of the simple video tag |

> **Interview insight:** It may not look like an attractive technical answer, but it **is** a technical answer. Not everything is meant to be built in the interview. Be logical enough to see what you **cannot build yourself** and what is good to consume from others. (Same as using third-party tools for logging user events or network request failures.)

#### Step 2: Building it yourself

**Break it into blocks:**
1. **Build the UI** for the player (buttons and features)
2. **Set up the data source** for the player (depending on internet speed and selected quality)
3. **Ensure security** for the player

**How video gets delivered (simplified):**
- The BE has **multiple copies of the video across different resolutions**
- The client continuously interacts with the BE and **sends the user's internet speed over short periods**
- Depending on the speed, the **next chunk** of video is sent. Good internet means the best quality. If speed drops, it serves lesser quality
- YouTube does **not** send the complete video to the client. It sends a **series of chunks** that are **assembled on the client** so the video can be played
- A lot of **encryption and decryption** is used. The same stream going to another player may not play, since it is custom-made logic
- You can use **HLS** or **DASH** protocols as well

# Reference Guide: Media Streaming Protocols & Codecs

## 1. DASH (Dynamic Adaptive Streaming over HTTP)
**DASH**, also known as MPEG-DASH, is an **international open-standard adaptive bitrate streaming protocol** developed by the Moving Picture Experts Group (MPEG). It enables high-quality media delivery over the internet by dynamically adjusting video and audio quality in real time based on a viewer's network conditions and device performance.

### How DASH Works
Instead of streaming a video as one continuous, massive file, DASH relies on a multi-step segmentation process:
* **Encoding:** The source video is compressed into multiple quality levels (different bitrates and resolutions, such as 1080p, 720p, and 480p).
* **Segmentation:** Each resolution version is sliced into small, independent chunks (typically 2 to 10 seconds long).
* **The Manifest File (.MPD):** An XML-based index file called the **Media Presentation Description (MPD)** is created. It acts as a roadmap, telling the video player what quality options exist and where to fetch the corresponding chunks.
* **Client-Driven Adaptation:** The video player reads the MPD file and monitors the user's internet speed. If the connection is fast, it fetches the highest quality chunks; if the bandwidth drops, it automatically requests lower-quality chunks for the next few seconds to prevent buffering.

### Core Benefits
* **Codec Agnostic:** Not tied to specific compression technologies. It supports an array of audio and video codecs, including H.264, H.265 (HEVC), VP9, and AV1.
* **Standard Infrastructure:** Operates over standard HTTP/HTTPS protocols (ports 80 and 443), utilizing existing web servers and Content Delivery Networks (CDNs).
* **Universal Compatibility:** Broad native or library-supported compatibility across web browsers, Android devices, Windows systems, and Smart TVs.
* **Robust Content Protection:** Native integration with multiple Digital Rights Management (DRM) platforms (e.g., Google Widevine, Microsoft PlayReady).

### DASH vs. HLS

| Feature | DASH (MPEG-DASH) | HLS (HTTP Live Streaming) |
| :--- | :--- | :--- |
| **Developer** | MPEG (International Open Standard) | Apple |
| **Compatibility** | Universal (Web, Android, Smart TVs, Windows) | Native to Apple ecosystem (cross-platform via libraries) |
| **Codec Support** | Codec-agnostic (H.264, H.265, VP9, AV1, etc.) | Historically restricted (primarily H.264 and H.265) |
| **Manifest Format**| `.mpd` (XML format) | `.m3u8` (Plain text/playlist format) |
| **Standard Low Latency** | LL-DASH (<3 seconds) | LL-HLS (~3 seconds) |

---

## 2. Codecs
A **codec**—short for **co**mpressor/**dec**ompressor (or **co**der/**dec**oder)—is a device or computer program that **shrinks large video, audio, or data files for faster transmission and expands them for playback**. 

### Why Codecs Are Essential
Raw, uncompressed digital video and audio files are incredibly large. Codecs solve this problem through two core actions:
* **Compression (Encoding):** Strips out redundant or invisible data to make the file small enough to travel over the internet or fit on a hard drive.
* **Decompression (Decoding):** Unpacks the file in real-time when you hit play so it can display correctly on your screen and speakers.

### The Two Types of Compression
* **Lossy Codecs:** Discard data that the human eye or ear can't easily perceive to achieve massive reductions in file size. Used by almost all streaming platforms.
* **Lossless Codecs:** Reduce file size without losing any original quality or data. Used primarily in professional editing, archiving, and high-end audio.

### Common Codecs in Use Today

| Codec Type | Codec Name | Common Uses | Key Characteristic |
| :--- | :--- | :--- | :--- |
| **Video** | **H.264 (AVC)** | Blu-rays, YouTube, older streaming | Universal compatibility, but less efficient for 4K. |
| **Video** | **H.265 (HEVC)** | Netflix, 4K streaming, iPhones | Highly efficient; cuts H.264 file sizes in half. |
| **Video** | **AV1 / VP9** | YouTube, Netflix, modern web browsers | Open-source, royalty-free codecs for high-res web video. |
| **Audio** | **AAC** | Apple Music, YouTube, default web audio | High-quality lossy audio standard. |
| **Audio** | **MP3** | Legacy digital music tracks | Universal compatibility, but older technology. |
| **Audio** | **FLAC** | Audiophile music distribution | Lossless audio format; large file size but perfect quality. |

### Codecs vs. Containers
* **The Codec:** The actual mathematical formula used to compress the video and audio tracks *inside* the file. 
* **The Container:** The "wrapper" or box (like MP4, MKV, or MOV) that holds those video and audio tracks together, along with subtitles and metadata.
* *Analogy:* The container is the cardboard shipping box, and the codecs are the efficient vacuum-sealed bags packing the clothes inside.


[Back to top](#system-design-session-guide)

---

### 4.6 Problem 2: Hover Thumbnails

**The problem:** When you hover over a time position on the video, a **small thumbnail image** relevant to that timestamp is shown. (Very commonly used on Prime, Hotstar, etc., for example to know when a song ends and how far to skip.)

**Why it's not trivial:** Say a 2-hour video, with a thumbnail every second. If you extract them as separate images, **where do you store them?**

#### Approaches discussed

| Approach | Verdict from the session |
|---|---|
| **Tooltip with an image tag**, images extracted from the video | Where do the images come from, and where to store them? |
| **Send a timestamp request to the server** to get the image | Good approach (assuming the server has the images) |
| **Map of timestamp → image URL** | Good, similar to above |
| **Download all thumbnails up front, cache them, map them to timestamps** (thumbnails are small and don't need good quality) | **Close to what YouTube actually does** |
| **Extract the first image from every chunk** | Problem: some chunks might **not be loaded yet**, but the user may hover there |
| **Fetch thumbnail metadata for the next X seconds as the user progresses** | Problem: the user may hover **anywhere** (e.g., jump to the last part to find songs in a movie). It works only if user behavior is constrained |

#### What YouTube does

- Images are downloaded up front for a video and kept locally, then mapped with timestamps
- **Key extension:** it is **not hundreds of images**. There is **only one big image** (a sprite, for example `one.jpg`) that **contains all the thumbnails** as tiny images in a grid (1, 2, 3, 4...)
- The client, depending on the **dimension and resolution**, extracts the right thumbnail from that image using **specific coordinates (x, y)**
- So only **one image** comes to the client, and it holds the thumbnails for the entire video

[Back to top](#system-design-session-guide)

---

### 4.7 Problem 3: Live Streaming and Live Comments

**Live video streaming:** uses techniques like **WebRTC**, which under the hood uses multiple different protocols for streaming the video.

**The challenge:** the **live comments** panel next to the video. A bar below the video holds the settings, and on the right is a live comments feed with a comment box. For a popular video, many people keep commenting live.

**Question:** Which communication pattern (request-response, SSE, WebSockets, polling) would you use for live comments, and why?

#### What the group answered

| Suggestion | Reasoning |
|---|---|
| **Polling** | Show all messages within an interval |
| **SSE** | The server can broadcast new comments to every user |
| **WebSockets** | Live in nature, somebody comments while others receive, and you also send |

> **The speaker's reminder:** there is no right or wrong in system design. It all depends on your **use case** and what you want to build.

#### The speaker's recommendation: WebSockets

- Live comment is **technically a group chat**, like a WhatsApp group chat. In a WhatsApp group chat, most would pick sockets. YouTube has the same shape but with a much larger scale (hundreds to **lakhs** of viewers on popular streams, e.g., cricket or big news)
- Why sockets: **you can send a message, and somebody else can also send a message**, and all should be shown live
- Live score (cricket or football) is a good **SSE** example, since only the server sends the score. **Here, you are interacting too**

#### Why not the others?

- **Polling:** can be OK for a short period, but what if comments stop while thousands are still watching? If you keep polling, you **simply waste resources**. **If you do not know when to end it, don't use polling.** If you know when to end it, polling is a good option
- **SSE:** not that bad. Technically, anything that can be built with sockets can be built with SSE. But **your message also needs to be broadcast to everyone**, so the BE must take your message and broadcast it to all, including yourself. Sockets fit better

**Other notes:**
- **Older comments before the user joins:** YouTube loads only **a few previous messages**, not millions
- A service worker was suggested for older comments, which is possible if you wish to show them

[Back to top](#system-design-session-guide)

---

### 4.8 Problem 4: Comments on a Regular Video

**Scenario:** On a regular (not live) video, comments are static but can keep updating. You are scrolling, and someone adds a new comment. **The most recent comment should be shown on top.** How would you implement it? What is the right means to update comments onto the top?

#### Suggestions from the group
- **Show only after refresh**
- **Fetch comments in batches**, and on scroll add the fetched ones using a **stack**
- **Server-sent events** or sockets for live updates
- If based on **pagination**, refresh on scroll

#### The speaker's recommendation

**Do not make these live comments.**

**Reasons:**
- For a typical video, after the initial buzz (e.g., 6 to 8 hours after a famous creator uploads), comments **drop**
- **Showing comments is not mission-critical** for YouTube. Playing the video is
- So: **no auto-fetching** with SSE, sockets, or polling. Use an **on-demand request** as the trigger
  - Whenever the user scrolls to the end of the page, make the call, get the comments, and add them
  - Nothing happens in an automatic way

**Good UX add-on:** a small **tooltip** such as "5 new comments added" when the user scrolls back up, so new comments can be added on top.

> **If the interviewer insists on real-time updates,** then you can pick from the different techniques. Ask more questions to understand the requirement, and give an appropriate answer.

[Back to top](#system-design-session-guide)

---

### 4.9 Playing Video Based on Internet Speed

- When internet speed changes, **get the new chunk from the BE** at the appropriate quality
- The speaker has no official source, but for **one video uploaded, there are at least ~200 different videos made** depending on resolution, quality, and so on
- YouTube serves the right one depending on your request

> More of this will be covered in upcoming sessions, where the group will derive solutions and then counter opinions to build better systems.

[Back to top](#system-design-session-guide)

---

## 5. Quick Revision Cheat Sheet

### Interaction patterns

| If you need... | Use | Why |
|---|---|---|
| A one-time fetch (login, APIs, get time) | **Request-Response** | Simple. Connection closes after the response |
| Updates for a **finite, predictable** time (e.g., 10 sec SLA) | **Short Polling** | Periodic calls that stop after a point |
| Near real-time, sockets not possible | **Long Polling** | Server holds the request until data is ready |
| **One-way** real-time from server (stocks, notifications, live score) | **SSE** | Built in, low complexity, long-lived HTTP connection |
| **Two-way** real-time (chat, games, live comments, collaboration) | **WebSockets** | HTTP handshake, then switch to `ws`/`wss`, duplex |
| Live audio/video calls, no server in middle | **WebRTC** | Uses UDP, faster, some packet loss is fine |

### Security attacks

| Attack | What happens | Main defenses |
|---|---|---|
| **XSS** (stored, reflected, DOM) | Attacker's script runs in your page as trusted code | Use React (auto-escape), avoid `dangerouslySetInnerHTML`, **sanitize**, **HTTP-only cookies**, **CSP**, no tokens in local storage |
| **CSRF** | A malicious site makes your browser send an authenticated request | **SameSite `Lax`/`Strict`** cookies, CSRF token (cookies prove identity, tokens prove intent), double submit cookie |
| **Clickjacking** | Your site loaded in an invisible iframe, user clicks a fake button | **`X-Frame-Options`**, **CSP `frame-ancestors`**, frame busting |

### YouTube system design takeaways

- **List functional requirements broadly**, but **only include features you can explain**
- Non-functional requirements are **largely common across systems**
- **Player:** ask about the **timeline** first. Short timeline: use a third-party player. No time constraint: build in-house (UI, data source, security). Think chunks, multiple resolutions, HLS/DASH
- **Hover thumbnails:** **one sprite image** with all thumbnails, and the client picks the right one via coordinates
- **Live comments:** it is a group chat, so go with **WebSockets**
- **Regular comments:** **don't make them live**. Fetch on demand and show a "new comments" tooltip
- **Always remember:** there is no right or wrong in system design. It depends on the **use case**, so ask questions and justify your choice

[Back to top](#system-design-session-guide)
