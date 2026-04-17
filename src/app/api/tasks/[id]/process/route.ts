import { NextRequest, NextResponse } from "next/server";
import { db, getTaskById, updateTaskStatus, updateTaskResult, updateTaskError } from "@/db";
import { processTaskWithAI } from "@/lib/openai";
import { badRequest, notFound, internalError, tooManyRequests, isRateLimited } from "@/lib/api";

// Extend max duration for OpenAI API calls on Vercel (default is 10s on Hobby)
export const maxDuration = 30;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate task ID
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return badRequest("Invalid task ID");
    }

    // Rate limiting (placeholder — no-op for MVP, but critical for AI endpoints)
    const clientIdentifier = request.headers.get("x-forwarded-for") || "unknown";
    if (await isRateLimited(`process:${clientIdentifier}`)) {
      return tooManyRequests(30);
    }

    const task = getTaskById(db, id);

    if (!task) {
      return notFound("Task not found");
    }

    // Prevent re-processing of completed tasks
    if (task.status === "completed") {
      return NextResponse.json(
        { error: "Task already completed. Create a new task instead.", task },
        { status: 409 }
      );
    }

    // If already in_progress, return current state (idempotent)
    if (task.status === "in_progress") {
      return NextResponse.json(task);
    }

    // Mark as in_progress
    updateTaskStatus(db, id, "in_progress");

    // Call OpenAI to process the task
    const result = await processTaskWithAI(task.title, task.description);

    if (result.success && result.resultText) {
      const updated = updateTaskResult(db, id, result.resultText);
      return NextResponse.json(updated);
    } else {
      const updated = updateTaskError(
        db,
        id,
        result.error || "AI processing failed with unknown error"
      );
      return NextResponse.json(
        { error: result.error, task: updated },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("[POST /api/tasks/[id]/process] Error:", error);
    return internalError();
  }
}