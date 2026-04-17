import { NextRequest, NextResponse } from "next/server";
import { db, getTaskById, deleteTask } from "@/db";
import { notFound, internalError, badRequest, methodNotAllowed, handleCorsPreflightRequest, withCors } from "@/lib/api";

export async function OPTIONS(request: NextRequest) {
  const preflight = handleCorsPreflightRequest(request);
  if (preflight) return preflight;
  return methodNotAllowed(["GET"]);
}

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

    return withCors(NextResponse.json(task));
  } catch (error) {
    console.error("[GET /api/tasks/[id]] Error:", error);
    return internalError();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return badRequest("Invalid task ID");
    }

    const task = getTaskById(db, id);
    if (!task) {
      return notFound("Task not found");
    }

    deleteTask(db, id);
    return withCors(NextResponse.json({ message: "Task deleted" }));
  } catch (error) {
    console.error("[DELETE /api/tasks/[id]] Error:", error);
    return internalError();
  }
}