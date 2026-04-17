import { notFound, methodNotAllowed, handleCorsPreflightRequest } from "@/lib/api";
import type { NextRequest } from "next/server";

/**
 * Catch-all route for unmatched API paths.
 * Returns a proper JSON 404 instead of Next.js's default HTML page.
 */
export async function OPTIONS(request: NextRequest) {
  const preflight = handleCorsPreflightRequest(request);
  if (preflight) return preflight;
  return methodNotAllowed([]);
}

export async function GET() {
  return notFound("API endpoint not found");
}

export async function POST() {
  return notFound("API endpoint not found");
}

export async function PUT() {
  return notFound("API endpoint not found");
}

export async function DELETE() {
  return notFound("API endpoint not found");
}

export async function PATCH() {
  return notFound("API endpoint not found");
}