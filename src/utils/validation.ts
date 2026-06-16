import * as zod from "zod";

/**
 * Shared validation schemas and helpers for Quick Send
 */

export const emailSchema = zod
  .string()
  .email("Please enter a valid email address");

export const passwordSchema = zod
  .string()
  .min(6, "Password must be at least 6 characters");

export const mfaCodeSchema = zod
  .string()
  .length(6, "MFA code must be 6 digits")
  .regex(/^\d+$/, "MFA code must contain only digits");

export const phoneSchema = zod
  .string()
  .min(7, "Phone number must be at least 7 digits")
  .regex(/^\+?[\d\s-]+$/, "Please enter a valid phone number");

export const nameSchema = zod
  .string()
  .min(1, "This field is required")
  .max(100, "Must be 100 characters or fewer");

/**
 * Validates an email address (standalone helper)
 */
export const isValidEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

/**
 * Validates a password meets minimum requirements
 */
export const isValidPassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};
