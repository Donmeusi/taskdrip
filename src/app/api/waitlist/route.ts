import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  internalError,
  tooManyRequests,
  isRateLimited,
  validateWaitlistSignup,
  safeParseJson,
} from "@/lib/api";

// Simple waitlist storage — uses in-memory array.
// Post-MVP: Migrate to database table (see DON-3).

// In-memory store (ephemeral on Vercel serverless)
const waitlist: string[] = [];

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (critical for signup endpoints to prevent abuse)
    const clientIdentifier = request.headers.get("x-forwarded-for") || "unknown";
    if (await isRateLimited(`waitlist:${clientIdentifier}`)) {
      return tooManyRequests(60);
    }

    // Safely parse JSON body
    const { data, error: parseError } = await safeParseJson(request);
    if (parseError) return parseError;

    // Validate input
    const validation = validateWaitlistSignup(data);
    if (!validation.valid) {
      return badRequest(validation.error!);
    }

    const { email } = data as { email: string };

    // Normalize email to lowercase for dedup
    const normalizedEmail = email.toLowerCase();

    // Check for duplicates (in-memory)
    if (waitlist.includes(normalizedEmail)) {
      return NextResponse.json(
        { message: "Already on the waitlist!" },
        { status: 200 }
      );
    }

    // Store (TODO: persist to database via Drizzle)
    waitlist.push(normalizedEmail);

    console.log(
      `[Waitlist] New signup: ${normalizedEmail} (total: ${waitlist.length})`
    );

    return NextResponse.json(
      { message: "Added to waitlist", position: waitlist.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/waitlist] Error:", error);
    return internalError();
  }
}

export async function GET() {
  // Admin endpoint — TODO: add authentication post-MVP
  return NextResponse.json({
    count: waitlist.length,
    emails: waitlist,
  });
}