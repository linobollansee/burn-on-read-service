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
