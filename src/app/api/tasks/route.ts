import { NextRequest, NextResponse } from "next/server";
import { db, createUser, getUserByEmail, createTask, getTasksByUserId } from "@/db";
import {
  badRequest,
  internalError,
  validateTaskCreate,
  safeParseJson,
  isRateLimited,
  tooManyRequests,
} from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting check (placeholder — no-op for MVP)
    const clientIdentifier = request.headers.get("x-forwarded-for") || "unknown";
    if (await isRateLimited(`tasks:get:${clientIdentifier}`)) {
      return tooManyRequests();
    }

    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return badRequest("userEmail query parameter is required");
    }

    const user = getUserByEmail(db, userEmail);
    if (!user) {
      return NextResponse.json({ tasks: [] });
    }

    const tasks = getTasksByUserId(db, user.id);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("[GET /api/tasks] Error:", error);
    return internalError("Failed to list tasks");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check (placeholder — no-op for MVP)
    const clientIdentifier = request.headers.get("x-forwarded-for") || "unknown";
    if (await isRateLimited(`tasks:post:${clientIdentifier}`)) {
      return tooManyRequests();
    }

    // Safely parse JSON body
    const { data, error: parseError } = await safeParseJson(request);
    if (parseError) return parseError;

    // Validate input
    const validation = validateTaskCreate(data);
    if (!validation.valid) {
      return badRequest(validation.error!);
    }

    const { title, description, userEmail, userName } = data as Record<string, string>;

    // Find or create user (MVP: auto-provision users by email)
    let user = getUserByEmail(db, userEmail);
    if (!user) {
      const name = userName || userEmail.split("@")[0];
      user = createUser(db, { email: userEmail, name });
    }

    // Create task
    const task = createTask(db, {
      userId: user.id,
      title: title.trim(),
      description: description.trim(),
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tasks] Error:", error);
    return internalError("Failed to create task");
  }
}