import { NextResponse } from "next/server";

export async function GET() {
  // Health check endpoint for uptime monitoring (Vercel, UptimeRobot, etc.)
  // Returns 200 if the app is responsive.
  // Post-MVP: Add DB connectivity check, OpenAI API status, etc.
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
  });
}