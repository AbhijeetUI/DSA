# The Critical Rendering Path (The Rendering Pipeline)

The **Critical Rendering Path (CRP)** is the exact sequence of events a browser goes through to convert raw HTML, CSS, and JavaScript into actual pixels on your screen.

---

## The 6 Steps of the Pipeline
### 1. HTML Parsing & The DOM
When you request a webpage, the server sends a stream of raw bytes (HTML) over the network. Because the browser cannot use raw text to render a page, it must parse it into something it understands.

* **HTML Parsing:** The browser reads the bytes, converts them into characters (based on encoding like UTF-8), identifies tokens (tags like `<html>`, `<body>`, `<p>`), and converts those tokens into object nodes.
* **DOM (Document Object Model):** The browser links these object nodes into a tree structure called the DOM. The DOM represents the hierarchy of your content (e.g., a `<li>` node sits inside a `<ul>` node).

> ⚠️ **Important Note:** HTML parsing is **streamed**. The browser doesn't wait for the entire HTML file to download; it builds the DOM incrementally as chunks of data arrive. However, script tags (`<script>`) can block this parsing unless marked with `async` or `defer`.

### 2. CSS Parsing & The CSSOM
While building the DOM, the browser will encounter stylesheet links (`<link rel="stylesheet">`) or `<style>` tags.

* **CSS Parsing:** The browser downloads and processes the CSS rules. Just like HTML, it converts raw CSS text into a structured tree.
* **CSSOM (CSS Object Model):** This is the tree map of all the styles that need to be applied to the page. It captures inheritance—for example, if you set `font-family: sans-serif` on the `<body>`, the CSSOM ensures all child elements inherit that font unless overridden.

> ⚠️ **Important Note:** Unlike HTML parsing, CSS parsing is **render-blocking**. The browser cannot display the page until it has fully built the CSSOM, because displaying an unstyled page (Flash of Unstyled Content, or *FOUC*) creates a terrible user experience.

### 3. The Render Tree
Once the browser has independently built both the DOM and the CSSOM, it combines them together to create the **Render Tree**.

* The Render Tree is a map of everything that will **actually be visible** on the screen.
* It matches active CSS rules to their corresponding DOM elements.
* **What is excluded?** Elements that do not affect the visual output are left out. For example, metadata tags like `<head>` or `<script>` are excluded. Crucially, any element styled with `display: none` is completely left out of the Render Tree (whereas elements with `visibility: hidden` *are* included because they still take up physical space).

### 4. Layout (Reflow)
With the Render Tree constructed, the browser knows what elements to show and what their styles are, but it doesn't yet know their exact coordinates or sizes on the screen.

* **The Layout Stage:** The browser starts at the root of the Render Tree and calculates the exact geometry—the precise width, height, and position—of every single visible element relative to the device's viewport.
* This is why percentages (like `width: 50%`) or relative units (like `rem` or `vh`) are converted into absolute physical **pixels** on the screen during this stage.

### 5. Paint
Now that the browser knows the exact coordinates and dimensions of every element, it is time to fill in the visual details.

* **The Paint Stage:** The browser converts the layout boxes into actual pixels on the screen. This involves drawing backgrounds, colors, text, borders, shadows, and images.
* To make this efficient, modern browsers don't paint the entire page as a single massive image. Instead, they divide the page into separate **layers** (similar to layers in photo editing software like Photoshop). Elements that move frequently (like animations or video players) are often isolated onto their own layers so they don't force the whole page to repaint.

### 6. Composite
The final step of the pipeline is Compositing.

* At this stage, the browser takes all the individual layers created during the Paint phase and draws them onto the screen in the correct order (respecting properties like `z-index` and stacking contexts).
* This work is primarily handled by the **GPU (Graphics Processing Unit)** rather than the CPU, which makes scrolling, CSS transforms, and transitions incredibly smooth.

---

## Summary: What happens during a UI change?

When JavaScript changes the page, it triggers a ripple effect through this pipeline depending on what CSS property was modified:

| Trigger Type | Examples | Pipeline Execution | Performance Cost |
| :--- | :--- | :--- | :--- |
| **Layout Properties** | `width`, `margin`, `top`, `left` | Layout → Paint → Composite | 🔴 **High** (Expensive) |
| **Paint Properties** | `background-color`, `color`, `box-shadow` | Paint → Composite | 🟡 **Medium** |
| **Composite Properties**| `transform: translate()`, `opacity` | Composite Only | 🟢 **Low** (Fastest/Best) |

> 💡 **Performance Tip:** For smooth, 60fps web animations, always try to use properties that only trigger **Compositing** (`transform` and `opacity`) to completely bypass the expensive Layout and Paint stages.
