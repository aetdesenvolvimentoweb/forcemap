/**
 * Utility functions for string sanitization and validation
 */

/**
 * Sanitizes a string by removing potentially dangerous characters and normalizing whitespace
 *
 * @param value - The string to sanitize
 * @returns The sanitized string
 */
export const sanitizeString = (value: string): string => {
  if (!value || typeof value !== "string") return value;

  return value
    .trim()
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .replace(/['";\\]/g, "") // Remove quotes and backslashes
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
