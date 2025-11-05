# Guide: Building a Burn on Read Service

This guide walks you through implementing the burn-on-read service challenge step by step.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Installing Dependencies](#installing-dependencies)
3. [Project Structure](#project-structure)
4. [Setting Up TypeScript & Express](#setting-up-typescript--express)
5. [Configuring Nunjucks Templates](#configuring-nunjucks-templates)
6. [Creating the Frontend](#creating-the-frontend)
7. [Implementing the Backend Logic](#implementing-the-backend-logic)
8. [Input Sanitization](#input-sanitization)
9. [File Management](#file-management)
10. [Testing Your Application](#testing-your-application)

## Project Setup

### Initialize the Project

```bash
mkdir burn-on-read-service
cd burn-on-read-service
npm init -y
git init
```

### Create a `.gitignore` File

```
node_modules/
dist/
messages/
*.log
.env
```

## Installing Dependencies

### Production Dependencies

```bash
npm install express nunjucks uuid
npm install validator  # for input sanitization
```

### Development Dependencies

```bash
npm install --save-dev typescript @types/node @types/express @types/uuid @types/validator @types/nunjucks
npm install --save-dev ts-node nodemon
```

> **Note**: Make sure to install `@types/nunjucks` to avoid TypeScript errors.

## Project Structure

Create the following folder structure:

```
burn-on-read-service/
├── src/
│   ├── app.ts              # Main application file
│   ├── routes/
│   │   └── index.ts        # Route handlers
│   └── utils/
│       ├── sanitize.ts     # Input sanitization utilities
│       └── fileManager.ts  # File operations
├── views/
│   ├── index.njk           # Home page with form
│   ├── success.njk         # Success page with shareable link
│   └── message.njk         # Message display page
├── public/
│   └── styles/
│       └── main.css        # Empty file (using 100% Pico.css)
├── messages/               # Directory for stored messages (auto-created)
├── tsconfig.json
├── package.json
└── README.md
```

## Setting Up TypeScript & Express

### Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Update `package.json` Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  }
}
```

### Create `src/app.ts`

```typescript
import express, { Request, Response } from "express";
import nunjucks from "nunjucks";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure messages directory exists
const messagesDir = path.join(__dirname, "../messages");
if (!fs.existsSync(messagesDir)) {
  fs.mkdirSync(messagesDir);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Configure Nunjucks
nunjucks.configure(path.join(__dirname, "../views"), {
  autoescape: true,
  express: app,
});

// Routes
app.get("/", (req: Request, res: Response) => {
  res.render("index.njk");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

## Configuring Nunjucks Templates

> **Design Philosophy**: This project uses **100% Pico.css** with no custom CSS. The templates use minimal semantic wrappers to avoid spacing issues with Pico.css's opinionated styling. We rely on Pico.css's automatic styling of HTML elements for a clean, professional look.

### Create `views/index.njk` (Home Page)

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

### Create `views/success.njk` (Success Page)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Link Created - Burn on Read</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
    />
    <link rel="stylesheet" href="/styles/main.css" />
  </head>
  <body>
    <main class="container">
      <h1>✅ Link Created Successfully!</h1>

      <p>
        Share this link with your recipient. It will be destroyed after one
        view:
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
  </body>
</html>
```

### Create `views/message.njk` (Message Display)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Secret Message - Burn on Read</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
    />
    <link rel="stylesheet" href="/styles/main.css" />
  </head>
  <body>
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
  </body>
</html>
```

## Creating the Frontend

### Pico.css Styling Approach

This project uses **100% Pico.css** with no custom CSS. Here's why:

**What Pico.css Provides Automatically:**

- Beautiful typography and spacing
- Responsive form controls (inputs, textareas, buttons)
- Mobile-first responsive design
- Dark mode support
- Semantic HTML styling

**Design Decisions:**

- ❌ No `<article>` wrappers (creates unwanted card styling)
- ❌ No `<header>` wrappers (adds excessive margins)
- ❌ No `<footer>` inside content (negative margins cause overlap)
- ✅ Direct HTML elements styled by Pico.css
- ✅ `<blockquote>` for message display (automatic styling)
- ✅ Minimal nesting for clean spacing

### Create `public/styles/main.css`

```css
/* Relying entirely on PICO.CSS - no custom styles */
```

That's it! The empty CSS file is included for future customization if needed, but Pico.css handles all the styling.

## Implementing the Backend Logic

### Create `src/utils/sanitize.ts`

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

### Create `src/utils/fileManager.ts`

```typescript
import fs from "fs/promises";
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

export function isValidMessageId(messageId: string): boolean {
  // Validate UUID format to prevent path traversal attacks
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(messageId);
}
```

### Create `src/routes/index.ts`

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

### Update `src/app.ts` to Include Routes

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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Configure Nunjucks
nunjucks.configure(path.join(__dirname, "../views"), {
  autoescape: true,
  express: app,
});

// Use routes
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

## Input Sanitization

Input sanitization is crucial to prevent security vulnerabilities:

### Key Sanitization Steps

1. **Trim whitespace**: Remove leading/trailing spaces
2. **Escape HTML**: Prevent XSS attacks by escaping special characters
3. **Length validation**: Limit message size to prevent abuse
4. **Type checking**: Ensure input is a string
5. **UUID validation**: Prevent path traversal attacks in file access

### Security Considerations

- Always use `validator.escape()` for user input
- Validate UUID format before file operations
- Use Nunjucks' `autoescape: true` setting
- Never trust user input directly

## File Management

### Best Practices

1. **Unique identifiers**: Use UUIDs for message files
2. **Atomic operations**: Read and delete in one operation
3. **Error handling**: Handle missing files gracefully
4. **Directory security**: Store files outside public directory
5. **Validation**: Always validate message IDs before file access

### File Lifecycle

1. User submits message → Sanitize input
2. Generate UUID → Create file in `/messages/`
3. Return shareable link with UUID
4. User opens link → Read file content
5. Immediately delete file → Render message
6. Subsequent access → Show "message not found"

## Testing Your Application

### Running the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Manual Testing Checklist

- [ ] Create a message with normal text
- [ ] Verify link is generated and copyable
- [ ] Open the link in a new browser/incognito window
- [ ] Verify message displays correctly
- [ ] Try opening the same link again → Should show "not found"
- [ ] Test with special characters: `<script>alert('XSS')</script>`
- [ ] Verify HTML is escaped in display
- [ ] Test with very long messages
- [ ] Test with empty messages (should fail validation)
- [ ] Test with invalid message IDs in URL

### Production Build

```bash
npm run build
npm start
```

## Additional Enhancements (Optional)

### 1. Expiration Time

Add automatic deletion after X hours even if not read:

```typescript
// Add expiration timestamp to filename or use a cleanup job
```

### 2. Read Receipt

Notify sender when message is read (requires email/webhook).

### 3. Password Protection

Add optional password protection for messages.

### 4. File Upload Support

Extend to support file uploads, not just text.

### 5. View Count Limit

Allow multiple views with a maximum count.

### 6. Analytics

Track creation/read statistics (anonymously).

## Troubleshooting

### Issue: Module not found errors

**Solution**: Make sure all dependencies are installed:

```bash
npm install
```

### Issue: TypeScript compilation errors

**Solution**: Check `tsconfig.json` configuration and file paths.

### Issue: Messages not deleting

**Solution**: Check file permissions on the `messages/` directory.

### Issue: Styles not loading

**Solution**: Verify `express.static` middleware is configured correctly.

## Design Decisions & Best Practices

### Why 100% Pico.css (No Custom CSS)?

This project demonstrates the power of Pico.css by using **zero custom CSS**. Here's why:

**Pico.css Provides:**

- ✅ Beautiful typography and spacing out of the box
- ✅ Responsive form controls (inputs, textareas, buttons)
- ✅ Mobile-first responsive design
- ✅ Built-in dark mode support
- ✅ Automatic semantic HTML styling
- ✅ No CSS classes needed (except `.container`)

**Our Approach:**

- Use minimal semantic wrappers
- Avoid `<article>`, `<header>`, `<footer>` inside content (causes spacing issues)
- Let Pico.css style base HTML elements directly
- Use `<blockquote>` for message display (styled automatically)
- Use `<p><small>` for warnings (proper spacing)

### Common Pico.css Pitfalls Avoided

**❌ Problem: Footer Overlapping**

```html
<!-- DON'T: footer inside article has negative margin -->
<article>
  <p>Content</p>
  <footer><small>Warning</small></footer>
  <!-- Overlaps next element! -->
  <button>Click</button>
</article>
```

**✅ Solution: Use paragraph instead**

```html
<p>Content</p>
<p><small>Warning</small></p>
<!-- Proper spacing -->
<button>Click</button>
```

**❌ Problem: Excessive Nesting**

```html
<!-- DON'T: Multiple semantic wrappers add compound spacing -->
<article>
  <header><h1>Title</h1></header>
  <!-- Extra margins stack up -->
</article>
```

**✅ Solution: Direct elements**

```html
<h1>Title</h1>
<!-- Clean, properly spaced by Pico.css -->
```

## Conclusion

You now have a complete burn-on-read service! The key concepts covered:

- ✅ Express.js with TypeScript
- ✅ Nunjucks templating
- ✅ Input sanitization
- ✅ File-based storage
- ✅ Automatic deletion after read
- ✅ Secure link generation
- ✅ Responsive UI with 100% Pico.css (no custom CSS!)
- ✅ Clean, minimal HTML structure

Happy coding! 🔥
