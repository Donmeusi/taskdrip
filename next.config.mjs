/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native C addon — must be externalized for Vercel serverless.
  // The SQLite DB is ephemeral on Vercel (no persistent filesystem), but the module
  // must still be resolvable at build time. Remove this after migrating to Postgres.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;