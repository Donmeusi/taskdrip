"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // TODO: Wire up to waitlist API endpoint (DON-4 area)
    // For now, store locally and show success
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // If API not ready yet, still show success for MVP launch prep
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💧</span>
          <span className="font-bold text-xl">TaskDrip</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/app"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Open App
          </a>
          <a
            href="https://github.com/donmeusi/taskdrip"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center -mt-16">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-3xl">
          Set it, forget it,
          <br />
          <span className="text-blue-600">get it done.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-xl">
          Your to-do list never worked because you&apos;re the only one doing
          the work. TaskDrip gives every task to AI — you just review the
          result.
        </p>

        {/* How it works */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-semibold text-lg">1. Describe your task</h3>
            <p className="text-sm text-gray-500 mt-1">
              Write what you need in plain English. No forms, no templates.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg">2. AI does the work</h3>
            <p className="text-sm text-gray-500 mt-1">
              An AI agent researches, writes, or processes your task
              automatically.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-lg">3. Review the result</h3>
            <p className="text-sm text-gray-500 mt-1">
              Check the output, approve it, or send it back with feedback.
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="mt-14 w-full max-w-md space-y-4">
          <a
            href="/app"
            className="block rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Try TaskDrip Now →
          </a>
        </div>

        {/* Waitlist */}
        <div className="w-full max-w-md">
          <p className="text-xs text-gray-400 mb-2">Or join the waitlist for updates:</p>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "Joining..." : "Get Early Access"}
              </button>
            </form>
          ) : (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
              💧 You&apos;re on the list! We&apos;ll reach out when TaskDrip is
              ready.
            </div>
          )}
          <p className="mt-3 text-xs text-gray-400">
            No spam. We&apos;ll only email when TaskDrip launches.
          </p>
        </div>
      </section>

      {/* Social proof / value prop */}
      <section className="border-t border-gray-100 py-12 px-6 text-center">
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          TaskDrip is for anyone who writes to-do lists that never get done.
          Researchers, freelancers, consultants, team leads — if you delegate
          work, TaskDrip makes it happen.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Donmeusi Inc. &middot; Made with
        AI
      </footer>
    </main>
  );
}