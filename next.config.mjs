/** @type {import('next').NextConfig} */
const nextConfig = {
  // No serverExternalPackages needed — postgres.js is pure JS (no native addons).
  // Previously: serverExternalPackages: ["better-sqlite3"] (SQLite had a C addon)
};

export default nextConfig;