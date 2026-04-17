/**
 * Shared API utilities for input validation and response helpers.
 *
 * Centralizes validation logic and ensures all API errors return
 * consistent, user-friendly JSON responses (never raw stack traces).
 */

import { NextRequest, NextResponse } from "next/server";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

/** Maximum length for task titles */
export const MAX_TITLE_LENGTH = 200;

/** Maximum length for task descriptions */
export const MAX_DESCRIPTION_LENGTH = 5000;

/** Maximum length for user names */
export const MAX_NAME_LENGTH = 100;

/** Maximum length for email addresses */
export const MAX_EMAIL_LENGTH = 254; // RFC 5321

/** Simple email regex — good enough for MVP */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ──────────────────────────────────────────────
// Response helpers
// ──────────────────────────────────────────────

/** Return a JSON error response with the given status code */
export function errorResponse(
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  const body: Record<string, unknown> = { error: message };
  if (details) {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}

/** Return a 400 Bad Request */
export function badRequest(message: string, details?: Record<string, unknown>) {
  return errorResponse(message, 400, details);
}

/** Return a 404 Not Found */
export function notFound(message = "Resource not found") {
  return errorResponse(message, 404);
}

/** Return a 405 Method Not Allowed */
export function methodNotAllowed(allowed: string[]) {
  return NextResponse.json(
    { error: "Method not allowed", allowed },
    {
      status: 405,
      headers: { Allow: allowed.join(", ") },
    }
  );
}

/** Return a 422 Unprocessable Entity */
export function unprocessableEntity(message: string) {
  return errorResponse(message, 422);
}

/** Return a 429 Too Many Requests */
export function tooManyRequests(retryAfterSeconds = 60) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  );
}

/** Return a 500 Internal Server Error (never leaks stack traces) */
export function internalError(message = "Internal server error") {
  return errorResponse(message, 500);
}

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
  status?: number;
}

/** Validate a required string field */
function validateRequiredString(
  value: unknown,
  fieldName: string,
  maxLength: number
): ValidationResult {
  if (value === undefined || value === null) {
    return { valid: false, error: `${fieldName} is required`, status: 400 };
  }
  if (typeof value !== "string") {
    return {
      valid: false,
      error: `${fieldName} must be a string`,
      status: 400,
    };
  }
  if (value.trim().length === 0) {
    return {
      valid: false,
      error: `${fieldName} must not be empty`,
      status: 400,
    };
  }
  if (value.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be at most ${maxLength} characters (got ${value.length})`,
      status: 400,
    };
  }
  return { valid: true };
}

/** Validate an email address */
function validateEmail(email: unknown): ValidationResult {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required", status: 400 };
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    return {
      valid: false,
      error: `Email must be at most ${MAX_EMAIL_LENGTH} characters`,
      status: 400,
    };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: "Invalid email format", status: 400 };
  }
  return { valid: true };
}

/** Validate task creation payload */
export function validateTaskCreate(body: unknown): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, error: "Request body must be a JSON object", status: 400 };
  }

  const { title, description, userEmail, userName } = body as Record<string, unknown>;

  // Title
  const titleResult = validateRequiredString(title, "title", MAX_TITLE_LENGTH);
  if (!titleResult.valid) return titleResult;

  // Description
  const descResult = validateRequiredString(
    description,
    "description",
    MAX_DESCRIPTION_LENGTH
  );
  if (!descResult.valid) return descResult;

  // User email
  const emailResult = validateEmail(userEmail);
  if (!emailResult.valid) return emailResult;

  // User name (optional)
  if (userName !== undefined && userName !== null) {
    const nameResult = validateRequiredString(userName, "userName", MAX_NAME_LENGTH);
    if (!nameResult.valid) return nameResult;
  }

  return { valid: true };
}

/** Validate waitlist signup payload */
export function validateWaitlistSignup(body: unknown): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, error: "Request body must be a JSON object", status: 400 };
  }

  const { email } = body as Record<string, unknown>;
  return validateEmail(email);
}

// ──────────────────────────────────────────────
// Rate limiting hook (placeholder for future Vercel KV integration)
// ──────────────────────────────────────────────

/**
 * Rate limiting check.
 *
 * MVP: No-op (returns false = not rate limited).
 * Post-MVP: Integrate with Vercel KV + @upstash/ratelimit.
 *
 * Example future implementation:
 *   import { Ratelimit } from "@upstash/ratelimit";
 *   import { Redis } from "@upstash/redis";
 *   const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(10, "10 s") });
 *   const { success } = await ratelimit.limit(identifier);
 *   return !success;
 */
export async function isRateLimited(_identifier: string): Promise<boolean> {
  // TODO: Wire to Vercel KV + @upstash/ratelimit post-MVP
  return false;
}

// ──────────────────────────────────────────────
// CORS support (for future API consumers)
// ──────────────────────────────────────────────

/** CORS headers for API responses. Expand origins post-MVP as needed. */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

/**
 * Handle CORS preflight (OPTIONS) requests.
 * Returns null if this is not a preflight request.
 */
export function handleCorsPreflightRequest(
  request: NextRequest
): NextResponse | null {
  if (request.method !== "OPTIONS") return null;
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Apply CORS headers to any response.
 * Usage: return withCors(NextResponse.json(data))
 */
export function withCors(response: NextResponse): NextResponse {
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    newHeaders.set(key, value);
  }
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

// ──────────────────────────────────────────────
// Safe JSON parse for request bodies
// ──────────────────────────────────────────────

/**
 * Safely parse a request body as JSON.
 * Returns a structured error instead of throwing on invalid JSON.
 */
export async function safeParseJson(
  request: Request
): Promise<{ data?: unknown; error?: NextResponse }> {
  try {
    const text = await request.text();
    if (!text || text.trim().length === 0) {
      return {
        error: badRequest("Request body must not be empty"),
      };
    }
    const data = JSON.parse(text);
    return { data };
  } catch {
    return {
      error: badRequest("Request body must be valid JSON"),
    };
  }
}