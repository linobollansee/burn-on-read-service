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
  console.log(`🔥 Burn on Read service running on http://localhost:${PORT}`);
});
