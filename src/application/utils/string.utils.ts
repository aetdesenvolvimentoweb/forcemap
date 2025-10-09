/**
 * Utility functions for string sanitization and validation
 */

/**
 * Sanitizes a string by removing potentially dangerous characters and normalizing whitespace
 * Note: This is a general sanitizer. For names, use sanitizeName() to preserve apostrophes.
 *
 * @param value - The string to sanitize
 * @returns The sanitized string
 */
export const sanitizeString = (value: string): string => {
  if (!value || typeof value !== "string") return value;

  return value
    .trim()
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .replace(/[";\\]/g, "") // Remove quotes (except apostrophes) and backslashes
    .replace(/--/g, "") // Remove SQL comment indicators
    .replace(/\/\*/g, "") // Remove SQL block comment start
    .replace(/\*\//g, ""); // Remove SQL block comment end
};

/**
 * Sanitizes a name string while preserving apostrophes for names like "O'Brien"
 * Removes dangerous characters but keeps valid name punctuation
 *
 * @param value - The name string to sanitize
 * @returns The sanitized name
 */
export const sanitizeName = (value: string): string => {
  if (!value || typeof value !== "string") return value;

  return value
    .trim()
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .replace(/[";\\]/g, "") // Remove quotes and backslashes (apostrophes are preserved)
    .replace(/--/g, "") // Remove SQL comment indicators
    .replace(/\/\*/g, "") // Remove SQL block comment start
    .replace(/\*\//g, ""); // Remove SQL block comment end
};

/**
 * Sanitizes a password by removing only control characters while preserving special chars
 *
 * @param value - The password string to sanitize
 * @returns The sanitized password
 */
export const sanitizePassword = (value: string): string => {
  if (!value || typeof value !== "string") return value;

  return (
    value
      .trim()
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f\u007f]/g, "") // Remove control characters
      // eslint-disable-next-line no-control-regex
      .replace(/\u0000/g, "") // Remove null bytes
  );
};

/**
 * Sanitizes a number input by converting string to number if needed
 *
 * @param value - The number or string to sanitize
 * @returns The sanitized number
 */
export const sanitizeNumber = (value: number | string): number => {
  return typeof value === "string" ? parseFloat(value) : value;
};
