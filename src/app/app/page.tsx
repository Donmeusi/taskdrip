"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────

interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  resultText: string | null;
  createdAt: string;
  updatedAt: string;
}

type View = "list" | "create" | "detail";

// ─── Status Badge ───────────────────────────────────

function StatusBadge({ status }: { status: Task["status"] }) {
  const styles: Record<Task["status"], string> = {
    pending:
      "bg-yellow-100 text-yellow-800 border-yellow-200",
    in_progress:
      "bg-blue-100 text-blue-800 border-blue-200",
    completed:
      "bg-green-100 text-green-800 border-green-200",
    failed:
      "bg-red-100 text-red-800 border-red-200",
  };
  const labels: Record<Task["status"], string> = {
    pending: "Pending",
    in_progress: "Processing",
    completed: "Done",
    failed: "Failed",
  };
  const dots: Record<Task["status"], string> = {
    pending: "🟡",
    in_progress: "🔵",
    completed: "🟢",
    failed: "🔴",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      <span className="text-[10px]">{dots[status]}</span>
      {labels[status]}
    </span>
  );
}

// ─── Time Ago ───────────────────────────────────────

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── TaskDripApp ────────────────────────────────────

export default function TaskDripApp() {
  // MVP: single user mode — use a fixed email
  const USER_EMAIL = "user@taskdrip.app";
  const USER_NAME = "TaskDrip User";

  const [view, setView] = useState<View>("list");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // For task detail polling
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Fetch tasks ─────────────────────────────────

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks?userEmail=${encodeURIComponent(USER_EMAIL)}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data.tasks);
      setError(null);
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Fetch single task ──────────────────────────

  const fetchTask = useCallback(async (id: string): Promise<Task | null> => {
    try {
      const res = await fetch(`/api/tasks/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  // ─── Poll selected task ─────────────────────────

  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    if (view === "detail" && selectedTask && (selectedTask.status === "pending" || selectedTask.status === "in_progress")) {
      pollingRef.current = setInterval(async () => {
        const updated = await fetchTask(selectedTask.id);
        if (updated) {
          setSelectedTask(updated);
          // Also refresh the list
          fetchTasks();
        }
      }, 3000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [view, selectedTask?.id, selectedTask?.status, fetchTask, fetchTasks]);

  // ─── Initial load ────────────────────────────────

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ─── Auto-refresh list every 10s ────────────────

  useEffect(() => {
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  // ─── Create task ─────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDesc.trim(),
          userEmail: USER_EMAIL,
          userName: USER_NAME,
        }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const data = await res.json();

      // Auto-trigger processing
      fetch(`/api/tasks/${data.task.id}/process`, { method: "POST" }).catch(
        () => {}
      );

      setFormTitle("");
      setFormDesc("");
      await fetchTasks();
      setView("list");
    } catch {
      setError("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Open task detail ───────────────────────────

  const openTask = async (task: Task) => {
    setSelectedTask(task);
    setView("detail");
  };

  // ─── Retry failed task ──────────────────────────

  const retryTask = async (task: Task) => {
    try {
      await fetch(`/api/tasks/${task.id}/process`, { method: "POST" });
      const updated = await fetchTask(task.id);
      if (updated) setSelectedTask(updated);
      fetchTasks();
    } catch {
      // silently fail
    }
  };

  // ─── Render ─────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => {
              setView("list");
              setSelectedTask(null);
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">💧</span>
            <span className="font-bold text-lg">TaskDrip</span>
          </button>
          <div className="flex items-center gap-3">
            {view !== "create" && (
              <button
                onClick={() => {
                  setView("create");
                  setFormTitle("");
                  setFormDesc("");
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                + New Task
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
              <span className="text-sm text-gray-500">{tasks.length} tasks</span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-gray-400">
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-5xl mb-4">📝</div>
                <h2 className="text-lg font-semibold text-gray-700">
                  No tasks yet
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Create your first task and let AI handle it.
                </p>
                <button
                  onClick={() => {
                    setView("create");
                    setFormTitle("");
                    setFormDesc("");
                  }}
                  className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  + Create First Task
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => openTask(task)}
                    className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {task.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <StatusBadge status={task.status} />
                        <span className="text-xs text-gray-400">
                          {timeAgo(task.createdAt)}
                        </span>
                      </div>
                    </div>
                    {task.status === "completed" && task.resultText && (
                      <div className="mt-3 rounded-lg bg-green-50 border border-green-100 p-3 text-sm text-green-800 line-clamp-2">
                        {task.resultText}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE VIEW ── */}
        {view === "create" && (
          <div>
            <button
              onClick={() => setView("list")}
              className="mb-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              &larr; Back to tasks
            </button>
            <h1 className="mb-6 text-2xl font-bold text-gray-900">
              New Task
            </h1>

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  What do you need done?
                </label>
                <input
                  id="title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Write a blog post about AI agents"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Details
                </label>
                <textarea
                  id="description"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe what you want in more detail. The more context you give, the better the result."
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !formTitle.trim() || !formDesc.trim()}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Creating..." : "Create Task"}
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── DETAIL VIEW ── */}
        {view === "detail" && selectedTask && (
          <div>
            <button
              onClick={() => {
                setView("list");
                setSelectedTask(null);
              }}
              className="mb-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              &larr; Back to tasks
            </button>

            <div className="rounded-xl border border-gray-200 bg-white">
              {/* Header */}
              <div className="border-b border-gray-100 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    {selectedTask.title}
                  </h1>
                  <StatusBadge status={selectedTask.status} />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Created {timeAgo(selectedTask.createdAt)}
                </p>
              </div>

              {/* Description */}
              <div className="border-b border-gray-100 p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Description
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedTask.description}
                </p>
              </div>

              {/* Result */}
              <div className="p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Result
                </h2>
                {selectedTask.status === "pending" && (
                  <div className="flex items-center gap-2 py-8 text-gray-400">
                    <div className="animate-pulse">⏳</div>
                    <span>Waiting to be processed...</span>
                  </div>
                )}
                {selectedTask.status === "in_progress" && (
                  <div className="flex items-center gap-2 py-8 text-blue-500">
                    <div className="animate-spin">⚙️</div>
                    <span>AI is working on this task...</span>
                  </div>
                )}
                {selectedTask.status === "completed" && selectedTask.resultText && (
                  <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-sm text-green-900 whitespace-pre-wrap">
                    {selectedTask.resultText}
                  </div>
                )}
                {selectedTask.status === "failed" && (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-800 whitespace-pre-wrap">
                      {selectedTask.resultText || "Task processing failed."}
                    </div>
                    <button
                      onClick={() => retryTask(selectedTask)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      🔄 Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}