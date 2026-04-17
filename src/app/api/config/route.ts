import { NextResponse } from "next/server";
import { handleCorsPreflightRequest, methodNotAllowed, withCors } from "@/lib/api";
import { isDemoMode } from "@/lib/demo-mode";
import type { NextRequest } from "next/server";

export async function OPTIONS(request: NextRequest) {
  const preflight = handleCorsPreflightRequest(request);
  if (preflight) return preflight;
  return methodNotAllowed(["GET"]);
}

/**
 * Returns client-side configuration, including demo mode status.
 * This is NOT sensitive — demo mode is a UI concern, not a security boundary.
 */
export async function GET() {
  return withCors(
    NextResponse.json({
      demoMode: isDemoMode(),
    })
  );
}