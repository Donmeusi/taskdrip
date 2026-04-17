import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tasks",
  description:
    "Create and manage AI-powered tasks. Describe what you need done, and TaskDrip's AI agent will do the work for you.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}