# 🔥 Burn on Read Service

A secure, self-destructing message service built with Express.js and TypeScript. Send secret messages that automatically delete after being read once.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1-green.svg)](https://expressjs.com/)
[![Pico.css](https://img.shields.io/badge/Pico.css-2.0-orange.svg)](https://picocss.com/)

## ✨ Features

- 🔒 **Secure**: Messages are stored as files with UUID identifiers
- 🔥 **Self-Destructing**: Messages automatically delete after being viewed once
- 🎨 **Beautiful UI**: Clean, responsive design using 100% Pico.css (no custom CSS!)
- 🛡️ **XSS Protection**: Input sanitization prevents malicious code injection
- 📱 **Mobile-First**: Fully responsive design that works on all devices
- 🌙 **Dark Mode**: Automatic dark mode support via Pico.css
- ⚡ **Fast**: File-based storage for instant message delivery

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/linobollansee/burn-on-read-service.git
cd burn-on-read-service

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to use the application.

## 📖 Usage

1. **Create a Message**

   - Visit the homepage
   - Enter your secret message in the text area
   - Click "Create Secure Link"

2. **Share the Link**

   - Copy the generated unique link
   - Share it with your intended recipient via email, chat, etc.

3. **View Once**
   - Recipient clicks the link and views the message
   - Message is immediately and permanently deleted from the server
   - Subsequent attempts to access the link show "message not found"

## 🛠️ Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Project Structure

```
burn-on-read-service/
├── src/
│   ├── app.ts              # Express application setup
│   ├── routes/
│   │   └── index.ts        # Route handlers
│   └── utils/
│       ├── sanitize.ts     # Input sanitization
│       └── fileManager.ts  # File operations
├── views/
│   ├── index.njk           # Home page
│   ├── success.njk         # Link created page
│   └── message.njk         # Message display page
├── public/
│   └── styles/
│       └── main.css        # Empty (100% Pico.css)
├── messages/               # Auto-generated message storage
└── package.json
```

## 🎨 Design Philosophy

This project showcases **100% Pico.css** with zero custom CSS:

- **Minimal Semantic Containers**: Avoids unnecessary `<article>`, `<header>`, `<footer>` wrappers that cause spacing issues
- **Pure Pico.css Styling**: All elements styled automatically by Pico.css
- **Clean HTML**: Direct use of semantic HTML elements (`<h1>`, `<p>`, `<blockquote>`, `<button>`)
- **No CSS Classes**: Only uses Pico.css's `.container` class

See [GUIDE.md](GUIDE.md) for detailed implementation walkthrough.

## 🔒 Security Features

### Input Sanitization

- HTML escaping prevents XSS attacks
- Message length limits (10,000 characters)
- Type validation on all inputs

### File Security

- UUID-based filenames prevent path traversal
- Messages stored outside public directory
- Atomic read-and-delete operations
- UUID format validation before file access

### Nunjucks Safety

- `autoescape: true` prevents template injection
- All user input escaped before rendering

## 📚 Tech Stack

- **Backend**: Express.js 5.1 with TypeScript 5.9
- **Templating**: Nunjucks with auto-escaping
- **Styling**: Pico.css 2.0 (100% framework, 0% custom CSS)
- **Security**: Validator.js for input sanitization
- **Storage**: File-based with UUID identifiers
- **Dev Tools**: ts-node, nodemon for hot reload

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Pico.css](https://picocss.com/) for the beautiful classless CSS framework
- [Express.js](https://expressjs.com/) for the robust web framework
- Challenge inspiration from secure messaging services

## 📧 Contact

**Lino Bollansee** - [@linobollansee](https://github.com/linobollansee)

Project Link: [https://github.com/linobollansee/burn-on-read-service](https://github.com/linobollansee/burn-on-read-service)
