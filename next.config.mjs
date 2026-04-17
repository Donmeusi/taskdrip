/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native C addon — it must be externalized from
  // the Next.js bundler so Vercel's Node.js runtime loads it natively.
  // Without this, the build may fail or the module may not initialise
  // correctly in the serverless environment.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;