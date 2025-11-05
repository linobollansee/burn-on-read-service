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
