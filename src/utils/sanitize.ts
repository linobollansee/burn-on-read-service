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
