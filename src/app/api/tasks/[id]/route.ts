import { NextRequest, NextResponse } from "next/server";
import { db, getTaskById } from "@/db";
import { notFound, internalError, badRequest } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate task ID format (should be a non-empty string)
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return badRequest("Invalid task ID");
    }

    const task = getTaskById(db, id);

    if (!task) {
      return notFound("Task not found");
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("[GET /api/tasks/[id]] Error:", error);
    return internalError();
  }
}